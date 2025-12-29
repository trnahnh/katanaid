import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import { Toaster } from 'sonner'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/Dashboard'

function App() {

  return (
    <>
      <NavBar />
      <Toaster position="top-center"/>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/signup' element={<SignupPage/>}/>
        <Route path='/dashboard' element={<DashboardPage/>}/>
      </Routes>
    </>
  )
}

export default App
