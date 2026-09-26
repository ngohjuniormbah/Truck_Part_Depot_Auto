import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const subject = Deno.env.get('VAPID_SUBJECT');

    if (!publicKey || !privateKey || !subject) {
      throw new Error('VAPID environment variables are not configured.');
    }

    const { order } = await req.json();
    if (!order?.id) {
      return new Response(JSON.stringify({ error: 'Order information is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Only send a push for an order that actually exists in the database.
    // This prevents a client from generating a notification for a fake order.
    const { data: storedOrder, error: orderError } = await supabase
      .from('orders')
      .select('id, customer_name, total')
      .eq('id', order.id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!storedOrder) {
      return new Response(JSON.stringify({ error: 'Order was not found in the database.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: subscriptions, error: queryError } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, subscription');

    if (queryError) throw queryError;

    const body = `Order #${storedOrder.id} from ${storedOrder.customer_name || 'Customer'} for $${Number(storedOrder.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}.`;
    const payload = JSON.stringify({
      title: 'New Depot Order Received',
      body,
      orderId: order.id,
      url: '/admin/orders',
      tag: `order-${order.id}`,
    });

    let sent = 0;
    const staleIds: string[] = [];

    for (const row of subscriptions || []) {
      try {
        await webpush.sendNotification(row.subscription, payload);
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          staleIds.push(row.id);
        } else {
          console.error('Push send failed:', row.endpoint, error);
        }
      }
    }

    if (staleIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', staleIds);
    }

    return new Response(JSON.stringify({ success: true, sent, removed: staleIds.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('push-order error:', error);
    return new Response(JSON.stringify({ error: 'Unable to send order notifications.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
