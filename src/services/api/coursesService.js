import { toast } from 'react-toastify';

class CoursesService {
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
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "code_c"}}, 
          {"field": {"Name": "credits_c"}},
          {"field": {"Name": "professor_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "is_active_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('course_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform database fields to match UI expectations
      return response.data.map(course => ({
        Id: course.Id,
        name: course.name_c || course.Name,
        code: course.code_c,
        credits: course.credits_c,
        professor: course.professor_c,
        color: course.color_c,
        semester: course.semester_c,
        isActive: course.is_active_c !== false
      }));
    } catch (error) {
      console.error("Error fetching courses:", error?.response?.data?.message || error);
      toast.error("Failed to load courses");
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "code_c"}},
          {"field": {"Name": "credits_c"}},
          {"field": {"Name": "professor_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "is_active_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('course_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      const course = response.data;
      return {
        Id: course.Id,
        name: course.name_c || course.Name,
        code: course.code_c,
        credits: course.credits_c,
        professor: course.professor_c,
        color: course.color_c,
        semester: course.semester_c,
        isActive: course.is_active_c !== false
      };
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error?.response?.data?.message || error);
      throw new Error("Course not found");
    }
  }

async create(courseData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Get current user from Redux store to satisfy RLS policy
      const state = window.__REDUX_STORE__?.getState();
      const currentUser = state?.user?.user;
      
      if (!currentUser || !currentUser.userId) {
        throw new Error('User authentication required for creating courses');
      }
      
      const params = {
        records: [{
          Name: courseData.name,
          name_c: courseData.name,
          code_c: courseData.code,
          credits_c: parseInt(courseData.credits),
          professor_c: courseData.professor,
          color_c: courseData.color,
          semester_c: courseData.semester,
          is_active_c: courseData.isActive !== false,
          owner_id_c: currentUser.userId
        }]
      };
      
      const response = await this.apperClient.createRecord('course_c', params);
      
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
          throw new Error("Failed to create course");
        }
        
        const created = successful[0].data;
        return {
          Id: created.Id,
          name: created.name_c || created.Name,
          code: created.code_c,
          credits: created.credits_c,
          professor: created.professor_c,
          color: created.color_c,
          semester: created.semester_c,
          isActive: created.is_active_c !== false
        };
      }
    } catch (error) {
      console.error("Error creating course:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, courseData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: courseData.name,
          name_c: courseData.name,
          code_c: courseData.code,
          credits_c: parseInt(courseData.credits),
          professor_c: courseData.professor,
          color_c: courseData.color,
          semester_c: courseData.semester,
          is_active_c: courseData.isActive !== false
        }]
      };
      
      const response = await this.apperClient.updateRecord('course_c', params);
      
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
          throw new Error("Failed to update course");
        }
        
        const updated = successful[0].data;
        return {
          Id: updated.Id,
          name: updated.name_c || updated.Name,
          code: updated.code_c,
          credits: updated.credits_c,
          professor: updated.professor_c,
          color: updated.color_c,
          semester: updated.semester_c,
          isActive: updated.is_active_c !== false
        };
      }
    } catch (error) {
      console.error("Error updating course:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('course_c', params);
      
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
      console.error("Error deleting course:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getActiveCourses() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "code_c"}},
          {"field": {"Name": "credits_c"}},
          {"field": {"Name": "professor_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "is_active_c"}}
        ],
        where: [{"FieldName": "is_active_c", "Operator": "ExactMatch", "Values": [true]}]
      };
      
      const response = await this.apperClient.fetchRecords('course_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(course => ({
        Id: course.Id,
        name: course.name_c || course.Name,
        code: course.code_c,
        credits: course.credits_c,
        professor: course.professor_c,
        color: course.color_c,
        semester: course.semester_c,
        isActive: course.is_active_c !== false
      }));
    } catch (error) {
      console.error("Error fetching active courses:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new CoursesService();