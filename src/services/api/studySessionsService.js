import { toast } from 'react-toastify';
import coursesService from "./coursesService.js";
import assignmentsService from "./assignmentsService.js";

class StudySessionsService {
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
          {"field": {"Name": "course_id_c"}, "referenceField": {"field": {"Name": "name_c"}}},
          {"field": {"Name": "assignment_id_c"}, "referenceField": {"field": {"Name": "title_c"}}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('study_session_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform database fields to match UI expectations
      return response.data.map(session => ({
        Id: session.Id,
        courseId: session.course_id_c?.Id || session.course_id_c,
        assignmentId: session.assignment_id_c?.Id || session.assignment_id_c,
        duration: session.duration_c,
        date: session.date_c,
        notes: session.notes_c || session.Name,
        course: session.course_id_c?.Id ? {
          Id: session.course_id_c.Id,
          name: session.course_id_c.name_c,
          code: session.course_id_c.name_c
        } : null,
        assignment: session.assignment_id_c?.Id ? {
          Id: session.assignment_id_c.Id,
          title: session.assignment_id_c.title_c
        } : null
      }));
    } catch (error) {
      console.error("Error fetching study sessions:", error?.response?.data?.message || error);
      toast.error("Failed to load study sessions");
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "assignment_id_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('study_session_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      const session = response.data;
      return {
        Id: session.Id,
        courseId: session.course_id_c,
        assignmentId: session.assignment_id_c,
        duration: session.duration_c,
        date: session.date_c,
        notes: session.notes_c || session.Name
      };
    } catch (error) {
      console.error(`Error fetching study session ${id}:`, error?.response?.data?.message || error);
      throw new Error("Study session not found");
    }
  }

  async create(sessionData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: sessionData.notes || "Study Session",
          course_id_c: parseInt(sessionData.courseId),
          assignment_id_c: sessionData.assignmentId ? parseInt(sessionData.assignmentId) : null,
          duration_c: parseInt(sessionData.duration),
          date_c: sessionData.date || new Date().toISOString(),
          notes_c: sessionData.notes
        }]
      };
      
      const response = await this.apperClient.createRecord('study_session_c', params);
      
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
          throw new Error("Failed to create study session");
        }
        
        const created = successful[0].data;
        return {
          Id: created.Id,
          courseId: created.course_id_c,
          assignmentId: created.assignment_id_c,
          duration: created.duration_c,
          date: created.date_c,
          notes: created.notes_c || created.Name
        };
      }
    } catch (error) {
      console.error("Error creating study session:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getStats() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "duration_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('study_session_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return { totalSessions: 0, totalHours: 0, totalMinutes: 0, averageSession: 0 };
      }
      
      const sessions = response.data;
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration_c || 0), 0);
      const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
      const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

      return {
        totalSessions,
        totalHours,
        totalMinutes,
        averageSession
      };
    } catch (error) {
      console.error("Error fetching study session stats:", error?.response?.data?.message || error);
      return { totalSessions: 0, totalHours: 0, totalMinutes: 0, averageSession: 0 };
    }
  }

  async getRecentSessions(limit = 5) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "course_id_c"}, "referenceField": {"field": {"Name": "name_c"}}},
          {"field": {"Name": "assignment_id_c"}, "referenceField": {"field": {"Name": "title_c"}}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords('study_session_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(session => ({
        Id: session.Id,
        courseId: session.course_id_c?.Id || session.course_id_c,
        assignmentId: session.assignment_id_c?.Id || session.assignment_id_c,
        duration: session.duration_c,
        date: session.date_c,
        notes: session.notes_c || session.Name,
        course: session.course_id_c?.Id ? {
          Id: session.course_id_c.Id,
          name: session.course_id_c.name_c,
          code: session.course_id_c.name_c
        } : null,
        assignment: session.assignment_id_c?.Id ? {
          Id: session.assignment_id_c.Id,
          title: session.assignment_id_c.title_c
        } : null
      }));
    } catch (error) {
      console.error("Error fetching recent study sessions:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new StudySessionsService();