import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import { Toaster } from 'sonner'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function App() {

  return (
    <>
      <NavBar />
      <Toaster />
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/signup' element={<SignupPage/>}/>
      </Routes>
    </>
  )
}

export default App
