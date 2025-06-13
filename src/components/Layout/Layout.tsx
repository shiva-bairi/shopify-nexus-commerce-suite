
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Don't show bottom nav on auth pages
  const hideBottomNav = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-1 ${!hideBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      <Footer />
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
};

export default Layout;
