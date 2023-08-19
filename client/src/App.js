import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StockView from './pages/StockView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stock" element={<StockView />} />
          {/* <Route path="/:username" element={<Home/>} /> */}
          <Route path="*" element={<h1>Error 404</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;