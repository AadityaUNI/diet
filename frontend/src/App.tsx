import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProtectedRoute from "./auth/ProtectedRoute";
import { RecommendPage } from "./pages/RecommendPage";
import PlanEditorPage from "./pages/PlanEditorPage";
import AfterSignupPage from "./pages/AfterSignupPage";
import "@/styles/index.css"

function App() {
  
  return (
    // renders landing page if not logged in 
    <Routes> 
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/recommend" element={<ProtectedRoute><RecommendPage /></ProtectedRoute>} />
        <Route path="/plans/new" element={<ProtectedRoute><PlanEditorPage /></ProtectedRoute>} />
        <Route path="/plans/:planId/edit" element={<ProtectedRoute><PlanEditorPage /></ProtectedRoute>} />
        <Route path="/after-signup" element={<ProtectedRoute><AfterSignupPage /></ProtectedRoute>} />
        <Route path="/landing" element={<Landing />} />
    </Routes>
  )
}

export default App;