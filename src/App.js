import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage"; 
import SignupPage from "./pages/SignupPage"; 
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import ForgotPassword from "./pages/ForgotPassword";
import UserPage from "./pages/User/UserPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/:tab" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/confirm-email" element={<EmailConfirmationPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/userpage" element={<UserPage />} />
      </Routes>
    </Router>
  );
}

export default App;
