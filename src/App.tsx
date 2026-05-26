import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import MapSelector from "./pages/MapSelector"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapSelector />} />
      </Routes>
    </BrowserRouter>
  )
}