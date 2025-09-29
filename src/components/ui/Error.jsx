import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { Card } from "@/components/atoms/Card";

const Error = ({ 
  message = "Something went wrong", 
  onRetry,
  showRetry = true 
}) => {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <ApperIcon name="AlertCircle" className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-slate-600">{message}</p>
        </div>
        {showRetry && onRetry && (
          <Button onClick={onRetry} className="mt-4">
            <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
};

export default Error;