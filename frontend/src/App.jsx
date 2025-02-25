import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from './pages/Dashboard' // Page imports (and no, you can't do it all in one line because React is dumb)
import UserDashboard from "./pages/UserDashboard"
import Login from "./pages/Login" 
import Home from "./pages/Home"
import Account from "./pages/Account"
import Courses from "./pages/Courses"
import Navbar from "./components/Navbar"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute" // Protected Route import
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'


function Logout() { 
  localStorage.clear() // Clears browser cache
  return <Navigate to="/login" /> // Goes to the login page thru routing
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
      color1="#419cd6"
      color2="#1c4c71"
      color3="#c23232"
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
      uSpeed={0.1}
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
      <PersistentGradient /* Adds a persistent gradient that is on every page */ />
      <Navbar /* Global navbar */ /> 
      <Routes>
        {/* <Route path="/dashboard" element={ // MIGHT NOT USE THIS!!!!
            <ProtectedRoute>
              <Dashboard /> 
            </ProtectedRoute>
          }
        />
        <Route path="/userdashboard" element={ // MIGHT NOT USE THIS!!!!
            <ProtectedRoute>
              <UserDashboard /> 
            </ProtectedRoute>
          }
        /> */}
        <Route path="/account" element={                             /* Account page (Protected) */
          <ProtectedRoute>
            <Account/>
          </ProtectedRoute>
        }
        />
        <Route path="/courses" element={                             /* Courses page (Protected) */
          <ProtectedRoute>
            <Courses/>
          </ProtectedRoute>
        }
        />
        <Route path="/" element={<Home />} />                         {/* Home page / landing page */}
        <Route path="/login" element={<Login />} />                   {/* Login page */}
        <Route path="/logout" element={<Logout />} />                 {/* Logout 'page' */}
        <Route path="*" element={<NotFound />}></Route>               {/* Notfound page (404 page) */}
      </Routes>
    </BrowserRouter>
  )
}

export default App