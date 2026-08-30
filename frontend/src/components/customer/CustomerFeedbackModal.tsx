import React, { useState } from 'react';
import { Star, X, MessageSquare, ExternalLink, CheckCircle2, Heart, Award } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface CustomerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
}

export const CustomerFeedbackModal: React.FC<CustomerFeedbackModalProps> = ({
  isOpen,
  onClose,
  orderId = 'ORD-8901',
}) => {
  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onClose);
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    showToast('Thank you for your feedback!', 'success');
  };

  const handleGoogleReview = () => {
    // Open Google Review Link in a new tab
    window.open('https://search.google.com/local/writereview?placeid=ChIJN1t_tMoWrjsR00000000000', '_blank');
    showToast('+100 AURA Loyalty Points added to your account!', 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-aura-container border border-aura-gold/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-aura-slate hover:text-aura-ivory rounded-full hover:bg-aura-obsidian transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5 text-center">
            <div className="w-14 h-14 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl flex items-center justify-center mx-auto text-aura-gold shadow-lg">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-aura-ivory">Rate Your Experience</h3>
              <p className="text-xs text-aura-slate mt-1">Order #{orderId} • AURA Fine Dining</p>
            </div>

            {/* Star Rating Inputs */}
            <div className="flex items-center justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-all ${
                        active
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                          : 'text-aura-slate/40'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Conditional Rating Prompt */}
            {rating >= 4 ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-emerald-400 flex items-center justify-center space-x-1">
                  <Heart className="w-4 h-4 fill-emerald-400" />
                  <span>We're thrilled you enjoyed your dining!</span>
                </p>
                <p className="text-[11px] text-aura-slate">
                  Help us spread the word on Google Reviews &amp; get +100 Loyalty Points!
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-amber-400">
                  How can we make it better next time?
                </p>
                <p className="text-[11px] text-aura-slate">
                  Your feedback goes directly to our Executive Chef &amp; Manager.
                </p>
              </div>
            )}

            {/* Optional Comment Box */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-aura-gold uppercase tracking-wider flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Private Feedback / Remarks</span>
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts about food taste, ambiance, or service..."
                className="w-full p-3 bg-aura-obsidian border border-aura-border rounded-xl text-aura-ivory text-xs placeholder:text-aura-slate focus:outline-none focus:border-aura-gold h-20 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-xl animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-aura-ivory">Thank You!</h3>
              <p className="text-xs text-aura-slate">Your review has been recorded by AURA Management.</p>
            </div>

            {/* Google Review Trigger for 4+ Star Ratings */}
            {rating >= 4 && (
              <div className="p-4 bg-gradient-to-r from-aura-gold/15 via-aura-obsidian to-aura-gold/15 border border-aura-gold/40 rounded-2xl space-y-3 shadow-xl">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-aura-gold uppercase tracking-wider block">
                    🎁 Bonus Reward Offer
                  </span>
                  <p className="text-xs text-aura-ivory font-medium">
                    Post your review on Google to claim <strong className="text-aura-gold font-mono">+100 Loyalty Points</strong>!
                  </p>
                </div>

                <button
                  onClick={handleGoogleReview}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Post on Google Reviews</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-aura-obsidian border border-aura-border text-aura-slate hover:text-aura-ivory font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
