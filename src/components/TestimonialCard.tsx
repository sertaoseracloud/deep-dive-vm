// src/components/TestimonialCard.tsx
import React from "react";

export interface TestimonialData {
  id: string;
  initials: string;
  quote: string;
  name: string;
  role: string;
}

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.09 6.26H20l-4.95 3.64L16.9 18 12 14.27 7.1 18l1.85-6.1L4 8.26h5.91z" />
  </svg>
);

export const TestimonialCard: React.FC<{ data: TestimonialData }> = ({ data }) => (
  <div className="quote">
    <div className="stars">
      {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
    </div>
    <blockquote>{data.quote}</blockquote>
    <div className="quote-author">
      <div className="avatar">{data.initials}</div>
      <div className="who">
        <b>{data.name}</b>
        <small>{data.role}</small>
      </div>
    </div>
  </div>
);
