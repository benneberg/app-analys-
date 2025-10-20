import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout';
import { ProjectsPage } from './pages/ProjectsPage';
import { ExpertsPage } from './pages/ExpertsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ProjectsPage />} />
            <Route path="/experts" element={<ExpertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
