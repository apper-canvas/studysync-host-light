import coursesData from "@/services/mockData/courses.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CoursesService {
  constructor() {
    this.courses = [...coursesData];
  }

  async getAll() {
    await delay(300);
    return [...this.courses];
  }

  async getById(id) {
    await delay(200);
    const course = this.courses.find(c => c.Id === parseInt(id));
    if (!course) {
      throw new Error("Course not found");
    }
    return { ...course };
  }

  async create(courseData) {
    await delay(400);
    const maxId = Math.max(...this.courses.map(c => c.Id), 0);
    const newCourse = {
      Id: maxId + 1,
      ...courseData,
      isActive: true
    };
    this.courses.push(newCourse);
    return { ...newCourse };
  }

  async update(id, courseData) {
    await delay(300);
    const index = this.courses.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Course not found");
    }
    this.courses[index] = { ...this.courses[index], ...courseData };
    return { ...this.courses[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.courses.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Course not found");
    }
    this.courses.splice(index, 1);
    return true;
  }

  async getActiveCourses() {
    await delay(200);
    return this.courses.filter(c => c.isActive).map(c => ({ ...c }));
  }
}

export default new CoursesService();