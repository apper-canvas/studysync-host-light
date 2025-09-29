import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor = "text-primary-500",
  gradient = "from-primary-50 to-secondary-50",
  className 
}) => {
  return (
    <Card className={cn("bg-gradient-to-br", gradient, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        {icon && (
          <div className={cn("p-2 rounded-lg bg-white/50 backdrop-blur-sm", iconColor)}>
            <ApperIcon name={icon} className="w-4 h-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-600 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;