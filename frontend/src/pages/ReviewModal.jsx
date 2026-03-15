import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase/config';

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleStarClick = (starIndex) => setRating(starIndex);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      await supabase.from('reviews').insert({
        user_id: user?.id || null,
        user_email: user?.email || 'anonymous',
        rating,
        feedback: feedback.trim(),
        created_at: new Date().toISOString()
      });

      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        onSubmit();
      }, 2000);

    } catch (error) {
      console.error('Error saving review:', error);
      alert('Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => onClose();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleSkip}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 z-10"
          >
            {!showThankYou ? (
              <>
                <button onClick={handleSkip} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#5B5FED] to-[#4B4FDD] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Experience</h2>
                  <p className="text-gray-500 text-sm">Help us improve Trade Predict</p>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="transform transition-transform hover:scale-110 focus:outline-none"
                    >
                      <svg
                        className={`w-12 h-12 transition-colors ${star <= (hoveredStar || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
                    <p className="text-sm font-medium text-gray-600">
                      {rating === 1 && "We're sorry to hear that 😞"}
                      {rating === 2 && "We can do better 😐"}
                      {rating === 3 && "Good to know 🙂"}
                      {rating === 4 && "Great! Thank you 😊"}
                      {rating === 5 && "Awesome! We're thrilled 🎉"}
                    </p>
                  </motion.div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tell us more (optional)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                    placeholder="What did you like or what can we improve?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5FED] focus:border-transparent outline-none resize-none"
                    rows="4"
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{feedback.length}/500</div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSkip} disabled={isSubmitting}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50">
                    Skip
                  </button>
                  <button onClick={handleSubmit} disabled={isSubmitting || rating === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#5B5FED] to-[#4B4FDD] text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                <p className="text-gray-600">Your feedback helps us improve Trade Predict</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;