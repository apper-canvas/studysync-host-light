import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ className, onItemClick }) => {
  const location = useLocation();

  const navigationItems = [
    { name: "Dashboard", path: "/", icon: "Home" },
    { name: "Courses", path: "/courses", icon: "BookOpen" },
    { name: "Assignments", path: "/assignments", icon: "FileText" },
    { name: "Grades", path: "/grades", icon: "Trophy" },
    { name: "Calendar", path: "/calendar", icon: "Calendar" },
    { name: "Timer", path: "/timer", icon: "Clock" }
  ];

  return (
    <div className={cn("h-full bg-white border-r border-slate-200 shadow-sm", className)}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              StudySync
            </h1>
            <p className="text-xs text-slate-500">Student Management</p>
          </div>
        </div>
      </div>

      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = item.path === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.path);
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <ApperIcon 
                    name={item.icon} 
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                    )} 
                  />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <ApperIcon name="User" className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Student</p>
              <p className="text-xs text-slate-500">Academic Year 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;