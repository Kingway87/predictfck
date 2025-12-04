import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import AnimatedBackground from './components/AnimatedBackground';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ComparisonPage from './pages/ComparisonPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <Navigation />
          <div className="pt-20">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/comparison" element={<ComparisonPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
