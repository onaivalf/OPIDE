import React, { useState } from 'react';
import './Onboarding.css';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Bem-vindo ao OPIDE!',
    description: 'Seu ambiente de desenvolvimento integrado, otimizado para performance e aprendizado.',
    icon: '👋'
  },
  {
    id: 2,
    title: 'Modo Educacional',
    description: 'Ative o Edu Mode para uma interface simplificada com templates e exercícios guiados.',
    icon: '🎓'
  },
  {
    id: 3,
    title: 'Templates Prontos',
    description: 'Comece rapidamente com projetos template em Python, JavaScript e Rust.',
    icon: '📁'
  },
  {
    id: 4,
    title: 'Dicas em Tempo Real',
    description: 'Reba hints e feedback enquanto você codifica. Aprenda fazendo!',
    icon: '💡'
  }
];

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <button className="onboarding-skip" onClick={onSkip}>
          Pular
        </button>
        
        <div className="onboarding-content">
          <div className="onboarding-icon">{step.icon}</div>
          
          <h2 className="onboarding-title">{step.title}</h2>
          
          <p className="onboarding-description">{step.description}</p>
          
          <div className="onboarding-progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <div className="onboarding-actions">
          {currentStep > 0 && (
            <button className="btn-secondary" onClick={handlePrevious}>
              Voltar
            </button>
          )}
          
          <button className="btn-primary" onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
