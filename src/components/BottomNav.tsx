import React from 'react';
import { Home, PlusCircle, Wallet, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/add', icon: PlusCircle, label: 'Add' },
    { path: '/wallets', icon: Wallet, label: 'Wallets' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-card z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center py-3 transition-all',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform',
                    isActive && 'scale-110'
                  )}
                />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 h-1 w-12 bg-gradient-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
