import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Courses from "@/components/pages/Courses";
import Assignments from "@/components/pages/Assignments";
import Grades from "@/components/pages/Grades";
import Calendar from "@/components/pages/Calendar";
import Timer from "@/components/pages/Timer";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="grades" element={<Grades />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="timer" element={<Timer />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="toast-container"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;