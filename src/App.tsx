import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Analisis from "./pages/Analisis"
import Loading from "./pages/Loading"
import Resultados from "./pages/Resultados"
import Comparador from "./pages/Comparador"
import Reportes from "./pages/Reportes"

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analisis" element={<Analisis />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/comparador" element={<Comparador />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </BrowserRouter>
  )
}