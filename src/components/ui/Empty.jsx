import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { Card } from "@/components/atoms/Card";

const Empty = ({ 
  title = "No items found", 
  description = "Get started by creating your first item",
  actionLabel = "Add Item",
  onAction,
  icon = "Package"
}) => {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
          <ApperIcon name={icon} className="w-8 h-8 text-primary-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {title}
          </h3>
          <p className="text-slate-600">{description}</p>
        </div>
        {onAction && (
          <Button onClick={onAction} className="mt-4">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default Empty;