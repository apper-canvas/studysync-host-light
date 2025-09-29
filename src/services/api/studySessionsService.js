import studySessionsData from "@/services/mockData/studySessions.json";
import coursesService from "./coursesService.js";
import assignmentsService from "./assignmentsService.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class StudySessionsService {
  constructor() {
    this.studySessions = [...studySessionsData];
  }

  async getAll() {
    await delay(300);
    const courses = await coursesService.getAll();
    const assignments = await assignmentsService.getAll();
    
    return this.studySessions.map(session => ({
      ...session,
      course: courses.find(c => c.Id === session.courseId),
      assignment: assignments.find(a => a.Id === session.assignmentId)
    }));
  }

  async getById(id) {
    await delay(200);
    const session = this.studySessions.find(s => s.Id === parseInt(id));
    if (!session) {
      throw new Error("Study session not found");
    }
    return { ...session };
  }

  async create(sessionData) {
    await delay(400);
    const maxId = Math.max(...this.studySessions.map(s => s.Id), 0);
    const newSession = {
      Id: maxId + 1,
      ...sessionData,
      date: new Date().toISOString()
    };
    this.studySessions.push(newSession);
    return { ...newSession };
  }

  async getStats() {
    await delay(200);
    const totalSessions = this.studySessions.length;
    const totalMinutes = this.studySessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    return {
      totalSessions,
      totalHours,
      totalMinutes,
      averageSession
    };
  }

  async getRecentSessions(limit = 5) {
    await delay(200);
    const courses = await coursesService.getAll();
    
    return this.studySessions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
      .map(session => ({
        ...session,
        course: courses.find(c => c.Id === session.courseId)
      }));
  }
}

export default new StudySessionsService();