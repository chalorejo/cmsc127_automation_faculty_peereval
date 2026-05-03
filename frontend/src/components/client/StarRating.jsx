import React from 'react';

const StarIcon = ({ filled }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
                d="M12 2L14.81 8.62L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.19 8.62L12 2Z" 
                fill={filled ? "#E9B359" : "none"} 
                stroke={filled ? "#E9B359" : "#8E8E8E"} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );

const RatingComponent = () => {
            const items = [
                { id: 1, filled: true },
                { id: 2, filled: false },
                { id: 3, filled: false },
                { id: 4, filled: false }
            ];

            return (
                <div className="flex flex-col w-fit py-4 bg-red">
                    <div 
                        className="flex px-4 gap-8" 
                    >
                        {items.map(item => (
                            <div 
                                key={item.id} 
                                className="flex justify-center"
                                style={{ 
                                    width: '24px',
                                    fontSize: '12px', 
                                    lineHeight: '1.2',
                                    color: '#000000'
                                }}
                            >
                                {item.id}
                            </div>
                        ))}
                    </div>

                    {/* Stars Row with specific constraints */}
                    <div 
                        className="flex gap-[32px] mb-3 px-4 mt-1" 
                    >
                        {items.map(item => (
                            <div key={item.id} className="w-6 h-6 flex items-center justify-center">
                                <StarIcon filled={item.filled} />
                            </div>
                        ))}
                    </div>
                </div>
            );
    };

export default RatingComponent;
