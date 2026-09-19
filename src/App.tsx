import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layouts/Navbar';
import { Sidebar } from './components/layouts/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { FilePreviewModal } from './components/common/FilePreviewModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateProfilePage } from './pages/CandidateProfilePage';
import { UploadCenterPage } from './pages/UploadCenterPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { SkillsPage } from './pages/SkillsPage';
import { EvidenceCenterPage } from './pages/EvidenceCenterPage';
import { ClaimVsProofPage } from './pages/ClaimVsProofPage';
import { PracticalChallengesPage } from './pages/PracticalChallengesPage';
import { EvidenceGraphPage } from './pages/EvidenceGraphPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { VerificationPage } from './pages/VerificationPage';
import { ReportsPage } from './pages/ReportsPage';
import { ImportCenterPage } from './pages/ImportCenterPage';
import { SettingsPage } from './pages/SettingsPage';

const MainLayout: React.FC = () => {
  const { currentView, setIsSearchOpen } = useApp();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading SkillProof...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">SkillProof</h1>
          <p className="text-slate-600 mb-6">Don't Hire the Resume. Hire the Proof.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
            const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
            // This would need to be connected to the auth context
            console.log('Login attempt:', email);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            First time?{' '}
            <button className="text-slate-900 hover:underline">Create an account</button>
          </p>
        </div>
      </div>
    );
  }

  // Global shortcut: ⌘K or Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  const renderActiveView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewPage />;
      case 'candidates':
        return <CandidatesPage />;
      case 'candidate-profile':
        return <CandidateProfilePage />;
      case 'upload-center':
        return <UploadCenterPage />;
      case 'claims':
        return <ClaimsPage />;
      case 'skills':
        return <SkillsPage />;
      case 'evidence':
        return <EvidenceCenterPage />;
      case 'claim-vs-proof':
        return <ClaimVsProofPage />;
      case 'challenges':
        return <PracticalChallengesPage />;
      case 'evidence-graph':
        return <EvidenceGraphPage />;
      case 'assessments':
        return <AssessmentsPage />;
      case 'verification':
        return <VerificationPage />;
      case 'reports':
        return <ReportsPage />;
      case 'import-center':
        return <ImportCenterPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 font-sans flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="flex-1 flex w-full">
        {/* Responsive Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <FilePreviewModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
