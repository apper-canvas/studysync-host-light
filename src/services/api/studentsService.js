import { toast } from 'react-toastify';

class StudentsService {
  constructor() {
    // Initialize ApperClient
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "phone_number_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "parent_name_c"}},
          {"field": {"Name": "parent_email_c"}},
          {"field": {"Name": "emergency_contact_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "last_active_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform database fields to match UI expectations
      return response.data.map(student => ({
        Id: student.Id,
        firstName: student.first_name_c,
        lastName: student.last_name_c,
        email: student.email_c,
        grade: student.grade_c,
        status: student.status_c || 'active',
        phoneNumber: student.phone_number_c,
        address: student.address_c,
        parentName: student.parent_name_c,
        parentEmail: student.parent_email_c,
        emergencyContact: student.emergency_contact_c,
        enrollmentDate: student.enrollment_date_c,
        lastActive: student.last_active_c
      }));
    } catch (error) {
      console.error("Error fetching students:", error?.response?.data?.message || error);
      toast.error("Failed to load students");
      return [];
    }
  }

  async getById(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid student ID');
    }

    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "phone_number_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "parent_name_c"}},
          {"field": {"Name": "parent_email_c"}},
          {"field": {"Name": "emergency_contact_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "last_active_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('student_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      const student = response.data;
      return {
        Id: student.Id,
        firstName: student.first_name_c,
        lastName: student.last_name_c,
        email: student.email_c,
        grade: student.grade_c,
        status: student.status_c || 'active',
        phoneNumber: student.phone_number_c,
        address: student.address_c,
        parentName: student.parent_name_c,
        parentEmail: student.parent_email_c,
        emergencyContact: student.emergency_contact_c,
        enrollmentDate: student.enrollment_date_c,
        lastActive: student.last_active_c
      };
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error?.response?.data?.message || error);
      throw new Error(`Student with ID ${id} not found`);
    }
  }

  async create(studentData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: `${studentData.firstName} ${studentData.lastName}`,
          first_name_c: studentData.firstName,
          last_name_c: studentData.lastName,
          email_c: studentData.email,
          grade_c: studentData.grade,
          status_c: studentData.status || 'active',
          phone_number_c: studentData.phoneNumber || '',
          address_c: studentData.address || '',
          parent_name_c: studentData.parentName || '',
          parent_email_c: studentData.parentEmail || '',
          emergency_contact_c: studentData.emergencyContact || '',
          enrollment_date_c: new Date().toISOString().split('T')[0],
          last_active_c: new Date().toISOString().split('T')[0]
        }]
      };
      
      const response = await this.apperClient.createRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, JSON.stringify(failed));
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create student");
        }
        
        const created = successful[0].data;
        return {
          Id: created.Id,
          firstName: created.first_name_c,
          lastName: created.last_name_c,
          email: created.email_c,
          grade: created.grade_c,
          status: created.status_c || 'active',
          phoneNumber: created.phone_number_c,
          address: created.address_c,
          parentName: created.parent_name_c,
          parentEmail: created.parent_email_c,
          emergencyContact: created.emergency_contact_c,
          enrollmentDate: created.enrollment_date_c,
          lastActive: created.last_active_c
        };
      }
    } catch (error) {
      console.error("Error creating student:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, studentData) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid student ID');
    }

    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: `${studentData.firstName} ${studentData.lastName}`,
          first_name_c: studentData.firstName,
          last_name_c: studentData.lastName,
          email_c: studentData.email,
          grade_c: studentData.grade,
          status_c: studentData.status,
          phone_number_c: studentData.phoneNumber || '',
          address_c: studentData.address || '',
          parent_name_c: studentData.parentName || '',
          parent_email_c: studentData.parentEmail || '',
          emergency_contact_c: studentData.emergencyContact || ''
        }]
      };
      
      const response = await this.apperClient.updateRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, JSON.stringify(failed));
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update student");
        }
        
        const updated = successful[0].data;
        return {
          Id: updated.Id,
          firstName: updated.first_name_c,
          lastName: updated.last_name_c,
          email: updated.email_c,
          grade: updated.grade_c,
          status: updated.status_c,
          phoneNumber: updated.phone_number_c,
          address: updated.address_c,
          parentName: updated.parent_name_c,
          parentEmail: updated.parent_email_c,
          emergencyContact: updated.emergency_contact_c,
          enrollmentDate: updated.enrollment_date_c,
          lastActive: updated.last_active_c
        };
      }
    } catch (error) {
      console.error("Error updating student:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid student ID');
    }

    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        return successful.length > 0;
      }
    } catch (error) {
      console.error("Error deleting student:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export const studentsService = new StudentsService();