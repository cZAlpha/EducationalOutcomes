import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from './pages/Dashboard' // Page imports (and no, you can't do it all in one line because React is retarded)
import Login from "./pages/Login" 
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute" // Protected Route import
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'


function Logout() { 
  localStorage.clear() // Clears browser cache
  return <Navigate to="/login" /> // Goes to the login page thru routing
}

function RegisterAndLogout() {
  localStorage.clear() // Clears browser cache
  return <Register /> // Goes back to the register page
}

// Define a shared gradient component
const PersistentGradient = () => (
  <ShaderGradientCanvas
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -1,
      pointerEvents: "none",
    }}
  >
    <ShaderGradient
      type="plane"
      control="props"
      color1="#cfe7d0"
      color2="#a9d1a1"
      color3="#87bc8a"
      bgColor1="#000000"
      bgColor2="#000000"
      rotationX={0}
      rotationY={10}
      rotationZ={50}
      positionX={-1.4}
      positionY={0}
      positionZ={0}
      cDistance={3.6}
      cAzimuthAngle={180}
      cPolarAngle={90}
      cameraZoom={1}
      uDensity={1.3}
      uFrequency={5.5}
      uStrength={4}
      uSpeed={0.2}
      brightness={1.0}
      reflection={0.1}
      grain="off"
      lightType="3d"
    />
  </ShaderGradientCanvas>
);


function App() {
  return (
    <BrowserRouter>
      <PersistentGradient/>
      <Routes>
        <Route path="/dashboard" element={ // On the "/" route establish a protected route and place the Dashboard page component inside
            <ProtectedRoute>
              <Dashboard /> 
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home />} />                         {/* Home page / landing page */}
        <Route path="/login" element={<Login />} />                   {/* Login page */}
        <Route path="/logout" element={<Logout />} />                 {/* Logout 'page' */}
        <Route path="/register" element={<RegisterAndLogout />} />    {/* Login page */}
        <Route path="*" element={<NotFound />}></Route>               {/* Notfound page (404 page) */}
      </Routes>
    </BrowserRouter>
  )
}

export default App