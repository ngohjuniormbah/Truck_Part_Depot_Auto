/**
 * Browser notifications + Web Push for new customer orders.
 *
 * The admin dashboard creates a Web Push subscription after the user clicks
 * "Enable Push Notifications". The subscription is stored by the Supabase
 * Edge Function. When a checkout creates an order, the customer browser asks
 * the push-order Edge Function to fan the event out to subscribed admins.
 */
import { Order } from '../types';
import { getSupabase } from '../services/supabase';

const PUSH_PUBLIC_KEY =
  typeof import.meta !== 'undefined' ? String(import.meta.env.VITE_VAPID_PUBLIC_KEY || '') : '';

export const playOrderChime = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(784.0, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.12);
    gain2.gain.setValueAtTime(0.4, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.error('Audio chime error:', err);
  }
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration> => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('This browser does not support service workers.');
  }
  return navigator.serviceWorker.register('/sw.js', { scope: '/' });
};

export const isPushConfigured = (): boolean => Boolean(PUSH_PUBLIC_KEY);

export const enableNotificationsWithChime = async (): Promise<boolean> => {
  playOrderChime();

  if (typeof window === 'undefined' || !('Notification' in window)) {
    throw new Error('Browser notifications are not supported in this browser.');
  }

  if (!PUSH_PUBLIC_KEY) {
    throw new Error('Push notifications are not configured yet. Add VITE_VAPID_PUBLIC_KEY to the deployment environment.');
  }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

  if (permission !== 'granted') {
    try {
      localStorage.removeItem('tpd_notif_enabled');
    } catch {}
    return false;
  }

  const registration = await getServiceWorkerRegistration();
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUSH_PUBLIC_KEY),
    });
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured, so the push subscription cannot be saved.');
  }

  const { error } = await supabase.functions.invoke('push-subscribe', {
    body: { subscription: subscription.toJSON() },
  });
  if (error) throw error;

  try {
    localStorage.setItem('tpd_notif_enabled', 'true');
  } catch {}

  await registration.showNotification('Order Alerts Active', {
    body: 'Browser push notifications are enabled for new orders.',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'tpd-push-enabled',
  });

  return true;
};

export const sendBrowserNotification = async (
  title: string,
  options?: NotificationOptions,
  onClick?: () => void
): Promise<Notification | null> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const registration = await getServiceWorkerRegistration();
    await registration.showNotification(title, {
      icon: '/favicon.png',
      badge: '/favicon.png',
      ...options,
      data: { ...(options?.data as Record<string, unknown> | undefined) },
    });
    if (onClick) {
      // Service-worker notification clicks navigate to /admin by default.
      // Keep this callback for callers that still want a foreground action.
      window.focus();
      onClick();
    }
    return null;
  } catch (err) {
    console.warn('Failed to trigger service-worker notification:', err);
    try {
      return new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        ...options,
      });
    } catch {
      return null;
    }
  }
};

export const sendOrderPushNotification = async (order: Order): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.functions.invoke('push-order', {
      body: {
        order: {
          id: order.id,
          customerName: order.customerName,
          total: order.total,
          itemCount: order.items?.length || 0,
        },
      },
    });
    if (error) {
      console.warn('Order push notification failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Order push notification failed:', err);
    return false;
  }
};
