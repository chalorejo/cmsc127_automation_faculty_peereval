import React from 'react';
import StarRating from './StarRating';

const Question = ({ type, question }) => {
  return (
    <div className="flex flex-col justify-items-center items-center w-full text-[#222]">
      {/* Question Label */}
      <label className="text-3 font-normal leading-[1.2] w-full">
        {question}<span className="text-[#F00]"> *</span>
      </label>

      {type === "likert" ? (
            <StarRating/>
      ) : (
        <textarea
          rows="4"
          className="w-full px-3 py-1 text-3 text-[#222] bg-[#E0E0E0] mt-3 rounded-md border-2  focus:ring-2 focus:ring-[#293D38] outline-none"
          placeholder="Type your answer here..."
        />
      )}
    </div>
  );
};

export default Question;
