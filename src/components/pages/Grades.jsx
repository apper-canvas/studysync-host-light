import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import StatCard from "@/components/molecules/StatCard";
import ProgressRing from "@/components/molecules/ProgressRing";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import assignmentsService from "@/services/api/assignmentsService";
import coursesService from "@/services/api/coursesService";

const Grades = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentsService.getAll(),
        coursesService.getAll()
      ]);
      setAssignments(assignmentsData.filter(a => a.grade !== null));
      setCourses(coursesData.filter(c => c.isActive));
    } catch (err) {
      setError(err.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateCourseStats = (courseId) => {
    const courseAssignments = assignments.filter(a => a.courseId === courseId && a.grade !== null);
    if (courseAssignments.length === 0) return null;

    const totalPoints = courseAssignments.reduce((sum, a) => sum + a.maxPoints, 0);
    const earnedPoints = courseAssignments.reduce((sum, a) => sum + a.grade, 0);
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    
    return {
      totalAssignments: courseAssignments.length,
      totalPoints,
      earnedPoints,
      percentage: Math.round(percentage * 10) / 10,
      letterGrade: getLetterGrade(percentage)
    };
  };

  const calculateOverallGPA = () => {
    const courseGrades = courses.map(course => {
      const stats = calculateCourseStats(course.Id);
      return stats ? { ...stats, credits: course.credits } : null;
    }).filter(Boolean);

    if (courseGrades.length === 0) return 0;

    const totalCredits = courseGrades.reduce((sum, grade) => sum + grade.credits, 0);
    const weightedSum = courseGrades.reduce((sum, grade) => sum + (getGradePoints(grade.percentage) * grade.credits), 0);
    
    return totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0;
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 63) return "D";
    if (percentage >= 60) return "D-";
    return "F";
  };

  const getGradePoints = (percentage) => {
    if (percentage >= 97) return 4.0;
    if (percentage >= 93) return 4.0;
    if (percentage >= 90) return 3.7;
    if (percentage >= 87) return 3.3;
    if (percentage >= 83) return 3.0;
    if (percentage >= 80) return 2.7;
    if (percentage >= 77) return 2.3;
    if (percentage >= 73) return 2.0;
    if (percentage >= 70) return 1.7;
    if (percentage >= 67) return 1.3;
    if (percentage >= 63) return 1.0;
    if (percentage >= 60) return 0.7;
    return 0.0;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "info";
    if (percentage >= 70) return "warning";
    return "danger";
  };

  if (loading) return <Loading type="stats" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const overallGPA = calculateOverallGPA();
  const gradedAssignments = assignments.length;
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const averageGrade = assignments.length > 0 
    ? Math.round(assignments.reduce((sum, a) => sum + (a.grade / a.maxPoints) * 100, 0) / assignments.length * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grades</h1>
          <p className="text-slate-600">Track your academic performance</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall GPA"
          value={overallGPA.toFixed(2)}
          subtitle={getLetterGrade(averageGrade)}
          icon="Trophy"
          iconColor="text-yellow-500"
          gradient="from-yellow-50 to-yellow-100"
        />
        <StatCard
          title="Average Grade"
          value={`${averageGrade}%`}
          subtitle={getLetterGrade(averageGrade)}
          icon="Target"
          iconColor="text-primary-500"
          gradient="from-primary-50 to-primary-100"
        />
        <StatCard
          title="Graded Assignments"
          value={gradedAssignments}
          subtitle="Completed work"
          icon="CheckCircle"
          iconColor="text-green-500"
          gradient="from-green-50 to-green-100"
        />
        <StatCard
          title="Total Credits"
          value={totalCredits}
          subtitle="This semester"
          icon="BookOpen"
          iconColor="text-accent-500"
          gradient="from-accent-50 to-accent-100"
        />
      </div>

      {gradedAssignments === 0 ? (
        <Empty
          title="No grades yet"
          description="Complete and receive grades on your assignments to see your performance here"
          icon="Trophy"
        />
      ) : (
        <>
          {/* Course Performance */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <ApperIcon name="BarChart3" className="w-5 h-5 mr-2 text-primary-500" />
              Course Performance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const stats = calculateCourseStats(course.Id);
                if (!stats) return null;
                
                return (
                  <Card key={course.Id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                        <div className={`px-2 py-1 rounded text-xs font-medium bg-${getGradeColor(stats.percentage) === 'success' ? 'green' : getGradeColor(stats.percentage) === 'info' ? 'blue' : getGradeColor(stats.percentage) === 'warning' ? 'yellow' : 'red'}-100 text-${getGradeColor(stats.percentage) === 'success' ? 'green' : getGradeColor(stats.percentage) === 'info' ? 'blue' : getGradeColor(stats.percentage) === 'warning' ? 'yellow' : 'red'}-800`}>
                          {stats.letterGrade}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{course.code}</CardTitle>
                      <p className="text-sm text-slate-600 font-medium">{course.name}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <ProgressRing 
                          progress={Math.min(stats.percentage, 100)} 
                          size="md"
                          color={getGradeColor(stats.percentage)}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-slate-900">
                              {stats.percentage}%
                            </div>
                          </div>
                        </ProgressRing>
                        
                        <div className="text-right space-y-1">
                          <div className="text-sm text-slate-600">
                            Points: {stats.earnedPoints}/{stats.totalPoints}
                          </div>
                          <div className="text-sm text-slate-600">
                            Assignments: {stats.totalAssignments}
                          </div>
                          <div className="text-sm text-slate-600">
                            Credits: {course.credits}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="FileText" className="w-5 h-5 text-primary-500" />
                <span>Recent Grades</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 font-medium text-slate-700">Assignment</th>
                      <th className="text-left py-3 font-medium text-slate-700">Course</th>
                      <th className="text-left py-3 font-medium text-slate-700">Grade</th>
                      <th className="text-left py-3 font-medium text-slate-700">Percentage</th>
                      <th className="text-left py-3 font-medium text-slate-700">Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {assignments
                      .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
                      .slice(0, 10)
                      .map((assignment) => {
                        const percentage = (assignment.grade / assignment.maxPoints) * 100;
                        return (
                          <tr key={assignment.Id} className="hover:bg-slate-50">
                            <td className="py-3">
                              <div>
                                <h4 className="font-medium text-slate-900">{assignment.title}</h4>
                                <p className="text-sm text-slate-600">{assignment.category}</p>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: assignment.course?.color }}
                                />
                                <span className="text-sm font-medium text-slate-900">
                                  {assignment.course?.code}
                                </span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="font-medium text-slate-900">
                                {assignment.grade}/{assignment.maxPoints}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`font-medium ${
                                percentage >= 90 ? 'text-green-600' :
                                percentage >= 80 ? 'text-blue-600' :
                                percentage >= 70 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {Math.round(percentage * 10) / 10}%
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                percentage >= 90 ? 'bg-green-100 text-green-800' :
                                percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                                percentage >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {getLetterGrade(percentage)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Grades;