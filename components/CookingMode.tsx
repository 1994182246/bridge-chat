import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, CheckCircle } from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const steps = recipe.steps;
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    // Cancel speech when closing or unmounting
    return () => {
      window.speechSynthesis.cancel();
      if (utteranceRef.current) {
        utteranceRef.current = null;
      }
    };
  }, []);

  const speakStep = (text: string) => {
    window.speechSynthesis.cancel(); // Stop current
    if (isSpeaking) {
        setIsSpeaking(false);
        utteranceRef.current = null;
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Keep reference to prevent GC issues
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
    };
    utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
    };
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
      setIsSpeaking(false);
      window.speechSynthesis.cancel();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
      setIsSpeaking(false);
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-4">
            <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
                <X size={24} className="text-slate-600" />
            </button>
            <div>
                <h2 className="font-bold text-slate-800 line-clamp-1">{recipe.title}</h2>
                <p className="text-xs text-slate-500">Step {currentStep + 1} of {steps.length}</p>
            </div>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={() => speakStep(steps[currentStep].instruction)}
                className={`p-3 rounded-full flex items-center gap-2 font-medium transition-all ${
                    isSpeaking 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
                {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Read Aloud'}</span>
            </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5">
        <div 
            className="bg-emerald-500 h-1.5 transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto bg-slate-50">
        <div className="max-w-3xl w-full text-center space-y-8">
            <div className="inline-block bg-white px-4 py-1 rounded-full border border-slate-200 text-emerald-600 font-bold text-sm uppercase tracking-widest shadow-sm">
                Step {steps[currentStep].stepNumber}
            </div>
            
            <p className="text-2xl md:text-4xl font-medium text-slate-800 leading-relaxed md:leading-snug">
                {steps[currentStep].instruction}
            </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="h-24 border-t border-slate-200 bg-white flex items-center justify-between px-6 md:px-12">
        <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
            <ChevronLeft size={24} />
            Previous
        </button>

        <div className="flex gap-2">
            {steps.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentStep ? 'bg-emerald-500 scale-125' : 'bg-slate-200'}`}
                />
            ))}
        </div>

        {currentStep === steps.length - 1 ? (
             <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
            >
                <CheckCircle size={24} />
                Finish Cooking
            </button>
        ) : (
            <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-0.5"
            >
                Next Step
                <ChevronRight size={24} />
            </button>
        )}
      </div>
    </div>
  );
};
