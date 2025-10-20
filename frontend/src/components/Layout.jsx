import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Folder, Users, Settings, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Folder, label: 'Projects' },
    { path: '/experts', icon: Users, label: 'Experts' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b-4 border-foreground bg-primary p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-foreground p-2 border-brutal-sm">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
                APP AUDITOR
              </h1>
            </Link>
            <nav className="hidden md:flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 border-brutal-sm font-semibold uppercase text-sm transition-brutal',
                      isActive
                        ? 'bg-foreground text-background shadow-none translate-x-1 translate-y-1'
                        : 'bg-background text-foreground shadow-brutal hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b-4 border-foreground bg-muted p-2">
        <div className="container mx-auto flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2 px-2 border-2 font-bold uppercase text-xs transition-brutal',
                  isActive
                    ? 'bg-primary text-primary-foreground border-foreground'
                    : 'bg-background text-foreground border-transparent hover:border-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-foreground bg-muted p-4 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-wide">
            Powered by Groq Fast Inference API
          </p>
        </div>
      </footer>
    </div>
  );
};
