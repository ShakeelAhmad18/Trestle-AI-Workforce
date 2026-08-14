import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { StudioPage } from './pages/StudioPage';
import { AgentsPage } from './pages/AgentsPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { PricingPage } from './pages/PricingPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-[#0a0a0c] text-slate-100 font-sans selection:bg-[#ff6b35]/30 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
