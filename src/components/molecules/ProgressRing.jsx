import { cn } from "@/utils/cn";

const ProgressRing = ({ 
  progress = 0, 
  size = "md", 
  color = "primary",
  children,
  className 
}) => {
  const sizes = {
    sm: { container: "w-16 h-16", circle: 28, stroke: 4 },
    md: { container: "w-20 h-20", circle: 36, stroke: 4 },
    lg: { container: "w-24 h-24", circle: 44, stroke: 4 }
  };

  const colors = {
    primary: "stroke-primary-500",
    secondary: "stroke-secondary-500",
    accent: "stroke-accent-500",
    success: "stroke-green-500",
    warning: "stroke-yellow-500",
    danger: "stroke-red-500"
  };

  const { container, circle, stroke } = sizes[size];
  const radius = circle;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", container, className)}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${(radius + stroke) * 2} ${(radius + stroke) * 2}`}>
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-200"
        />
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500 ease-in-out", colors[color])}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default ProgressRing;