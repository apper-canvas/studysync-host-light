import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import coursesService from "@/services/api/coursesService";

const COURSE_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", 
  "#ef4444", "#84cc16", "#f97316", "#ec4899", "#6366f1"
];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: "",
    professor: "",
    color: COURSE_COLORS[0],
    semester: "Fall 2024"
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await coursesService.getAll();
      setCourses(data);
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      credits: "",
      professor: "",
      color: COURSE_COLORS[0],
      semester: "Fall 2024"
    });
    setEditingCourse(null);
  };

  const openModal = (course = null) => {
    if (course) {
      setFormData({
        name: course.name,
        code: course.code,
        credits: course.credits.toString(),
        professor: course.professor,
        color: course.color,
        semester: course.semester
      });
      setEditingCourse(course);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const courseData = {
        ...formData,
        credits: parseInt(formData.credits)
      };

      if (editingCourse) {
        const updated = await coursesService.update(editingCourse.Id, courseData);
        setCourses(courses.map(c => c.Id === editingCourse.Id ? updated : c));
        toast.success("Course updated successfully!");
      } else {
        const created = await coursesService.create(courseData);
        setCourses([...courses, created]);
        toast.success("Course added successfully!");
      }
      
      closeModal();
    } catch (err) {
      toast.error(err.message || "Failed to save course");
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.name}"?`)) {
      return;
    }

    try {
      await coursesService.delete(course.Id);
      setCourses(courses.filter(c => c.Id !== course.Id));
      toast.success("Course deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete course");
    }
  };

  const toggleActive = async (course) => {
    try {
      const updated = await coursesService.update(course.Id, { 
        isActive: !course.isActive 
      });
      setCourses(courses.map(c => c.Id === course.Id ? updated : c));
      toast.success(`Course ${updated.isActive ? "activated" : "archived"}!`);
    } catch (err) {
      toast.error(err.message || "Failed to update course");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCourses} />;

  const activeCourses = courses.filter(c => c.isActive);
  const archivedCourses = courses.filter(c => !c.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="text-slate-600">Manage your academic courses</p>
        </div>
        <Button onClick={() => openModal()}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Active Courses */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <ApperIcon name="BookOpen" className="w-5 h-5 mr-2 text-primary-500" />
          Active Courses ({activeCourses.length})
        </h2>
        
        {activeCourses.length === 0 ? (
          <Empty
            title="No active courses"
            description="Add your first course to get started with your academic journey"
            actionLabel="Add Course"
            onAction={() => openModal()}
            icon="BookOpen"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.map((course) => (
              <Card key={course.Id} className="hover:shadow-lg transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: course.color }}
                    />
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModal(course)}
                        className="p-1 h-auto"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(course)}
                        className="p-1 h-auto"
                      >
                        <ApperIcon name="Archive" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course)}
                        className="p-1 h-auto text-red-500 hover:text-red-700"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{course.code}</CardTitle>
                  <p className="text-sm text-slate-600 font-medium">{course.name}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Professor:</span>
                      <span className="font-medium text-slate-900">{course.professor}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Credits:</span>
                      <span className="font-medium text-slate-900">{course.credits}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Semester:</span>
                      <span className="font-medium text-slate-900">{course.semester}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Archived Courses */}
      {archivedCourses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <ApperIcon name="Archive" className="w-5 h-5 mr-2 text-slate-500" />
            Archived Courses ({archivedCourses.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedCourses.map((course) => (
              <Card key={course.Id} className="opacity-60 hover:opacity-80 transition-opacity">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(course)}
                        className="p-1 h-auto"
                      >
                        <ApperIcon name="ArchiveRestore" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course)}
                        className="p-1 h-auto text-red-500 hover:text-red-700"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{course.code}</CardTitle>
                  <p className="text-sm text-slate-600 font-medium">{course.name}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Professor:</span>
                      <span className="font-medium text-slate-900">{course.professor}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Credits:</span>
                      <span className="font-medium text-slate-900">{course.credits}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCourse ? "Edit Course" : "Add New Course"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Course Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Computer Science Fundamentals"
            required
          />
          
          <FormField
            label="Course Code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            placeholder="e.g., CS101"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Credits</Label>
              <Input
                type="number"
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({...formData, credits: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>Color</Label>
              <div className="flex space-x-2 mt-1">
                {COURSE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-slate-400' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({...formData, color})}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <FormField
            label="Professor"
            value={formData.professor}
            onChange={(e) => setFormData({...formData, professor: e.target.value})}
            placeholder="e.g., Dr. Sarah Johnson"
            required
          />
          
          <div>
            <Label>Semester</Label>
            <Select
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: e.target.value})}
              required
            >
              <option value="Fall 2024">Fall 2024</option>
              <option value="Spring 2024">Spring 2024</option>
              <option value="Summer 2024">Summer 2024</option>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCourse ? "Update Course" : "Add Course"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Courses;