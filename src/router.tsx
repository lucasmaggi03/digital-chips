import { BrowserRouter, Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages/IndexPage";
import { Poker } from "./pages/Poker";
import { SelectMode } from "./pages/SelectMode";

export default function AppRouter () {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<IndexPage/>} index/>
            <Route path='/selectmode' element={<SelectMode/>} index/>
            <Route path='/poker' element={<Poker/>} index/>
        </Routes>
    </BrowserRouter>
  )
}
