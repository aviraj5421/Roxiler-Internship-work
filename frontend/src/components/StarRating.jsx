import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Reusable Star Rating Component
 * @param {number} rating - Current rating (1-5, or decimal for display)
 * @param {boolean} interactive - Whether user can click to change rating
 * @param {function} onRate - Callback when user selects rating (1-5)
 * @param {number} size - Pixel size of star icon (default 20)
 * @param {boolean} showValue - Whether to display numeric rating next to stars
 */
const StarRating = ({
  rating = 0,
  interactive = false,
  onRate,
  size = 20,
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= Math.round(displayRating);
          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: interactive ? 'pointer' : 'default',
                color: isFilled ? '#f59e0b' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s ease, color 0.15s ease',
              }}
              className={interactive ? 'star-interactive' : ''}
              aria-label={`${starValue} of 5 stars`}
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'none'}
                stroke={isFilled ? '#f59e0b' : '#94a3b8'}
                strokeWidth={1.75}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginLeft: '0.25rem' }}>
          {Number(rating) > 0 ? Number(rating).toFixed(2) : 'No ratings'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
