import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import AdminPage from "./pages/Admin/AdminPage";
import Shop from "./pages/ShopPage";
import TemplateDetail from "./pages/TemplateDetail";
import DesignPage from "./pages/User/DesignPage";
import PoemDetail from "./pages/PoemDetail";
import CollectionDetail from "./pages/CollectionDetail";
import AboutPoemTown from "./pages/AboutPoemTown";
import ModeratorPage from "./pages/Moderator/ModeratorPage";
import SuccessPage from "./pages/SuccessPage";
import FailPage from "./pages/FailPage";
import KnowledgePage from "./pages/KnowledgePage";
import YourWallet from "./pages/User/YourWallet";
const AdminRoute = ({ element }) => {
  const role = JSON.parse(localStorage.getItem("role")) || [];

  return role.includes("ADMIN") ? element : <Navigate to="/" replace />;
};
const ModRoute = ({ element }) => {
  const role = JSON.parse(localStorage.getItem("role")) || [];

  return role.includes("MODERATOR") ? element : <Navigate to="/" replace />;
};
const PrivateRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return isLoggedIn ? children : <Navigate to="/" replace />;
};

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
        <Route
          path="/payment/success"
          element={
            <PrivateRoute>
              <SuccessPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment/fail"
          element={
            <PrivateRoute>
              <FailPage />
            </PrivateRoute>
          }
        />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/admin" element={<AdminRoute element={<AdminPage />} />} />
        <Route path="/mod" element={<ModRoute element={<ModeratorPage />} />} />

        {/* User Page với nested routes */}
        {/* <Route path="/userpage" element={<UserPage />}>
                  <Route index element={<YourPoem borderColor="#ddd" />} />
                  <Route path="create-poem" element={<CreatePoem />} />
              </Route> */}
        <Route path="/about-poemtown" element={<AboutPoemTown />} />
        <Route path="/design" element={<DesignPage />} />
        <Route path="/user/:username" element={<UserPage />} />
        <Route path="/poem/:id" element={<PoemDetail />} />
        <Route path="/collection/:id" element={<CollectionDetail />} />
      </Routes>
    </Router>

  );
}

export default App;