import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Analisis from "./pages/Analisis"
import Loading from "./pages/Loading"
import Resultados from "./pages/Resultados"

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analisis" element={<Analisis />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/resultados" element={<Resultados />} />
      </Routes>
    </BrowserRouter>
  )
}