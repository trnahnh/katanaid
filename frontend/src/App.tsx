import { Route, Routes, Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'
import { Toaster } from 'sonner'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/Dashboard'

const PublicLayout = () => (
  <>
    <NavBar />
    <Outlet />
  </>
)

const DashboardLayout = () => (
  <Outlet />
)

function App() {

  return (
    <>
      <Toaster position="top-center"/>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignupPage/>}/>
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path='/dashboard' element={<DashboardPage/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
