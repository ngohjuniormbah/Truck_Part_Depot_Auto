import React from 'react';
import { Star, ExternalLink, MessageSquare } from 'lucide-react';
import { Review } from '../types';

interface ReviewsPageProps {
  reviews?: Review[];
  onAddReview?: (review: Partial<Review>) => Promise<void>;
  onNavigate?: (page: any, initialTab?: any) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ reviews, onNavigate }) => {
  const displayedReviews = reviews || [];

  return (
    <div className="bg-black text-white py-16 sm:py-24 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Simple Clean Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
            Verified Customer Feedback
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Customer Reviews
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Real feedback and performance reports from diesel mechanics, fleet operators, and truck owners nationwide.
          </p>
        </div>

        {/* Customer Reviews Grid */}
        {displayedReviews.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/60 rounded-2xl border border-neutral-800 p-8 max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400">
              <MessageSquare className="w-7 h-7 text-neutral-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">
                No Reviews Published Yet
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                Customer reviews and verified feedback will appear here once published.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col space-y-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      rev.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={rev.author}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-sm font-bold text-white">
                    {rev.author}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-white text-white"
                    />
                  ))}
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {rev.reviewImage && (
                  <div className="rounded-xl overflow-hidden border border-neutral-800 mt-2">
                    <img
                      src={rev.reviewImage}
                      alt="Review attachment"
                      className="w-full h-40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {rev.link && (
                  <a
                    href={rev.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white underline underline-offset-4 hover:text-neutral-300 flex items-center gap-1.5 pt-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {rev.linkText || 'View Details / Source'}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
