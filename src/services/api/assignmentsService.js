import { toast } from 'react-toastify';
import coursesService from "./coursesService.js";

class AssignmentsService {
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "course_id_c"}, "referenceField": {"field": {"Name": "name_c"}}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('assignment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform database fields to match UI expectations
      return response.data.map(assignment => ({
        Id: assignment.Id,
        title: assignment.title_c || assignment.Name,
        description: assignment.description_c,
        dueDate: assignment.due_date_c,
        priority: assignment.priority_c,
        status: assignment.status_c,
        grade: assignment.grade_c,
        maxPoints: assignment.max_points_c,
        category: assignment.category_c,
        courseId: assignment.course_id_c?.Id || assignment.course_id_c,
        course: assignment.course_id_c?.Id ? {
          Id: assignment.course_id_c.Id,
          name: assignment.course_id_c.name_c,
          code: assignment.course_id_c.name_c // Fallback for code display
        } : null
      }));
    } catch (error) {
      console.error("Error fetching assignments:", error?.response?.data?.message || error);
      toast.error("Failed to load assignments");
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "course_id_c"}, "referenceField": {"field": {"Name": "name_c"}}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('assignment_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      const assignment = response.data;
      return {
        Id: assignment.Id,
        title: assignment.title_c || assignment.Name,
        description: assignment.description_c,
        dueDate: assignment.due_date_c,
        priority: assignment.priority_c,
        status: assignment.status_c,
        grade: assignment.grade_c,
        maxPoints: assignment.max_points_c,
        category: assignment.category_c,
        courseId: assignment.course_id_c?.Id || assignment.course_id_c,
        course: assignment.course_id_c?.Id ? {
          Id: assignment.course_id_c.Id,
          name: assignment.course_id_c.name_c,
          code: assignment.course_id_c.name_c
        } : null
      };
    } catch (error) {
      console.error(`Error fetching assignment ${id}:`, error?.response?.data?.message || error);
      throw new Error("Assignment not found");
    }
  }

  async getByCourse(courseId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [{"FieldName": "course_id_c", "Operator": "ExactMatch", "Values": [parseInt(courseId)]}]
      };
      
      const response = await this.apperClient.fetchRecords('assignment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(assignment => ({
        Id: assignment.Id,
        title: assignment.title_c || assignment.Name,
        description: assignment.description_c,
        dueDate: assignment.due_date_c,
        priority: assignment.priority_c,
        status: assignment.status_c,
        grade: assignment.grade_c,
        maxPoints: assignment.max_points_c,
        category: assignment.category_c,
        courseId: assignment.course_id_c?.Id || assignment.course_id_c
      }));
    } catch (error) {
      console.error("Error fetching assignments by course:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getUpcoming(limit = 5) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const now = new Date().toISOString();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "course_id_c"}, "referenceField": {"field": {"Name": "name_c"}}}
        ],
        where: [
          {"FieldName": "due_date_c", "Operator": "GreaterThan", "Values": [now]},
          {"FieldName": "status_c", "Operator": "NotEqualTo", "Values": ["completed"]}
        ],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords('assignment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(assignment => ({
        Id: assignment.Id,
        title: assignment.title_c || assignment.Name,
        description: assignment.description_c,
        dueDate: assignment.due_date_c,
        priority: assignment.priority_c,
        status: assignment.status_c,
        grade: assignment.grade_c,
        maxPoints: assignment.max_points_c,
        category: assignment.category_c,
        courseId: assignment.course_id_c?.Id || assignment.course_id_c,
        course: assignment.course_id_c?.Id ? {
          Id: assignment.course_id_c.Id,
          name: assignment.course_id_c.name_c,
          code: assignment.course_id_c.name_c
        } : null
      }));
    } catch (error) {
      console.error("Error fetching upcoming assignments:", error?.response?.data?.message || error);
      return [];
    }
  }

  async create(assignmentData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: assignmentData.title,
          title_c: assignmentData.title,
          description_c: assignmentData.description,
          due_date_c: assignmentData.dueDate,
          priority_c: assignmentData.priority,
          status_c: assignmentData.status || "pending",
          grade_c: assignmentData.grade || null,
          max_points_c: parseInt(assignmentData.maxPoints),
          category_c: assignmentData.category,
          course_id_c: parseInt(assignmentData.courseId)
        }]
      };
      
      const response = await this.apperClient.createRecord('assignment_c', params);
      
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
          throw new Error("Failed to create assignment");
        }
        
        const created = successful[0].data;
        return {
          Id: created.Id,
          title: created.title_c || created.Name,
          description: created.description_c,
          dueDate: created.due_date_c,
          priority: created.priority_c,
          status: created.status_c,
          grade: created.grade_c,
          maxPoints: created.max_points_c,
          category: created.category_c,
          courseId: created.course_id_c
        };
      }
    } catch (error) {
      console.error("Error creating assignment:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, assignmentData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const updateData = {
        Id: parseInt(id)
      };
      
      // Only include fields that are being updated
      if (assignmentData.title !== undefined) {
        updateData.Name = assignmentData.title;
        updateData.title_c = assignmentData.title;
      }
      if (assignmentData.description !== undefined) updateData.description_c = assignmentData.description;
      if (assignmentData.dueDate !== undefined) updateData.due_date_c = assignmentData.dueDate;
      if (assignmentData.priority !== undefined) updateData.priority_c = assignmentData.priority;
      if (assignmentData.status !== undefined) updateData.status_c = assignmentData.status;
      if (assignmentData.grade !== undefined) updateData.grade_c = assignmentData.grade;
      if (assignmentData.maxPoints !== undefined) updateData.max_points_c = parseInt(assignmentData.maxPoints);
      if (assignmentData.category !== undefined) updateData.category_c = assignmentData.category;
      if (assignmentData.courseId !== undefined) updateData.course_id_c = parseInt(assignmentData.courseId);
      
      const params = { records: [updateData] };
      
      const response = await this.apperClient.updateRecord('assignment_c', params);
      
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
          throw new Error("Failed to update assignment");
        }
        
        const updated = successful[0].data;
        return {
          Id: updated.Id,
          title: updated.title_c || updated.Name,
          description: updated.description_c,
          dueDate: updated.due_date_c,
          priority: updated.priority_c,
          status: updated.status_c,
          grade: updated.grade_c,
          maxPoints: updated.max_points_c,
          category: updated.category_c,
          courseId: updated.course_id_c
        };
      }
    } catch (error) {
      console.error("Error updating assignment:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('assignment_c', params);
      
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
      console.error("Error deleting assignment:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getStats() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "due_date_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('assignment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return { total: 0, completed: 0, pending: 0, overdue: 0, completionRate: 0 };
      }
      
      const assignments = response.data;
      const now = new Date();
      const total = assignments.length;
      const completed = assignments.filter(a => a.status_c === "completed").length;
      const pending = assignments.filter(a => a.status_c === "pending").length;
      const overdue = assignments.filter(a => 
        new Date(a.due_date_c) < now && a.status_c !== "completed"
      ).length;

      return {
        total,
        completed,
        pending,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    } catch (error) {
      console.error("Error fetching assignment stats:", error?.response?.data?.message || error);
      return { total: 0, completed: 0, pending: 0, overdue: 0, completionRate: 0 };
    }
  }
}

export default new AssignmentsService();