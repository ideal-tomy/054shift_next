import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import StaffManagementPage from './pages/StaffManagementPage';
import ShiftSubmissionPage from './pages/ShiftSubmissionPage';
import ShiftManagementDashboardPage from './pages/ShiftManagementDashboardPage';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/layout/Layout'; // Import the Layout component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/staff" element={<Layout><StaffManagementPage /></Layout>} />
        <Route path="/shift-submission" element={<Layout><ShiftSubmissionPage /></Layout>} />
        <Route path="/shift-dashboard" element={<Layout><ShiftManagementDashboardPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

