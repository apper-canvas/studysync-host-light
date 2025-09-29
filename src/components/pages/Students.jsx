import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';
import { studentsService } from '@/services/api/studentsService';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    grade: '',
    status: 'active',
    phoneNumber: '',
    address: '',
    parentName: '',
    parentEmail: '',
    emergencyContact: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentsService.getAll();
      setStudents(data);
    } catch (err) {
      setError('Failed to load students. Please try again.');
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      grade: '',
      status: 'active',
      phoneNumber: '',
      address: '',
      parentName: '',
      parentEmail: '',
      emergencyContact: ''
    });
  };

  const handleAddStudent = () => {
    resetForm();
    setSelectedStudent(null);
    setIsAddModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      grade: student.grade,
      status: student.status,
      phoneNumber: student.phoneNumber,
      address: student.address,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      emergencyContact: student.emergencyContact
    });
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`)) {
      try {
        await studentsService.delete(student.Id);
        setStudents(prev => prev.filter(s => s.Id !== student.Id));
        toast.success('Student deleted successfully');
      } catch (err) {
        toast.error('Failed to delete student');
        console.error('Error deleting student:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.grade) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (selectedStudent) {
        // Update existing student
        const updatedStudent = await studentsService.update(selectedStudent.Id, formData);
        setStudents(prev => prev.map(s => s.Id === selectedStudent.Id ? updatedStudent : s));
        toast.success('Student updated successfully');
        setIsEditModalOpen(false);
      } else {
        // Create new student
        const newStudent = await studentsService.create(formData);
        setStudents(prev => [...prev, newStudent]);
        toast.success('Student added successfully');
        setIsAddModalOpen(false);
      }
      resetForm();
    } catch (err) {
      toast.error(selectedStudent ? 'Failed to update student' : 'Failed to add student');
      console.error('Error saving student:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;
    
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeOptions = () => {
    const grades = [...new Set(students.map(s => s.grade))].sort();
    return grades.map(grade => ({ value: grade, label: grade }));
  };

  if (loading) {
    return <Loading message="Loading students..." />;
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadStudents}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage your student roster</p>
        </div>
        <Button onClick={handleAddStudent} className="flex items-center gap-2">
          <ApperIcon name="UserPlus" size={16} />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search students by name or email..."
          />
        </div>
        <div className="flex gap-4">
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' }
            ]}
          />
          <Select
            value={gradeFilter}
            onChange={(value) => setGradeFilter(value)}
            options={[
              { value: 'all', label: 'All Grades' },
              ...getGradeOptions()
            ]}
          />
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <Empty 
          icon="Users"
          title="No students found"
          description={searchTerm || statusFilter !== 'all' || gradeFilter !== 'all' 
            ? "No students match your current filters. Try adjusting your search criteria."
            : "Get started by adding your first student to the roster."
          }
          action={
            searchTerm || statusFilter !== 'all' || gradeFilter !== 'all' ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setGradeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={handleAddStudent}>
                Add Your First Student
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredStudents.map((student) => (
              <motion.div
                key={student.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ApperIcon name="GraduationCap" size={14} />
                        Grade {student.grade}
                      </div>
                      {student.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ApperIcon name="Phone" size={14} />
                          {student.phoneNumber}
                        </div>
                      )}
                      {student.parentName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ApperIcon name="User" size={14} />
                          Parent: {student.parentName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t bg-gray-50 p-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStudent(student)}
                      className="flex items-center gap-1"
                    >
                      <ApperIcon name="Edit" size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStudent(student)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <ApperIcon name="Trash2" size={14} />
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Student"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              required
              error={!formData.firstName && 'First name is required'}
            >
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
              />
            </FormField>

            <FormField
              label="Last Name"
              required
              error={!formData.lastName && 'Last name is required'}
            >
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
              />
            </FormField>
          </div>

          <FormField
            label="Email"
            required
            error={!formData.email && 'Email is required'}
          >
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Grade"
              required
              error={!formData.grade && 'Grade is required'}
            >
              <Select
                value={formData.grade}
                onChange={(value) => handleInputChange('grade', value)}
                options={[
                  { value: '', label: 'Select grade...' },
                  { value: '9', label: 'Grade 9' },
                  { value: '10', label: 'Grade 10' },
                  { value: '11', label: 'Grade 11' },
                  { value: '12', label: 'Grade 12' }
                ]}
                placeholder="Select grade"
              />
            </FormField>

            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'suspended', label: 'Suspended' }
                ]}
              />
            </FormField>
          </div>

          <FormField label="Phone Number">
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter phone number"
            />
          </FormField>

          <FormField label="Address">
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter address"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Parent/Guardian Name">
              <Input
                value={formData.parentName}
                onChange={(e) => handleInputChange('parentName', e.target.value)}
                placeholder="Enter parent name"
              />
            </FormField>

            <FormField label="Parent Email">
              <Input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                placeholder="Enter parent email"
              />
            </FormField>
          </div>

          <FormField label="Emergency Contact">
            <Input
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Enter emergency contact"
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Edit Student"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              required
              error={!formData.firstName && 'First name is required'}
            >
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
              />
            </FormField>

            <FormField
              label="Last Name"
              required
              error={!formData.lastName && 'Last name is required'}
            >
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
              />
            </FormField>
          </div>

          <FormField
            label="Email"
            required
            error={!formData.email && 'Email is required'}
          >
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Grade"
              required
              error={!formData.grade && 'Grade is required'}
            >
              <Select
                value={formData.grade}
                onChange={(value) => handleInputChange('grade', value)}
                options={[
                  { value: '', label: 'Select grade...' },
                  { value: '9', label: 'Grade 9' },
                  { value: '10', label: 'Grade 10' },
                  { value: '11', label: 'Grade 11' },
                  { value: '12', label: 'Grade 12' }
                ]}
                placeholder="Select grade"
              />
            </FormField>

            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'suspended', label: 'Suspended' }
                ]}
              />
            </FormField>
          </div>

          <FormField label="Phone Number">
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter phone number"
            />
          </FormField>

          <FormField label="Address">
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter address"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Parent/Guardian Name">
              <Input
                value={formData.parentName}
                onChange={(e) => handleInputChange('parentName', e.target.value)}
                placeholder="Enter parent name"
              />
            </FormField>

            <FormField label="Parent Email">
              <Input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                placeholder="Enter parent email"
              />
            </FormField>
          </div>

          <FormField label="Emergency Contact">
            <Input
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Enter emergency contact"
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Update Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;