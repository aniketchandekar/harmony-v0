import React, { useState } from "react";

interface FeedbackProps {
  messageId: string;
  onFeedbackSubmit: (feedback: {
    messageId: string;
    rating: "good" | "bad";
    text?: string;
  }) => void;
}

export const Feedback: React.FC<FeedbackProps> = ({
  messageId,
  onFeedbackSubmit,
}) => {
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (rating: "good" | "bad") => {
    onFeedbackSubmit({ messageId, rating });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="text-sm text-gray-500">Thank you for your feedback!</p>
    );
  }

  return (
    <div className="flex items-center space-x-2 mt-2">
      <p className="text-sm text-gray-600">Was this response helpful?</p>
      <button
        onClick={() => handleFeedback("good")}
        className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
        aria-label="Good response"
      >
        👍
      </button>
      <button
        onClick={() => handleFeedback("bad")}
        className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
        aria-label="Bad response"
      >
        👎
      </button>
    </div>
  );
};
