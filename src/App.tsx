import React, { useState, lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { AlertsProvider } from './context/AlertsContext';
import { Bug } from 'lucide-react';
import type { SystemUser } from './data/mockData';
import { SearchLoadingSkeleton } from './components/ui';

// Lazy load heavy components for better performance
const MockLogin = lazy(() => import('./components/MockLogin'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const OrganizationsDashboard = lazy(() => import('./components/OrganizationsDashboard'));
const FamiliesDashboard = lazy(() => import('./components/FamiliesDashboard'));
const BeneficiaryPortal = lazy(() => import('./components/BeneficiaryPortal'));
const BeneficiarySearchPage = lazy(() => import('./components/pages/BeneficiarySearchPage'));
const ErrorConsole = lazy(() => import('./components/ErrorConsole').then(module => ({ default: module.ErrorConsole })));

type PageType = 'landing' | 'admin' | 'organizations' | 'families' | 'beneficiary' | 'search';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [showErrorConsole, setShowErrorConsole] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleNavigateTo = (page: string) => {
    setCurrentPage(page as PageType);
    setActiveTab('overview');
  };

  const handleNavigateBack = () => {
    setCurrentPage('landing');
    setActiveTab('overview');
  };

  return (
    <AuthProvider>
      <AlertsProvider>
        <ErrorBoundary componentName="App">
          <AppContent 
            currentPage={currentPage}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleNavigateTo={handleNavigateTo}
            handleNavigateBack={handleNavigateBack}
            showErrorConsole={showErrorConsole}
            setShowErrorConsole={setShowErrorConsole}
          />
        </ErrorBoundary>
      </AlertsProvider>
    </AuthProvider>
  );
}

interface AppContentProps {
  currentPage: PageType;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleNavigateTo: (page: string) => void;
  handleNavigateBack: () => void;
  showErrorConsole: boolean;
  setShowErrorConsole: (show: boolean) => void;
}

function AppContent({ 
  currentPage, 
  activeTab, 
  setActiveTab, 
  handleNavigateTo, 
  handleNavigateBack,
  showErrorConsole,
  setShowErrorConsole 
}: AppContentProps) {
  const { loggedInUser, login, logout } = useAuth();

  const handleLogin = (user: SystemUser) => {
    login(user);

    if (user.roleId === 'admin' || user.associatedType === null) {
      handleNavigateTo('admin');
    } else if (user.associatedType === 'organization') {
      handleNavigateTo('organizations');
    } else if (user.associatedType === 'family') {
      handleNavigateTo('families');
    } else {
      handleNavigateTo('admin');
    }
  };

  const handleLogout = () => {
    logout();
    handleNavigateTo('landing');
    setActiveTab('overview');
  };

  if (!loggedInUser && currentPage !== 'landing') {
    return (
      <Suspense fallback={<SearchLoadingSkeleton message="جاري تحميل صفحة تسجيل الدخول..." />}>
        <ErrorBoundary componentName="MockLogin">
          <MockLogin onLogin={handleLogin} />
        </ErrorBoundary>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={<SearchLoadingSkeleton message="جاري تحميل الصفحة..." />}>
        {currentPage === 'landing' && (
          <ErrorBoundary componentName="LandingPage">
            <LandingPage onNavigateTo={handleNavigateTo} />
          </ErrorBoundary>
        )}
        {currentPage === 'admin' && loggedInUser && (
          <ErrorBoundary componentName="AdminDashboard">
            <AdminDashboard
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </ErrorBoundary>
        )}
        {currentPage === 'organizations' && loggedInUser && (
          <ErrorBoundary componentName="OrganizationsDashboard">
            <OrganizationsDashboard onNavigateBack={handleNavigateBack} />
          </ErrorBoundary>
        )}
        {currentPage === 'families' && loggedInUser && (
          <ErrorBoundary componentName="FamiliesDashboard">
            <FamiliesDashboard onNavigateBack={handleNavigateBack} />
          </ErrorBoundary>
        )}
        {currentPage === 'beneficiary' && (
          <ErrorBoundary componentName="BeneficiaryPortal">
            <BeneficiaryPortal onBack={handleNavigateBack} />
          </ErrorBoundary>
        )}
        {currentPage === 'search' && (
          <ErrorBoundary componentName="BeneficiarySearchPage">
            <BeneficiarySearchPage />
          </ErrorBoundary>
        )}
      </Suspense>

      {process.env.NODE_ENV === 'development' && (
        <>
          <button
            onClick={() => setShowErrorConsole(true)}
            className="fixed bottom-4 left-4 bg-red-600 text-white p-3 rounded-full border border-red-700 hover:bg-red-700 transition-colors z-40"
            title="فتح وحدة تحكم الأخطاء"
          >
            <Bug className="w-4 h-4" />
          </button>

          <Suspense fallback={null}>
            <ErrorConsole
              isOpen={showErrorConsole}
              onClose={() => setShowErrorConsole(false)}
            />
          </Suspense>
        </>
      )}

      {loggedInUser && currentPage !== 'landing' && (
        <button
          onClick={handleLogout}
          className="fixed top-4 left-4 bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors z-40 flex items-center border border-gray-700"
        >
          تسجيل الخروج
        </button>
      )}
    </div>
  );
}

export default App;