import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage"; 
import SignupPage from "./pages/SignupPage"; 
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import ForgotPassword from "./pages/ForgotPassword";
import UserPage from "./pages/User/UserPage";
import YourPoem from "./pages/User/YourPoem";
import CreatePoem from "./pages/User/CreatePoem"; 
import ProfilePage from "./pages/ProfilePage";
import YourDesign from "./pages/User/YourDesign";
import Shop from "./pages/ShopPage";
import TemplateDetail from "./pages/TemplateDetail";
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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:masterTemplateId" element={<TemplateDetail />} />
        {/* Nested Route trong UserPage */}
        <Route path="/userpage" element={<UserPage />}>
          <Route index element={<YourPoem borderColor="#ddd" />} /> 
          <Route path="create-poem" element={<CreatePoem />} />
          <Route index element={<YourPoem borderColor="#ddd" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
