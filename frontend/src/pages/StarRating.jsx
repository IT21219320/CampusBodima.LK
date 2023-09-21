import React, { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const StarRating = ({ rating, onChange }) => {
  const [hoveredRating, setHoveredRating] = useState(null);

  const handleStarClick = (newRating) => {
    onChange(newRating);
  };

  return (
    <div>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          onClick={() => handleStarClick(value)}
          onMouseEnter={() => setHoveredRating(value)}
          onMouseLeave={() => setHoveredRating(null)}
          style={{ cursor: 'pointer', marginRight: '20px',
          color: value <= (hoveredRating || rating) ? 'yellow' : 'black',
         }}
        >
          {value <= (hoveredRating || rating) ? <StarIcon /> : <StarBorderIcon />}
        </span>
      ))}
    </div>
  );
};

export default StarRating;