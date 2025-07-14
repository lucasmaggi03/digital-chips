import { BrowserRouter, Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages/IndexPage";
import { PokerSettings } from "./pages/PokerSettings";
import { SelectMode } from "./pages/SelectMode";
import { PokerGame } from "./pages/PokerGame";

export default function AppRouter () {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<IndexPage/>} index/>
            <Route path='/selectmode' element={<SelectMode/>} index/>
            <Route path='/poker' element={<PokerSettings/>} index/>
            <Route path='/pokergame' element={<PokerGame/>} index/>
        </Routes>
    </BrowserRouter>
  )
}
