import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VaultProvider } from './store/vault.store';
import Sidebar from './components/Sidebar';
import VaultView from './views/VaultView';
import CaptureView from './views/CaptureView';
import GraphView from './views/GraphView';
import TimelineView from './views/TimelineView';
import ScriptView from './views/ScriptView';
import ExportView from './views/ExportView';

function AppContent() {
  // notes est chargé via le store, affiché dans VaultView

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<VaultView />} />
          <Route path="/capture" element={<CaptureView />} />
          <Route path="/graph" element={<GraphView />} />
          <Route path="/timeline" element={<TimelineView />} />
          <Route path="/script" element={<ScriptView />} />
          <Route path="/export" element={<ExportView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <VaultProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </VaultProvider>
  );
}
