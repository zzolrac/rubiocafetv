import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import Screens from './pages/Screens';
import Preview from './pages/Preview';
import Products from './pages/Products';
import Promotions from './pages/Promotions';
import Suggestions from './pages/Suggestions';
import SuggestionForm from './pages/SuggestionForm';
import MasterKeyGate from './pages/MasterKeyGate';
import Sidebar from './components/Sidebar';
import { useMasterKeyStore } from './store/masterKeyStore';

function App() {
  const isPreviewRoute = window.location.pathname.startsWith('/pantalla/') || 
                        window.location.pathname.startsWith('/p/');
  const isSuggestionRoute = window.location.pathname.startsWith('/sugerencias');
  const isUnlocked = useMasterKeyStore((s) => s.isUnlocked);

  if (isPreviewRoute) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/pantalla/:screenId" element={<Preview />} />
          <Route path="/p/:shortUrl" element={<Preview />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (isSuggestionRoute) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/sugerencias" element={<SuggestionForm />} />
          <Route path="/sugerencias/*" element={<SuggestionForm />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (!isUnlocked) {
    return <MasterKeyGate />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/screens" element={<Screens />} />
            <Route path="/products" element={<Products />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
