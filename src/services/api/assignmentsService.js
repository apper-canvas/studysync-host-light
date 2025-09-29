import assignmentsData from "@/services/mockData/assignments.json";
import coursesService from "./coursesService.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AssignmentsService {
  constructor() {
    this.assignments = [...assignmentsData];
  }

  async getAll() {
    await delay(300);
    const courses = await coursesService.getAll();
    return this.assignments.map(assignment => ({
      ...assignment,
      course: courses.find(c => c.Id === assignment.courseId)
    }));
  }

  async getById(id) {
    await delay(200);
    const assignment = this.assignments.find(a => a.Id === parseInt(id));
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    const courses = await coursesService.getAll();
    return {
      ...assignment,
      course: courses.find(c => c.Id === assignment.courseId)
    };
  }

  async getByCourse(courseId) {
    await delay(250);
    return this.assignments
      .filter(a => a.courseId === parseInt(courseId))
      .map(a => ({ ...a }));
  }

  async getUpcoming(limit = 5) {
    await delay(200);
    const now = new Date();
    const courses = await coursesService.getAll();
    
    return this.assignments
      .filter(a => new Date(a.dueDate) > now && a.status !== "completed")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, limit)
      .map(assignment => ({
        ...assignment,
        course: courses.find(c => c.Id === assignment.courseId)
      }));
  }

  async create(assignmentData) {
    await delay(400);
    const maxId = Math.max(...this.assignments.map(a => a.Id), 0);
    const newAssignment = {
      Id: maxId + 1,
      ...assignmentData,
      status: "pending"
    };
    this.assignments.push(newAssignment);
    return { ...newAssignment };
  }

  async update(id, assignmentData) {
    await delay(300);
    const index = this.assignments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    this.assignments[index] = { ...this.assignments[index], ...assignmentData };
    return { ...this.assignments[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.assignments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    this.assignments.splice(index, 1);
    return true;
  }

  async getStats() {
    await delay(200);
    const now = new Date();
    const total = this.assignments.length;
    const completed = this.assignments.filter(a => a.status === "completed").length;
    const pending = this.assignments.filter(a => a.status === "pending").length;
    const overdue = this.assignments.filter(a => 
      new Date(a.dueDate) < now && a.status !== "completed"
    ).length;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

export default new AssignmentsService();