import { BrowserRouter, Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages/IndexPage";
import { SingleMode } from "./pages/SingleMode";

export default function AppRouter () {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<IndexPage/>} index/>
            <Route path='/singlemode' element={<SingleMode/>} index/>
        </Routes>
    </BrowserRouter>
  )
}
