import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronDown, Terminal, Menu, X, ArrowRight, ShieldCheck, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { openAuthModal, logout, fetchMe } from '../../store/authSlice';
import { AuthModal } from '../auth/AuthModal';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAgentsDropdownOpen, setIsAgentsDropdownOpen] = useState(false);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
    }
  }, [token, user, dispatch]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#0a0a0c]/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-2.5 text-white transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#e64a19] shadow-[0_0_20px_rgba(255,107,53,0.4)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Trestle
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/solutions"
              className="text-[14px] font-medium text-slate-300 transition-colors hover:text-white"
            >
              Solutions
            </Link>

            {/* Agents Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsAgentsDropdownOpen(true)}
              onMouseLeave={() => setIsAgentsDropdownOpen(false)}
            >
              <Link
                to="/agents"
                className="flex items-center gap-1 text-[14px] font-medium text-slate-300 transition-colors hover:text-white"
              >
                Agents <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:rotate-180" />
              </Link>

              {isAgentsDropdownOpen && (
                <div className="absolute left-1/2 top-full mt-2 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#14141b]/95 p-3 shadow-2xl backdrop-blur-2xl">
                  <div className="space-y-1">
                    <Link
                      to="/agents"
                      className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.06]"
                    >
                      <div className="h-2 w-2 rounded-full bg-[#ff6b35]" />
                      <div>
                        <div className="text-xs font-semibold text-white">Autonomous Coder</div>
                        <div className="text-[11px] text-slate-400">Claude Sonnet 4.6 Clean Architecture</div>
                      </div>
                    </Link>
                    <Link
                      to="/agents"
                      className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.06]"
                    >
                      <div className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                      <div>
                        <div className="text-xs font-semibold text-white">System Architect</div>
                        <div className="text-[11px] text-slate-400">SQLAlchemy 2.0 ERD & OpenAPI 3.1</div>
                      </div>
                    </Link>
                    <Link
                      to="/agents"
                      className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.06]"
                    >
                      <div className="h-2 w-2 rounded-full bg-[#eab308]" />
                      <div>
                        <div className="text-xs font-semibold text-white">Sandbox QA Tester</div>
                        <div className="text-[11px] text-slate-400">E2B Firecracker MicroVM Pytest</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/solutions"
              className="text-[14px] font-medium text-slate-300 transition-colors hover:text-white"
            >
              Enterprise
            </Link>
            <Link
              to="/pricing"
              className="text-[14px] font-medium text-slate-300 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link
              to="/studio"
              className="flex items-center gap-1.5 text-[14px] font-semibold text-[#ff8c5a] transition-colors hover:text-white"
            >
              <Terminal className="h-3.5 w-3.5" /> Studio
            </Link>
          </nav>

          {/* Right CTA / Auth Status */}
          <div className="hidden items-center gap-4 md:flex">
            {token && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-slate-200">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b35] text-[10px] font-bold text-white uppercase">
                    {user.email.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-300 max-w-[120px] truncate">{user.full_name || user.email}</span>
                  {user.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => dispatch(openAuthModal('verify'))}
                      className="text-[10px] font-bold text-amber-400 underline"
                    >
                      Verify
                    </button>
                  )}
                </div>

                <button
                  onClick={() => dispatch(logout())}
                  title="Sign Out"
                  className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => dispatch(openAuthModal('login'))}
                  className="text-[14px] font-medium text-slate-300 transition-colors hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => dispatch(openAuthModal('register'))}
                  className="btn-orange-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold tracking-wide text-white"
                >
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:text-white md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="border-b border-white/10 bg-[#0d0d12] px-6 py-6 md:hidden">
            <div className="flex flex-col space-y-4">
              <Link
                to="/solutions"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200"
              >
                Solutions
              </Link>
              <Link
                to="/agents"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200"
              >
                Agents Workforce
              </Link>
              <Link
                to="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200"
              >
                Pricing
              </Link>
              <Link
                to="/studio"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-[#ff7d4d]"
              >
                Control Studio
              </Link>
              <div className="pt-4">
                {token && user ? (
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full rounded-full bg-white/10 py-3 text-center text-sm font-bold text-white"
                  >
                    Log Out ({user.email})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      dispatch(openAuthModal('register'));
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn-orange-glow block w-full rounded-full py-3 text-center text-sm font-bold text-white"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Auth Modal */}
      <AuthModal />
    </>
  );
};
