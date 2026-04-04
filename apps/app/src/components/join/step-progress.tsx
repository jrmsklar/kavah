"use client";

const steps = ["About You", "Basics", "Videos", "Profile"];

export function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isCompleted
                    ? "bg-sage text-white"
                    : isActive
                      ? "bg-gold text-white"
                      : "bg-border text-ink-3"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-ink" : isCompleted ? "text-ink-2" : "text-ink-3"
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-px ${isCompleted ? "bg-sage" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
