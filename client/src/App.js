import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/"  element={<Home />} />
          {/* <Route path="/:username"  element={<Home/>} /> */}
          <Route path='*' element={<h1>Error 404</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
