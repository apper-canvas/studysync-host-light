import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Label from "@/components/atoms/Label";
import Textarea from "@/components/atoms/Textarea";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import coursesService from "@/services/api/coursesService";
import assignmentsService from "@/services/api/assignmentsService";
import studySessionsService from "@/services/api/studySessionsService";
import { format, formatDuration, intervalToDuration } from "date-fns";

const Timer = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [studyStats, setStudyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [startTime, setStartTime] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [coursesData, assignmentsData, studyStatsData, recentSessionsData] = await Promise.all([
        coursesService.getActiveCourses(),
        assignmentsService.getAll(),
        studySessionsService.getStats(),
        studySessionsService.getRecentSessions(5)
      ]);
      
      setCourses(coursesData);
      setAssignments(assignmentsData.filter(a => a.status !== "completed"));
      setStudyStats(studyStatsData);
      setRecentSessions(recentSessionsData);
      
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0].Id.toString());
      }
    } catch (err) {
      setError(err.message || "Failed to load timer data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (!isRunning && timeElapsed !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeElapsed]);

  // Update available assignments when course changes
  useEffect(() => {
    if (selectedCourse) {
      const courseAssignments = assignments.filter(a => a.courseId === parseInt(selectedCourse));
      if (courseAssignments.length > 0 && !courseAssignments.find(a => a.Id === parseInt(selectedAssignment))) {
        setSelectedAssignment(courseAssignments[0].Id.toString());
      }
    }
  }, [selectedCourse, assignments, selectedAssignment]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }
    
    setIsRunning(true);
    setStartTime(new Date());
    setTimeElapsed(0);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeElapsed(0);
    setStartTime(null);
    setSessionNotes("");
  };

  const saveSession = async () => {
    if (!selectedCourse || timeElapsed === 0) {
      toast.error("Please complete a study session first");
      return;
    }

    try {
      const sessionData = {
        courseId: parseInt(selectedCourse),
        assignmentId: selectedAssignment ? parseInt(selectedAssignment) : null,
        duration: Math.floor(timeElapsed / 60), // Convert to minutes
        notes: sessionNotes
      };

      await studySessionsService.create(sessionData);
      
      // Refresh data
      const [updatedStats, updatedSessions] = await Promise.all([
        studySessionsService.getStats(),
        studySessionsService.getRecentSessions(5)
      ]);
      
      setStudyStats(updatedStats);
      setRecentSessions(updatedSessions);
      
      toast.success("Study session saved successfully!");
      resetTimer();
    } catch (err) {
      toast.error(err.message || "Failed to save session");
    }
  };

  if (loading) return <Loading type="stats" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const courseAssignments = assignments.filter(a => a.courseId === parseInt(selectedCourse));
  const selectedCourseData = courses.find(c => c.Id === parseInt(selectedCourse));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Study Timer</h1>
          <p className="text-slate-600">Track your study sessions and stay focused</p>
        </div>
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sessions"
          value={studyStats?.totalSessions || 0}
          subtitle="Study periods"
          icon="Clock"
          iconColor="text-primary-500"
          gradient="from-primary-50 to-primary-100"
        />
        <StatCard
          title="Total Hours"
          value={`${studyStats?.totalHours || 0}h`}
          subtitle="Study time"
          icon="Timer"
          iconColor="text-accent-500"
          gradient="from-accent-50 to-accent-100"
        />
        <StatCard
          title="Average Session"
          value={`${studyStats?.averageSession || 0}m`}
          subtitle="Per session"
          icon="BarChart3"
          iconColor="text-secondary-500"
          gradient="from-secondary-50 to-secondary-100"
        />
        <StatCard
          title="Today's Goal"
          value="2h"
          subtitle="Target study time"
          icon="Target"
          iconColor="text-green-500"
          gradient="from-green-50 to-green-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Card */}
        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="Timer" className="w-5 h-5 text-primary-500" />
              <span>Study Timer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                {formatTime(timeElapsed)}
              </div>
              {isRunning && (
                <div className="text-sm text-slate-600">
                  Started at {startTime && format(startTime, "h:mm a")}
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center space-x-3">
              {!isRunning ? (
                <Button onClick={startTimer} size="lg" className="px-8">
                  <ApperIcon name="Play" className="w-5 h-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button onClick={pauseTimer} size="lg" className="px-8" variant="secondary">
                  <ApperIcon name="Pause" className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button onClick={resetTimer} size="lg" variant="outline">
                <ApperIcon name="RotateCcw" className="w-5 h-5 mr-2" />
                Reset
              </Button>
              
              {timeElapsed > 0 && !isRunning && (
                <Button onClick={saveSession} size="lg" variant="outline">
                  <ApperIcon name="Save" className="w-5 h-5 mr-2" />
                  Save Session
                </Button>
              )}
            </div>

            {/* Session Configuration */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div>
                <Label>Course</Label>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={isRunning}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.Id} value={course.Id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </Select>
              </div>

              {courseAssignments.length > 0 && (
                <div>
                  <Label>Assignment (Optional)</Label>
                  <Select
                    value={selectedAssignment}
                    onChange={(e) => setSelectedAssignment(e.target.value)}
                    disabled={isRunning}
                  >
                    <option value="">General study</option>
                    {courseAssignments.map((assignment) => (
                      <option key={assignment.Id} value={assignment.Id}>
                        {assignment.title}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div>
                <Label>Session Notes</Label>
                <Textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="What did you work on during this session?"
                  rows={3}
                  disabled={isRunning}
                />
              </div>
            </div>

            {/* Current Session Info */}
            {selectedCourseData && (
              <div className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedCourseData.color }}
                  />
                  <div>
                    <p className="font-medium text-slate-900">{selectedCourseData.code}</p>
                    <p className="text-sm text-slate-600">{selectedCourseData.name}</p>
                  </div>
                </div>
                {isRunning && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="History" className="w-5 h-5 text-primary-500" />
              <span>Recent Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <Empty
                title="No study sessions yet"
                description="Start your first study session to build productive habits"
                actionLabel="Start Timer"
                onAction={startTimer}
                icon="Timer"
              />
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.Id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: session.course?.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900">{session.course?.code}</h4>
                        <p className="text-sm text-slate-600 truncate">{session.notes || "Study session"}</p>
                        <p className="text-xs text-slate-500">{format(new Date(session.date), "MMM dd, h:mm a")}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-slate-900">{session.duration}min</p>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-3">
                  <Button variant="outline" size="sm">
                    View All Sessions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Study Tips */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <ApperIcon name="Lightbulb" className="w-5 h-5" />
            <span>Study Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ApperIcon name="Clock" className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Pomodoro Technique</h4>
                <p className="text-sm text-green-700">Study for 25 minutes, then take a 5-minute break</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ApperIcon name="Target" className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Set Goals</h4>
                <p className="text-sm text-green-700">Define what you want to accomplish in each session</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ApperIcon name="Volume2" className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Eliminate Distractions</h4>
                <p className="text-sm text-green-700">Find a quiet space and turn off notifications</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timer;