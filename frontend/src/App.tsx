import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/generated";
import ProtectedRoute from "./auth/ProtectedRoute";
import "@/styles/index.css"

function App() {
  
  return (
    // renders landing page if not logged in 
    <Routes> 
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/landing" element={<Landing />} />
    </Routes>
  )
}

export default App;