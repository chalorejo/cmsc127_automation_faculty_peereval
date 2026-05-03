import React, { useState } from 'react';
import Sidebar from './admin/Sidebar';
import logo from '../assets/website logo.svg';
import Question from './client/Question';
import DynamicButton from './client/DynamicButton';


const ClientForms = () => {

        const [selectedPeriod, setSelectedPeriod] = React.useState(0);

        return (
            <div className="w-full px-4">
                <div className="w-full py-10 flex flex-col gap-15">
                    <div className="w-full flex flex-col gap-5">
                        <h1 className="text-5xl leading-[1.2] lg:text-6xl font-normal text-brand-green mb-2 font-heading">Peer Evaluation Form for Faculty</h1>
                        <p className="text-sm leading-[1.2] text-[#222]">
                            This document is the digitalized version of the MPI Form 2 or the Peer Evaluation Form for Faculty, with the following details taken at the bottom of the Word file document.
                        </p>
                    </div>
                    <div className="w-full flex flex-col gap-3">
                        <div className="w-full bg-[#E0E0E0] h-0.5"></div>
                        <h2 className="text-4 leading-[1.2] text-[#00563F] font-bold">Area of Evaluation</h2>
                        <h3 className="font-bold text-sm leading-[1.2]">Rating:</h3>
                        <p className="text-3 leading-[1.2]">1 - Strongly Disagree<br/>2 - Disagree<br/>3 - Agree<br/>4 - Strongly Agree</p>
                        <div className="w-full bg-[#E0E0E0] h-0.5"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-4 leading-[1.2] mb-4">Question Section</h2>
                        <Question 
                            type="likert" 
                            question="A. Knowledgeable in his/her field of specialization/development" />
                        <Question 
                            type="open-ended" 
                            question="A. What was the most challenging concept coveredin this course, andhow did the instructor help (or not help) you understand it?" />
                    </div>
                    <DynamicButton content="Submit Forms" className="bg-[#A43245] py-3 h-auto "/>
                </div>
            </div>   
        );
    };

export default ClientForms;
