import React, { useEffect, useState } from 'react';

interface VirtualPetProps {
  show: boolean;
  onComplete?: () => void;
}

const VirtualPet: React.FC<VirtualPetProps> = ({ show, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-bounce-gentle">
        <div className="text-9xl animate-wiggle">
          🐷
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-semibold text-primary animate-fade-in">
            Great job saving! 🎉
          </p>
          <p className="text-lg text-muted-foreground animate-fade-in">
            Your piggy is happy! 💕
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualPet;
