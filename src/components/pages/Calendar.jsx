import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import assignmentsService from "@/services/api/assignmentsService";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from "date-fns";

const Calendar = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await assignmentsService.getAll();
      setAssignments(data);
    } catch (err) {
      setError(err.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const getMonthDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  };

  const getAssignmentsForDate = (date) => {
    return assignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      return isSameDay(dueDate, date);
    });
  };

  const getSelectedDateAssignments = () => {
    return getAssignmentsForDate(selectedDate);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "in-progress": return "info";
      case "pending": return "default";
      default: return "default";
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadAssignments} />;

  const monthDays = getMonthDays();
  const selectedDateAssignments = getSelectedDateAssignments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600">View your assignments and deadlines</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Month
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      {viewMode === "month" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-bold">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ApperIcon name="ChevronLeft" className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ApperIcon name="ChevronRight" className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((date) => {
                  const dayAssignments = getAssignmentsForDate(date);
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  
                  return (
                    <button
                      key={date.toISOString()}
                      className={`
                        p-2 min-h-[80px] text-sm border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 relative transition-colors
                        ${!isCurrentMonth ? "text-slate-400 bg-slate-50" : "text-slate-900"}
                        ${isSelected ? "bg-primary-100 border-primary-300" : ""}
                        ${isTodayDate ? "bg-accent-50 border-accent-300 font-semibold" : ""}
                      `}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="flex flex-col h-full">
                        <span className={`
                          self-start mb-1
                          ${isTodayDate ? "text-accent-700" : ""}
                        `}>
                          {format(date, "d")}
                        </span>
                        <div className="flex-1 flex flex-col space-y-1">
                          {dayAssignments.slice(0, 2).map((assignment) => (
                            <div
                              key={assignment.Id}
                              className="w-full h-1.5 rounded-full"
                              style={{ backgroundColor: assignment.course?.color }}
                              title={assignment.title}
                            />
                          ))}
                          {dayAssignments.length > 2 && (
                            <span className="text-xs text-slate-500">
                              +{dayAssignments.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="Calendar" className="w-5 h-5 text-primary-500" />
                <span>{format(selectedDate, "MMM dd, yyyy")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateAssignments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <ApperIcon name="Calendar" className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="font-medium">No assignments</p>
                  <p className="text-sm">No deadlines for this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateAssignments.map((assignment) => (
                    <div key={assignment.Id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{assignment.title}</h4>
                        <Badge variant={getPriorityColor(assignment.priority)} size="sm">
                          {assignment.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: assignment.course?.color }}
                        />
                        <span className="text-sm text-slate-600">{assignment.course?.code}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                        {assignment.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant={getStatusColor(assignment.status)} size="sm">
                          {assignment.status}
                        </Badge>
                        <span className="text-slate-500">
                          {format(new Date(assignment.dueDate), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="List" className="w-5 h-5 text-primary-500" />
              <span>All Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <Empty
                title="No assignments found"
                description="Create some assignments to see them in the calendar"
                icon="Calendar"
              />
            ) : (
              <div className="space-y-4">
                {assignments
                  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                  .map((assignment) => (
                    <div key={assignment.Id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: assignment.course?.color }}
                          />
                          <h4 className="font-medium text-slate-900">{assignment.title}</h4>
                          <Badge variant={getPriorityColor(assignment.priority)} size="sm">
                            {assignment.priority}
                          </Badge>
                          <Badge variant={getStatusColor(assignment.status)} size="sm">
                            {assignment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>{assignment.course?.name}</span>
                          <span>{assignment.category}</span>
                          <span>Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy 'at' h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Calendar;