import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import assignmentsService from "@/services/api/assignmentsService";
import coursesService from "@/services/api/coursesService";
import { format, isToday, isTomorrow, isPast } from "date-fns";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    maxPoints: "",
    category: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentsService.getAll(),
        coursesService.getAll()
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData.filter(c => c.isActive));
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      courseId: "",
      description: "",
      dueDate: "",
      priority: "medium",
      status: "pending",
      maxPoints: "",
      category: ""
    });
    setEditingAssignment(null);
  };

  const openModal = (assignment = null) => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        courseId: assignment.courseId.toString(),
        description: assignment.description,
        dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
        priority: assignment.priority,
        status: assignment.status,
        maxPoints: assignment.maxPoints.toString(),
        category: assignment.category
      });
      setEditingAssignment(assignment);
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
      const assignmentData = {
        ...formData,
        courseId: parseInt(formData.courseId),
        maxPoints: parseInt(formData.maxPoints),
        dueDate: new Date(formData.dueDate).toISOString()
      };

      if (editingAssignment) {
        const updated = await assignmentsService.update(editingAssignment.Id, assignmentData);
        const course = courses.find(c => c.Id === updated.courseId);
        setAssignments(assignments.map(a => 
          a.Id === editingAssignment.Id ? { ...updated, course } : a
        ));
        toast.success("Assignment updated successfully!");
      } else {
        const created = await assignmentsService.create(assignmentData);
        const course = courses.find(c => c.Id === created.courseId);
        setAssignments([...assignments, { ...created, course }]);
        toast.success("Assignment added successfully!");
      }
      
      closeModal();
    } catch (err) {
      toast.error(err.message || "Failed to save assignment");
    }
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      return;
    }

    try {
      await assignmentsService.delete(assignment.Id);
      setAssignments(assignments.filter(a => a.Id !== assignment.Id));
      toast.success("Assignment deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete assignment");
    }
  };

  const updateStatus = async (assignment, newStatus) => {
    try {
      const updated = await assignmentsService.update(assignment.Id, { status: newStatus });
      const course = courses.find(c => c.Id === updated.courseId);
      setAssignments(assignments.map(a => 
        a.Id === assignment.Id ? { ...updated, course } : a
      ));
      toast.success(`Assignment marked as ${newStatus}!`);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const filteredAndSortedAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assignment.course?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || assignment.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "title":
          return a.title.localeCompare(b.title);
        case "course":
          return a.course?.name.localeCompare(b.course?.name) || 0;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

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

  const getDueDateStatus = (dueDate, status) => {
    if (status === "completed") return "";
    const date = new Date(dueDate);
    if (isPast(date)) return "overdue";
    if (isToday(date)) return "due-today";
    if (isTomorrow(date)) return "due-tomorrow";
    return "";
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-600">Track and manage your coursework</p>
        </div>
        <Button onClick={() => openModal()}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Assignment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          placeholder="Search assignments..."
          onSearch={setSearchQuery}
          className="flex-1"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </Select>
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="dueDate">Due Date</option>
          <option value="title">Title</option>
          <option value="course">Course</option>
          <option value="priority">Priority</option>
        </Select>
      </div>

      {/* Assignments List */}
      {filteredAndSortedAssignments.length === 0 ? (
        <Empty
          title="No assignments found"
          description="Add your first assignment to start tracking your coursework"
          actionLabel="Add Assignment"
          onAction={() => openModal()}
          icon="FileText"
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Assignment</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Grade</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedAssignments.map((assignment) => {
                  const dueDateStatus = getDueDateStatus(assignment.dueDate, assignment.status);
                  return (
                    <tr key={assignment.Id} className="hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <h4 className="font-medium text-slate-900">{assignment.title}</h4>
                          <p className="text-sm text-slate-600 truncate max-w-xs">
                            {assignment.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{assignment.category}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
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
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900">
                          {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format(new Date(assignment.dueDate), "h:mm a")}
                        </div>
                        {dueDateStatus === "overdue" && (
                          <div className="text-xs text-red-600 font-medium">Overdue</div>
                        )}
                        {dueDateStatus === "due-today" && (
                          <div className="text-xs text-orange-600 font-medium">Due today</div>
                        )}
                        {dueDateStatus === "due-tomorrow" && (
                          <div className="text-xs text-yellow-600 font-medium">Due tomorrow</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={getPriorityColor(assignment.priority)}>
                          {assignment.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={assignment.status}
                          onChange={(e) => updateStatus(assignment, e.target.value)}
                          className="text-sm border border-slate-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        {assignment.grade !== null ? (
                          <div className="text-sm">
                            <span className="font-medium text-slate-900">
                              {assignment.grade}/{assignment.maxPoints}
                            </span>
                            <div className="text-xs text-slate-500">
                              {Math.round((assignment.grade / assignment.maxPoints) * 100)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Not graded</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(assignment)}
                            className="p-1"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(assignment)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAssignment ? "Edit Assignment" : "Add New Assignment"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Assignment Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g., Programming Assignment 1"
            required
          />
          
          <div>
            <Label>Course</Label>
            <Select
              value={formData.courseId}
              onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.Id} value={course.Id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Assignment details..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Due Date</Label>
              <Input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>Max Points</Label>
              <Input
                type="number"
                min="1"
                value={formData.maxPoints}
                onChange={(e) => setFormData({...formData, maxPoints: e.target.value})}
                placeholder="100"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Homework, Project, Exam"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAssignment ? "Update Assignment" : "Add Assignment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;