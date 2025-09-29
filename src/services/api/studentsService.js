import studentsData from '@/services/mockData/students.json';

class StudentsService {
  constructor() {
    this.students = [...studentsData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.students];
  }

  async getById(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid student ID');
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    const student = this.students.find(s => s.Id === id);
    
    if (!student) {
      throw new Error(`Student with ID ${id} not found`);
    }
    
    return { ...student };
  }

  async create(studentData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newStudent = {
      Id: this.students.length > 0 ? Math.max(...this.students.map(s => s.Id)) + 1 : 1,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      grade: studentData.grade,
      status: studentData.status || 'active',
      phoneNumber: studentData.phoneNumber || '',
      address: studentData.address || '',
      parentName: studentData.parentName || '',
      parentEmail: studentData.parentEmail || '',
      emergencyContact: studentData.emergencyContact || '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0]
    };
    
    this.students.push(newStudent);
    return { ...newStudent };
  }

  async update(id, studentData) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid student ID');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.students.findIndex(s => s.Id === id);
    if (index === -1) {
      throw new Error(`Student with ID ${id} not found`);
    }
    
    const updatedStudent = {
      ...this.students[index],
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      grade: studentData.grade,
      status: studentData.status,
      phoneNumber: studentData.phoneNumber || '',
      address: studentData.address || '',
      parentName: studentData.parentName || '',
      parentEmail: studentData.parentEmail || '',
      emergencyContact: studentData.emergencyContact || ''
    };
    
    this.students[index] = updatedStudent;
    return { ...updatedStudent };
  }

  async delete(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid student ID');
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.students.findIndex(s => s.Id === id);
    if (index === -1) {
      throw new Error(`Student with ID ${id} not found`);
    }
    
    this.students.splice(index, 1);
    return true;
  }
}

export const studentsService = new StudentsService();