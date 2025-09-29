import { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ProgressRing from "@/components/molecules/ProgressRing";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import coursesService from "@/services/api/coursesService";
import assignmentsService from "@/services/api/assignmentsService";
import studySessionsService from "@/services/api/studySessionsService";
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const [data, setData] = useState({
    courses: [],
    upcomingAssignments: [],
    assignmentStats: null,
    studyStats: null,
    recentSessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [
        coursesData,
        upcomingAssignments,
        assignmentStats,
        studyStats,
        recentSessions
      ] = await Promise.all([
        coursesService.getActiveCourses(),
        assignmentsService.getUpcoming(5),
        assignmentsService.getStats(),
        studySessionsService.getStats(),
        studySessionsService.getRecentSessions(3)
      ]);

      setData({
        courses: coursesData,
        upcomingAssignments,
        assignmentStats,
        studyStats,
        recentSessions
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading type="stats" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const getDueDateText = (dueDate) => {
    const date = new Date(dueDate);
    if (isToday(date)) return "Due today";
    if (isTomorrow(date)) return "Due tomorrow";
    return `Due ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Student! 👋</h1>
        <p className="text-primary-100">Here's what's happening with your studies today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Courses"
          value={data.courses.length}
          subtitle="This semester"
          icon="BookOpen"
          iconColor="text-primary-500"
          gradient="from-primary-50 to-primary-100"
        />
        <StatCard
          title="Assignments"
          value={data.assignmentStats?.pending || 0}
          subtitle={`${data.assignmentStats?.completed || 0} completed`}
          icon="FileText"
          iconColor="text-accent-500"
          gradient="from-accent-50 to-accent-100"
        />
        <StatCard
          title="Completion Rate"
          value={`${data.assignmentStats?.completionRate || 0}%`}
          subtitle="Overall progress"
          icon="Trophy"
          iconColor="text-yellow-500"
          gradient="from-yellow-50 to-yellow-100"
        />
        <StatCard
          title="Study Hours"
          value={`${data.studyStats?.totalHours || 0}h`}
          subtitle={`${data.studyStats?.totalSessions || 0} sessions`}
          icon="Clock"
          iconColor="text-green-500"
          gradient="from-green-50 to-green-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="Calendar" className="w-5 h-5 text-primary-500" />
              <span>Upcoming Assignments</span>
            </CardTitle>
            <Button variant="ghost" size="sm">
              <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingAssignments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <ApperIcon name="CheckCircle" className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No upcoming assignments</p>
              </div>
            ) : (
              data.upcomingAssignments.map((assignment) => (
                <div key={assignment.Id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: assignment.course?.color }}
                      />
                      <h4 className="font-medium text-slate-900">{assignment.title}</h4>
                      <Badge variant={getPriorityColor(assignment.priority)} size="sm">
                        {assignment.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{assignment.course?.name}</p>
                    <p className="text-xs text-slate-500">{getDueDateText(assignment.dueDate)}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ApperIcon name="ExternalLink" className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="TrendingUp" className="w-5 h-5 text-primary-500" />
              <span>Progress Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <ProgressRing 
                  progress={data.assignmentStats?.completionRate || 0} 
                  size="lg"
                  color="primary"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900">
                      {data.assignmentStats?.completionRate || 0}%
                    </div>
                    <div className="text-xs text-slate-500">Complete</div>
                  </div>
                </ProgressRing>
                <p className="text-sm text-slate-600 mt-2">Assignment Progress</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Completed</span>
                  <span className="text-sm font-medium text-green-600">
                    {data.assignmentStats?.completed || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Pending</span>
                  <span className="text-sm font-medium text-blue-600">
                    {data.assignmentStats?.pending || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Overdue</span>
                  <span className="text-sm font-medium text-red-600">
                    {data.assignmentStats?.overdue || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium text-slate-900">Total</span>
                  <span className="text-sm font-bold text-slate-900">
                    {data.assignmentStats?.total || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Courses & Recent Study Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="BookOpen" className="w-5 h-5 text-primary-500" />
              <span>Active Courses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.courses.length === 0 ? (
              <Empty 
                title="No courses yet"
                description="Add your courses to get started"
                actionLabel="Add Course"
                icon="BookOpen"
              />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {data.courses.map((course) => (
                  <div key={course.Id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: course.color }}
                      />
                      <div>
                        <h4 className="font-medium text-slate-900">{course.code}</h4>
                        <p className="text-sm text-slate-600">{course.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{course.credits} credits</p>
                      <p className="text-xs text-slate-500">{course.professor}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Study Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="Clock" className="w-5 h-5 text-primary-500" />
              <span>Recent Study Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentSessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <ApperIcon name="Clock" className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p className="font-medium">No study sessions yet</p>
                <p className="text-sm">Start your first study session</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentSessions.map((session) => (
                  <div key={session.Id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: session.course?.color }}
                      />
                      <div>
                        <h4 className="font-medium text-slate-900">{session.course?.code}</h4>
                        <p className="text-sm text-slate-600 truncate max-w-48">{session.notes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{session.duration}min</p>
                      <p className="text-xs text-slate-500">{format(new Date(session.date), "MMM dd")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;