import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { Machines } from "./pages/Machines"
import { ActiveCheckins } from "./pages/ActiveCheckins"
import "./index.css"

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/active" element={<ActiveCheckins />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
