import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Users, 
  Clock, 
  CalendarOff, 
  Sliders, 
  Mail, 
  FileText, 
  Database, 
  LogOut, 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  ShieldAlert, 
  Phone,
  DollarSign,
  Lock,
  Key,
  ShieldCheck,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { 
  Appointment, 
  Service, 
  Staff, 
  BusinessDayHours, 
  BlockedDate, 
  BookingSettings, 
  AuditLog,
  ServiceCategory,
  AdminAccount
} from '../../types';
import { db } from '../../lib/db';
import { getNotificationLogs, EmailNotification } from '../../lib/notifications';
import { SUPABASE_SQL_MIGRATION } from '../../lib/supabaseMigration';
import { getLondonToday } from '../../lib/availability';
import { runAllAppletTests, TestResult } from '../../lib/tests';
import { 
  checkSupabaseConnection, 
  SUPABASE_PROJECT_ID, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SupabaseHealth 
} from '../../lib/supabase';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

type AdminTab = 
  | 'overview' 
  | 'appointments' 
  | 'services' 
  | 'staff' 
  | 'hours' 
  | 'blocked' 
  | 'settings' 
  | 'notifications' 
  | 'tests'
  | 'audit' 
  | 'database'
  | 'account';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  isOpen, 
  onClose,
  onDataChanged 
}) => {
  // Check if owner admin account is registered
  const [hasAdminAccount, setHasAdminAccount] = useState<boolean>(db.hasAdminAccount());
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(db.getAdminAccount());
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>(
    db.hasAdminAccount() ? 'login' : 'register'
  );

  // Auth form states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>(
    db.getAdminAccount()?.email || 'admin@cityoffades.co.uk'
  );
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AdminTab>('appointments'); // Default directly to all bookings

  // One-time registration form states
  const [regFullName, setRegFullName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regPin, setRegPin] = useState<string>('');
  const [regError, setRegError] = useState<string>('');

  // Password recovery states
  const [recoverEmail, setRecoverEmail] = useState<string>('');
  const [recoverPin, setRecoverPin] = useState<string>('');
  const [recoverNewPassword, setRecoverNewPassword] = useState<string>('');
  const [recoverFeedback, setRecoverFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [changeOldPassword, setChangeOldPassword] = useState<string>('');
  const [changeNewPassword, setChangeNewPassword] = useState<string>('');
  const [changePasswordFeedback, setChangePasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Detail inspection modal for booking
  const [inspectBooking, setInspectBooking] = useState<Appointment | null>(null);

  // Live database records
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessDayHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>(db.getBookingSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailNotification[]>([]);

  // Search and filter states
  const [aptSearch, setAptSearch] = useState<string>('');
  const [aptStatusFilter, setAptStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Service form modal state
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);

  // Blocked date form state
  const [newBlockedDate, setNewBlockedDate] = useState<string>(getLondonToday());
  const [newBlockedReason, setNewBlockedReason] = useState<string>('');

  // Notification email preview
  const [previewEmail, setPreviewEmail] = useState<EmailNotification | null>(null);

  // Automated QA Test Suite State
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);

  // Supabase Backend Connectivity State
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealth | null>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const handleTestSupabase = async () => {
    setIsCheckingSupabase(true);
    setSyncFeedback('');
    try {
      const health = await checkSupabaseConnection();
      setSupabaseHealth(health);
      if (health.connected) {
        const syncResult = await db.syncWithSupabase();
        setSyncFeedback(syncResult.message);
        refreshAllData();
      }
    } catch (e: any) {
      console.warn('Supabase test error', e);
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleRunTests = () => {
    setIsTestRunning(true);
    setTimeout(() => {
      const res = runAllAppletTests();
      setTestResults(res);
      setIsTestRunning(false);
      db.logAudit('admin@cityoffades.co.uk', 'EXECUTE_QA_TESTS', `Ran ${res.length} automated integration tests: ${res.filter(r => r.passed).length} passed.`);
    }, 200);
  };

  const refreshAllData = () => {
    setAppointments(db.getAppointments());
    setServices(db.getServices());
    setStaffList(db.getStaff());
    setBusinessHours(db.getBusinessHours());
    setBlockedDates(db.getBlockedDates());
    setBookingSettings(db.getBookingSettings());
    setAuditLogs(db.getAuditLogs());
    setEmailLogs(getNotificationLogs());
    const isLocked = db.hasAdminAccount();
    setHasAdminAccount(isLocked);
    const acc = db.getAdminAccount();
    setCurrentAdmin(acc);
    if (acc) {
      setAdminEmail(acc.email);
    }
    if (onDataChanged) onDataChanged();
  };

  useEffect(() => {
    if (isOpen) {
      refreshAllData();
      // Synchronize with remote Supabase bookings
      db.syncWithSupabase().then(() => {
        setAppointments(db.getAppointments());
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (db.hasAdminAccount()) {
      const res = db.verifyAdminLogin(adminEmail, adminPassword);
      if (res.success && res.account) {
        setIsAuthenticated(true);
        setCurrentAdmin(res.account);
        refreshAllData();
      } else {
        setAuthError(res.error || 'Invalid administrator email or password.');
      }
    } else {
      // Default fallback if account not yet created
      if (adminEmail.trim() === 'admin@cityoffades.co.uk' && adminPassword === 'BradfordFade2026!') {
        setIsAuthenticated(true);
        refreshAllData();
      } else {
        setAuthError('Invalid credentials. Please enter the correct password or set up your owner account.');
      }
    }
  };

  // Handle One-Time Master Admin Registration Slot
  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim()) {
      setRegError('Please provide your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please enter a valid administrator email.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    const res = db.registerAdminAccount({
      full_name: regFullName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      security_pin: regPin.trim()
    });

    if (res.success && res.account) {
      setHasAdminAccount(true);
      setCurrentAdmin(res.account);
      setIsAuthenticated(true);
      setAuthMode('login');
      refreshAllData();
    } else {
      setRegError(res.error || 'Registration failed. Registration slot may already be locked.');
    }
  };

  // Handle Security PIN Password Recovery
  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverFeedback(null);

    const res = db.resetAdminPasswordWithPin(recoverEmail, recoverPin, recoverNewPassword);
    if (res.success) {
      setRecoverFeedback({ type: 'success', text: 'Password reset successful! You may now sign in.' });
      setAdminPassword(recoverNewPassword);
      setAuthMode('login');
      refreshAllData();
    } else {
      setRecoverFeedback({ type: 'error', text: res.error || 'Password reset failed.' });
    }
  };

  // Handle Changing Password from inside Dashboard
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordFeedback(null);

    const res = db.updateAdminPassword(changeOldPassword, changeNewPassword);
    if (res.success) {
      setChangePasswordFeedback({ type: 'success', text: 'Password updated successfully!' });
      setChangeOldPassword('');
      setChangeNewPassword('');
    } else {
      setChangePasswordFeedback({ type: 'error', text: res.error || 'Failed to update password.' });
    }
  };

  // Appointment Status Transition
  const handleUpdateAptStatus = (id: string, status: Appointment['status'], reason?: string) => {
    db.updateAppointmentStatus(id, status, reason);
    refreshAllData();
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment(prev => prev ? { ...prev, status, cancellation_reason: reason } : null);
    }
  };

  // Service Save
  const handleSaveService = (service: Service) => {
    db.updateService(service);
    setIsServiceModalOpen(false);
    setEditingService(null);
    refreshAllData();
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      db.deleteService(id);
      refreshAllData();
    }
  };

  // Business Hours Update
  const handleToggleHourClosed = (dayOfWeek: number) => {
    const updated = businessHours.map(h => 
      h.day_of_week === dayOfWeek ? { ...h, is_closed: !h.is_closed, is_tentative_unconfirmed: false } : h
    );
    db.saveBusinessHours(updated);
    setBusinessHours(updated);
    refreshAllData();
  };

  const handleUpdateHourTime = (dayOfWeek: number, field: 'open_time' | 'close_time', value: string) => {
    const updated = businessHours.map(h => 
      h.day_of_week === dayOfWeek ? { ...h, [field]: value, is_tentative_unconfirmed: false } : h
    );
    db.saveBusinessHours(updated);
    setBusinessHours(updated);
    refreshAllData();
  };

  // Blocked Date Add
  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate || !newBlockedReason.trim()) return;

    db.addBlockedDate({
      id: 'blk-' + Math.random().toString(36).substring(2, 7),
      date: newBlockedDate,
      reason: newBlockedReason.trim(),
      staff_id: null,
      is_full_day: true
    });
    setNewBlockedReason('');
    refreshAllData();
  };

  const handleRemoveBlockedDate = (id: string) => {
    db.removeBlockedDate(id);
    refreshAllData();
  };

  // Download SQL Migration
  const handleDownloadSqlMigration = () => {
    const blob = new Blob([SUPABASE_SQL_MIGRATION], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '20261023_city_of_fades_supabase_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset to Factory Defaults
  const handleResetDefaults = () => {
    if (confirm('Reset database to factory seed data? This will restore original sample records.')) {
      db.resetToFactoryDefaults();
      refreshAllData();
    }
  };

  // Calculate Metrics
  const todayStr = getLondonToday();
  const todayApts = appointments.filter(a => a.appointment_date === todayStr);
  const confirmedApts = appointments.filter(a => a.status === 'confirmed');
  const completedApts = appointments.filter(a => a.status === 'completed');
  const cancelledApts = appointments.filter(a => a.status === 'cancelled');
  const totalRevenue = appointments
    .filter(a => a.status === 'completed' || a.status === 'confirmed')
    .reduce((sum, a) => sum + a.total_price, 0);

  // Services pending confirmation count
  const pendingConfirmationServicesCount = services.filter(s => s.requires_owner_confirmation).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-7xl h-[94vh] bg-[#0E1013] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800 bg-[#14161C] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold tracking-widest text-[#D4AF37] uppercase">
              CITY OF FADES
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs text-neutral-300 font-semibold">Management Console</span>
            <span className="text-[10px] text-neutral-500 font-mono">1202 Leeds Road, Bradford</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 hover:bg-neutral-800 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unauthenticated View */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#0B0C0E] overflow-y-auto">
            <div className="w-full max-w-lg bg-[#13151A] border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
              
              {/* Header based on Auth Mode & Registration Lock */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#D4AF37]">
                    CITY OF FADES · Bradford
                  </span>
                  {hasAdminAccount ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      <Lock className="w-2.5 h-2.5 text-amber-400" />
                      Slot Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      1 Slot Open
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F3ED]">
                  {authMode === 'register' && !hasAdminAccount
                    ? 'Create Master Admin Account'
                    : authMode === 'recover'
                    ? 'Security PIN Recovery'
                    : 'Admin Portal Sign In'}
                </h2>
                
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  {authMode === 'register' && !hasAdminAccount
                    ? 'Provide your details to claim the barbershop owner administrator account. Once created, registration is permanently locked.'
                    : authMode === 'recover'
                    ? 'Reset your master password using the emergency security PIN assigned during registration.'
                    : 'Access the real-time bookings roster, customer appointment requests, and shop management tools.'}
                </p>
              </div>

              {/* Status Alert Banners */}
              {!hasAdminAccount && authMode === 'register' && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block font-semibold mb-0.5">One-Time Registration Slot:</strong>
                    <span>
                      You are creating the primary admin account. As requested, once this account is created, <strong>nobody else will be allowed to register an admin account</strong>.
                    </span>
                  </div>
                </div>
              )}

              {hasAdminAccount && authMode === 'login' && (
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Registration Slot: <strong className="text-emerald-400">Permanently Locked</strong></span>
                  </div>
                  <span className="text-[10px] text-neutral-400">1 Account Active</span>
                </div>
              )}

              {/* Error & Feedback Messages */}
              {authError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {regError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {recoverFeedback && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  recoverFeedback.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/60 border-red-800 text-red-300'
                }`}>
                  {recoverFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{recoverFeedback.text}</span>
                </div>
              )}

              {/* 1. ONE-TIME OWNER REGISTRATION FORM */}
              {authMode === 'register' && !hasAdminAccount ? (
                <form onSubmit={handleRegisterAdmin} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Owner Full Name <span className="text-[#D4AF37]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Master Barber / Shop Owner"
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Admin Email Address <span className="text-[#D4AF37]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. owner@cityoffades.co.uk"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Admin Password <span className="text-[#D4AF37]">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Confirm Password <span className="text-[#D4AF37]">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Emergency Security PIN (4-6 digits)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1202"
                      value={regPin}
                      onChange={e => setRegPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] placeholder-neutral-500 font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Optional PIN used to instantly reset password if you ever forget it.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0C0E] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-4"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Create Admin Account &amp; Lock Slot Permanently</span>
                  </button>
                </form>
              ) : null}

              {/* 2. SECURE ADMIN SIGN IN FORM */}
              {authMode === 'login' || (authMode === 'register' && hasAdminAccount) ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Admin Email Address
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      required
                      placeholder="admin@cityoffades.co.uk"
                      className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-neutral-300">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError('');
                          setRecoverEmail(adminEmail);
                          setAuthMode('recover');
                        }}
                        className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      required
                      placeholder="Enter administrator password"
                      className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0C0E] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize &amp; Sign In</span>
                  </button>
                </form>
              ) : null}

              {/* 3. SECURITY PIN PASSWORD RECOVERY FORM */}
              {authMode === 'recover' ? (
                <form onSubmit={handleRecoverPassword} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Registered Owner Email
                    </label>
                    <input
                      type="email"
                      value={recoverEmail}
                      onChange={e => setRecoverEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Emergency Security PIN
                    </label>
                    <input
                      type="text"
                      placeholder="PIN set during account creation"
                      value={recoverPin}
                      onChange={e => setRecoverPin(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      New Password (min 6 characters)
                    </label>
                    <input
                      type="password"
                      value={recoverNewPassword}
                      onChange={e => setRecoverNewPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#181B22] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="w-1/3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0C0E] font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Reset Password</span>
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Registration Locked Status Note / Switch to Register if open */}
              <div className="pt-4 border-t border-neutral-800/80 text-center">
                {!hasAdminAccount && authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-xs text-[#D4AF37] hover:underline font-semibold"
                  >
                    Need to set up the owner account? Claim registration slot →
                  </button>
                )}

                {hasAdminAccount && (
                  <div className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Single-owner policy active. Additional sign-ups disabled.</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Body */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-60 bg-[#12141A] border-r border-neutral-800/80 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview &amp; KPIs</span>
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'appointments' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4" />
                  <span>Appointments</span>
                </div>
                <span className="font-mono text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                  {appointments.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'services' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Scissors className="w-4 h-4" />
                  <span>Services &amp; Pricing</span>
                </div>
                {pendingConfirmationServicesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" title="Provisional services need confirmation" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'staff' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Barbers &amp; Staff</span>
              </button>

              <button
                onClick={() => setActiveTab('hours')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'hours' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Business Hours</span>
              </button>

              <button
                onClick={() => setActiveTab('blocked')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'blocked' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CalendarOff className="w-4 h-4" />
                <span>Blocked Dates</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Booking Engine</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'notifications' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email Notifications</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('tests');
                  if (testResults.length === 0) handleRunTests();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'tests' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>QA Test Suite</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'audit' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Audit Trail</span>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'database' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Postgres / Supabase</span>
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'account' ? 'bg-[#1C2028] text-[#D4AF37] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Admin &amp; Security</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded font-mono">
                  Locked
                </span>
              </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 overflow-y-auto bg-[#0E1013]">
              
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F3ED]">Shop Management Overview</h3>
                    <p className="text-xs text-neutral-400 mt-1">Live metrics calculated directly from database records.</p>
                  </div>

                  {/* Provisional Warning Card */}
                  {pendingConfirmationServicesCount > 0 && (
                    <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <strong className="text-amber-300">{pendingConfirmationServicesCount} Services Marked as Provisional:</strong>
                          <span className="text-neutral-300 ml-1">Initial pricing and durations are flagged for owner verification before official launch.</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('services')}
                        className="px-3 py-1.5 bg-amber-500 text-black font-semibold rounded text-xs whitespace-nowrap cursor-pointer"
                      >
                        Review Services →
                      </button>
                    </div>
                  )}

                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#14161C] border border-neutral-800 p-4 rounded-xl">
                      <span className="text-[11px] text-neutral-400 uppercase font-semibold">Today's Appointments</span>
                      <div className="text-2xl font-bold font-mono text-[#F5F3ED] mt-1 tabular-nums">
                        {todayApts.length}
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">{todayStr}</span>
                    </div>

                    <div className="bg-[#14161C] border border-neutral-800 p-4 rounded-xl">
                      <span className="text-[11px] text-neutral-400 uppercase font-semibold">Confirmed Bookings</span>
                      <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                        {confirmedApts.length}
                      </div>
                      <span className="text-[11px] text-neutral-500">Active in calendar</span>
                    </div>

                    <div className="bg-[#14161C] border border-neutral-800 p-4 rounded-xl">
                      <span className="text-[11px] text-neutral-400 uppercase font-semibold">Completed Cuts</span>
                      <div className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
                        {completedApts.length}
                      </div>
                      <span className="text-[11px] text-neutral-500">Service fulfilled</span>
                    </div>

                    <div className="bg-[#14161C] border border-neutral-800 p-4 rounded-xl">
                      <span className="text-[11px] text-neutral-400 uppercase font-semibold">Est. Booking Volume</span>
                      <div className="text-2xl font-bold font-mono text-[#D4AF37] mt-1 tabular-nums">
                        £{totalRevenue.toFixed(2)}
                      </div>
                      <span className="text-[11px] text-neutral-500">GBP (In-shop settlement)</span>
                    </div>
                  </div>

                  {/* Quick Today's Agenda */}
                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#F5F3ED]">Today's Scheduled Appointments</h4>
                      <button
                        onClick={() => setActiveTab('appointments')}
                        className="text-xs text-[#D4AF37] hover:underline"
                      >
                        View All Appointments →
                      </button>
                    </div>

                    {todayApts.length === 0 ? (
                      <p className="text-xs text-neutral-500 py-4 text-center">No appointments scheduled for today yet.</p>
                    ) : (
                      <div className="divide-y divide-neutral-800/80">
                        {todayApts.map(apt => (
                          <div key={apt.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-[#D4AF37]">{apt.start_time}</span>
                              <div>
                                <span className="font-bold text-neutral-200">{apt.customer_name}</span>
                                <span className="text-neutral-500 ml-2">{apt.service_snapshot.title}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 font-mono">
                              <span>Barber: {apt.staff_name_snapshot}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                apt.status === 'confirmed' ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="space-y-5">
                  
                  {/* Top Bar with Title, Sync, and Counters */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-[#F5F3ED]">All Customer Bookings</h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#1C2028] text-[#D4AF37] border border-neutral-700 font-bold">
                          {appointments.length} Total
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Live customer appointments synced across local storage and remote Supabase database.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          setIsCheckingSupabase(true);
                          try {
                            const res = await db.syncWithSupabase();
                            setSyncFeedback(res.message);
                            refreshAllData();
                            setTimeout(() => setSyncFeedback(''), 4000);
                          } catch (e: any) {
                            setSyncFeedback('Sync error: ' + (e.message || 'Check network'));
                          } finally {
                            setIsCheckingSupabase(false);
                          }
                        }}
                        disabled={isCheckingSupabase}
                        className="px-3 py-1.5 bg-[#181B22] hover:bg-[#20242E] text-neutral-200 border border-neutral-700/80 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
                        title="Synchronize bookings with Supabase remote backend"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${isCheckingSupabase ? 'animate-spin' : ''}`} />
                        <span>{isCheckingSupabase ? 'Syncing...' : 'Sync with Supabase'}</span>
                      </button>

                      <div className="relative w-full sm:w-60">
                        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search name, phone, ref..."
                          value={aptSearch}
                          onChange={e => setAptSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 bg-[#16181E] border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <select
                        value={aptStatusFilter}
                        onChange={e => setAptStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-[#16181E] border border-neutral-700 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-[#D4AF37] shrink-0"
                      >
                        <option value="all">All ({appointments.length})</option>
                        <option value="confirmed">Confirmed ({confirmedApts.length})</option>
                        <option value="completed">Completed ({completedApts.length})</option>
                        <option value="cancelled">Cancelled ({cancelledApts.length})</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </div>
                  </div>

                  {syncFeedback && (
                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{syncFeedback}</span>
                    </div>
                  )}

                  {/* Summary Metric Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div 
                      onClick={() => setAptStatusFilter('all')}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        aptStatusFilter === 'all' ? 'bg-[#181B22] border-[#D4AF37]' : 'bg-[#121419] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Bookings</span>
                      <span className="text-xl font-bold font-mono text-[#F5F3ED]">{appointments.length}</span>
                    </div>
                    <div 
                      onClick={() => setAptStatusFilter('confirmed')}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        aptStatusFilter === 'confirmed' ? 'bg-[#181B22] border-emerald-500' : 'bg-[#121419] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Confirmed</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">{confirmedApts.length}</span>
                    </div>
                    <div 
                      onClick={() => setAptStatusFilter('completed')}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        aptStatusFilter === 'completed' ? 'bg-[#181B22] border-blue-500' : 'bg-[#121419] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Completed</span>
                      <span className="text-xl font-bold font-mono text-blue-400">{completedApts.length}</span>
                    </div>
                    <div 
                      onClick={() => setAptStatusFilter('cancelled')}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        aptStatusFilter === 'cancelled' ? 'bg-[#181B22] border-red-500' : 'bg-[#121419] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Cancelled</span>
                      <span className="text-xl font-bold font-mono text-red-400">{cancelledApts.length}</span>
                    </div>
                  </div>

                  {/* Appointments Table */}
                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl overflow-x-auto shadow-md">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1A1D24] text-neutral-400 uppercase text-[10px] font-semibold tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Ref Code</th>
                          <th className="py-3 px-4">Customer Details</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Barber</th>
                          <th className="py-3 px-4">Date &amp; Time (UK)</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                        {appointments
                          .filter(a => {
                            const q = aptSearch.toLowerCase();
                            const matchQuery = 
                              a.customer_name.toLowerCase().includes(q) ||
                              a.booking_reference.toLowerCase().includes(q) ||
                              a.customer_email.toLowerCase().includes(q) ||
                              a.customer_phone.includes(q) ||
                              (a.staff_name_snapshot || '').toLowerCase().includes(q);
                            const matchStatus = aptStatusFilter === 'all' || a.status === aptStatusFilter;
                            return matchQuery && matchStatus;
                          })
                          .map(apt => (
                            <tr key={apt.id} className="hover:bg-neutral-800/40 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-[#D4AF37]">
                                <button
                                  onClick={() => setInspectBooking(apt)}
                                  className="hover:underline flex items-center gap-1.5 text-left"
                                  title="Click to inspect complete booking details"
                                >
                                  <span>{apt.booking_reference}</span>
                                </button>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-white">{apt.customer_name}</div>
                                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                                  <a href={`tel:${apt.customer_phone}`} className="hover:text-[#D4AF37] hover:underline">
                                    {apt.customer_phone}
                                  </a>
                                  <span>·</span>
                                  <a href={`mailto:${apt.customer_email}`} className="hover:text-[#D4AF37] hover:underline truncate max-w-[150px]">
                                    {apt.customer_email}
                                  </a>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-medium text-neutral-200">{apt.service_snapshot.title}</div>
                                <div className="text-[11px] text-neutral-500 font-mono">{apt.service_snapshot.duration_minutes} mins</div>
                              </td>
                              <td className="py-3.5 px-4 text-neutral-300 font-medium">
                                {apt.staff_name_snapshot}
                              </td>
                              <td className="py-3.5 px-4 font-mono">
                                <div className="font-semibold text-white">{apt.appointment_date}</div>
                                <div className="text-neutral-400 text-[11px]">{apt.start_time} - {apt.end_time}</div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-[#D4AF37]">
                                £{apt.total_price.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  apt.status === 'confirmed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                                  apt.status === 'completed' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                                  apt.status === 'cancelled' ? 'bg-red-950 text-red-400 border border-red-800' :
                                  'bg-neutral-800 text-neutral-400 border border-neutral-700'
                                }`}>
                                  {apt.status === 'confirmed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                  {apt.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setInspectBooking(apt)}
                                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded hover:text-white transition-colors cursor-pointer"
                                    title="View full booking dossier"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  {apt.status === 'confirmed' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateAptStatus(apt.id, 'completed')}
                                        className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                        title="Mark service completed"
                                      >
                                        Complete
                                      </button>
                                      <button
                                        onClick={() => handleUpdateAptStatus(apt.id, 'cancelled', 'Cancelled by admin')}
                                        className="px-2 py-1 bg-red-900/60 hover:bg-red-800 text-red-300 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                        title="Cancel appointment"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  {apt.status === 'cancelled' && (
                                    <button
                                      onClick={() => handleUpdateAptStatus(apt.id, 'confirmed')}
                                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] transition-colors cursor-pointer"
                                    >
                                      Reactivate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>

                    {appointments.length === 0 && (
                      <div className="p-8 text-center space-y-2">
                        <Calendar className="w-8 h-8 text-neutral-600 mx-auto" />
                        <h4 className="text-sm font-bold text-neutral-300">No Bookings Recorded Yet</h4>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                          When visitors make an appointment on the site, their booking will immediately appear here and sync to your Supabase cloud backend.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: SERVICES */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-[#F5F3ED]">Services &amp; Pricing Management</h3>
                      <p className="text-xs text-neutral-400">Owner-approved pricing directly controls public website rates.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingService({
                          id: 'srv-' + Math.random().toString(36).substring(2, 7),
                          title: '',
                          category: 'fades',
                          description: '',
                          price: 20.00,
                          duration_minutes: 30,
                          buffer_minutes: 5,
                          is_active: true,
                          requires_owner_confirmation: false
                        });
                        setIsServiceModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Service</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(srv => (
                      <div key={srv.id} className="bg-[#14161C] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-[#F5F3ED]">{srv.title}</h4>
                              <span className="text-[11px] text-neutral-500 uppercase">{srv.category}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-mono font-bold text-[#D4AF37]">
                                £{srv.price.toFixed(2)}
                              </span>
                              <span className="text-[11px] text-neutral-400 block font-mono">{srv.duration_minutes}m</span>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-400 mt-2">{srv.description}</p>

                          <div className="mt-3 flex items-center gap-2">
                            {srv.requires_owner_confirmation ? (
                              <button
                                onClick={() => {
                                  const updated = { ...srv, requires_owner_confirmation: false };
                                  db.updateService(updated);
                                  refreshAllData();
                                }}
                                className="px-2 py-0.5 bg-amber-950 border border-amber-700 text-amber-300 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Owner Sign-off Needed (Click to Confirm)</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Owner Confirmed</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-neutral-800/80 mt-4 flex items-center justify-between">
                          <span className="text-[11px] text-neutral-500">
                            Status: {srv.is_active ? 'Active' : 'Hidden'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingService({ ...srv });
                                setIsServiceModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteService(srv.id)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: BUSINESS HOURS */}
              {activeTab === 'hours' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F3ED]">Business Opening Hours</h3>
                    <p className="text-xs text-neutral-400">Configure weekly open and closing times for Europe/London timezone. Availability updates immediately.</p>
                  </div>

                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1A1D24] text-neutral-400 uppercase text-[10px] font-semibold">
                        <tr>
                          <th className="py-3 px-4">Day</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Open Time</th>
                          <th className="py-3 px-4">Close Time</th>
                          <th className="py-3 px-4">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300">
                        {businessHours.map(day => (
                          <tr key={day.day_of_week} className="hover:bg-neutral-800/40">
                            <td className="py-3 px-4 font-bold text-white">{day.day_name}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleHourClosed(day.day_of_week)}
                                className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                                  day.is_closed ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                }`}
                              >
                                {day.is_closed ? 'Closed' : 'Open'}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="time"
                                disabled={day.is_closed}
                                value={day.open_time}
                                onChange={e => handleUpdateHourTime(day.day_of_week, 'open_time', e.target.value)}
                                className="px-2 py-1 bg-[#1A1D24] border border-neutral-700 rounded font-mono text-xs text-white disabled:opacity-30"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="time"
                                disabled={day.is_closed}
                                value={day.close_time}
                                onChange={e => handleUpdateHourTime(day.day_of_week, 'close_time', e.target.value)}
                                className="px-2 py-1 bg-[#1A1D24] border border-neutral-700 rounded font-mono text-xs text-white disabled:opacity-30"
                              />
                            </td>
                            <td className="py-3 px-4 text-xs">
                              {day.is_tentative_unconfirmed ? (
                                <span className="text-amber-400">Provisional setting</span>
                              ) : (
                                <span className="text-emerald-400">Verified by Owner</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: BLOCKED DATES */}
              {activeTab === 'blocked' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F3ED]">Blocked Dates &amp; Holidays</h3>
                    <p className="text-xs text-neutral-400">Block public booking on bank holidays, shop maintenance, or staff training days.</p>
                  </div>

                  {/* Add Blocked Date Form */}
                  <form onSubmit={handleAddBlockedDate} className="p-4 bg-[#14161C] border border-neutral-800 rounded-xl flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={newBlockedDate}
                        onChange={e => setNewBlockedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1A1D24] border border-neutral-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">Reason for Closure</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bank Holiday / Shop Deep Clean"
                        value={newBlockedReason}
                        onChange={e => setNewBlockedReason(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1A1D24] border border-neutral-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-lg cursor-pointer shrink-0"
                    >
                      Block Date
                    </button>
                  </form>

                  {/* Existing Blocked Dates */}
                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl divide-y divide-neutral-800">
                    {blockedDates.length === 0 ? (
                      <p className="p-4 text-xs text-neutral-500 text-center">No blocked dates scheduled.</p>
                    ) : (
                      blockedDates.map(b => (
                        <div key={b.id} className="p-3.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-white">{b.date}</span>
                            <span className="text-neutral-400 ml-3">{b.reason}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveBlockedDate(b.id)}
                            className="text-red-400 hover:text-red-300 text-xs cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: STAFF */}
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F3ED]">Barber Roster &amp; Shifts</h3>
                    <p className="text-xs text-neutral-400">Manage individual barber availability, working days, and specialisms.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {staffList.map(barber => (
                      <div key={barber.id} className="bg-[#14161C] border border-neutral-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-[#D4AF37]">
                            {barber.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{barber.name}</h4>
                            <p className="text-xs text-neutral-400">{barber.role_title}</p>
                          </div>
                        </div>

                        <div className="text-xs text-neutral-400">
                          <strong>Specialties:</strong> {barber.specialties.join(', ')}
                        </div>

                        <div className="text-xs border-t border-neutral-800 pt-2 space-y-1">
                          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Weekly Shift Status</span>
                          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayLetter, idx) => {
                              const dayNum = idx === 6 ? 0 : idx + 1;
                              const isWorking = barber.schedule.find(s => s.day_of_week === dayNum)?.is_working;
                              return (
                                <div 
                                  key={idx}
                                  className={`py-1 rounded font-bold ${
                                    isWorking ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-900 text-neutral-600'
                                  }`}
                                >
                                  {dayLetter}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F3ED]">Email Notifications Log</h3>
                    <p className="text-xs text-neutral-400">
                      Truthful provider status: Sandbox preview active. Configure SMTP/Resend keys for live transactional emails.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center justify-between">
                    <div>
                      <strong>Provider Mode:</strong> <span className="text-amber-400 font-mono">Sandbox Local Simulator</span>
                    </div>
                    <span className="text-neutral-500">Live emails ready for Resend API adapter</span>
                  </div>

                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl divide-y divide-neutral-800 text-xs">
                    {emailLogs.length === 0 ? (
                      <p className="p-4 text-center text-neutral-500">No email logs yet. Make a booking to see simulated dispatch.</p>
                    ) : (
                      emailLogs.map(log => (
                        <div key={log.id} className="p-3.5 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="font-bold text-white">{log.subject}</div>
                            <div className="text-neutral-400 text-[11px]">To: {log.recipient_email} · {new Date(log.sent_at).toLocaleTimeString()}</div>
                          </div>
                          <button
                            onClick={() => setPreviewEmail(log)}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-[#D4AF37] rounded text-xs cursor-pointer font-semibold"
                          >
                            Inspect HTML
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: QA TESTS */}
              {activeTab === 'tests' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#F5F3ED]">Automated QA &amp; Engine Tests</h3>
                      <p className="text-xs text-neutral-400">
                        Verifies real-time slot generation, collision prevention, past date exclusion, and timezone consistency.
                      </p>
                    </div>
                    <button
                      disabled={isTestRunning}
                      onClick={handleRunTests}
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestRunning ? 'animate-spin' : ''}`} />
                      <span>{isTestRunning ? 'Executing Test Suite...' : 'Run All Tests'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-[#14161C] border border-neutral-800 p-3.5 rounded-xl">
                      <span className="text-neutral-400 block text-[11px]">Total Tests</span>
                      <span className="text-xl font-bold font-mono text-white mt-1 block">
                        {testResults.length}
                      </span>
                    </div>
                    <div className="bg-[#14161C] border border-neutral-800 p-3.5 rounded-xl">
                      <span className="text-neutral-400 block text-[11px]">Passed</span>
                      <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                        {testResults.filter(r => r.passed).length}
                      </span>
                    </div>
                    <div className="bg-[#14161C] border border-neutral-800 p-3.5 rounded-xl">
                      <span className="text-neutral-400 block text-[11px]">Status</span>
                      <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                        {testResults.length > 0 && testResults.every(r => r.passed) ? '100% HEALTHY' : 'PENDING RUN'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl divide-y divide-neutral-800 text-xs">
                    {testResults.map((t, idx) => (
                      <div key={idx} className="p-3.5 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${t.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <strong className="text-white text-xs">{t.name}</strong>
                          </div>
                          <p className="text-[11px] text-neutral-400">{t.message}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-semibold text-[#D4AF37] block">{t.category}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">{t.durationMs}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: AUDIT TRAIL */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F3ED]">Administrative Audit Trail</h3>
                    <p className="text-xs text-neutral-400">Immutable chronological log of all system and administrative actions.</p>
                  </div>

                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#1A1D24] text-neutral-400 uppercase text-[10px] font-semibold">
                        <tr>
                          <th className="py-2.5 px-4">Timestamp</th>
                          <th className="py-2.5 px-4">Actor</th>
                          <th className="py-2.5 px-4">Action</th>
                          <th className="py-2.5 px-4">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-neutral-800/40">
                            <td className="py-2 px-4 text-neutral-500 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('en-GB')}
                            </td>
                            <td className="py-2 px-4 text-[#D4AF37]">{log.actor_email}</td>
                            <td className="py-2 px-4 font-bold text-white">{log.action}</td>
                            <td className="py-2 px-4 text-neutral-300 font-sans">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: DATABASE / SUPABASE EXPORT */}
              {activeTab === 'database' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F3ED]">Supabase PostgreSQL Backend</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Direct connection to your Supabase project. Every client booking is stored here in real time.
                    </p>
                  </div>

                  {/* Supabase Connection Overview Card */}
                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">Connected Project</span>
                        <h4 className="text-base font-bold text-white font-mono">{SUPABASE_PROJECT_ID}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleTestSupabase}
                          disabled={isCheckingSupabase}
                          className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSupabase ? 'animate-spin' : ''}`} />
                          <span>{isCheckingSupabase ? 'Verifying...' : 'Test Connection & Sync'}</span>
                        </button>
                        <a
                          href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <span>Open Supabase Table Editor ↗</span>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-neutral-500 font-semibold block text-[11px]">Backend URL</span>
                        <div className="p-2 bg-[#0E1013] border border-neutral-800 rounded font-mono text-[11px] text-neutral-300 select-all truncate">
                          {SUPABASE_URL}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-neutral-500 font-semibold block text-[11px]">Publishable API Key</span>
                        <div className="p-2 bg-[#0E1013] border border-neutral-800 rounded font-mono text-[11px] text-neutral-300 select-all truncate">
                          {SUPABASE_ANON_KEY.substring(0, 16)}••••••••••••••••••••
                        </div>
                      </div>
                    </div>

                    {/* Live Health Status Feedback */}
                    {supabaseHealth && (
                      <div className={`p-3.5 rounded-lg text-xs space-y-1 border ${
                        supabaseHealth.connected && supabaseHealth.tableExists
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                          : supabaseHealth.connected && !supabaseHealth.tableExists
                          ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                          : 'bg-red-950/40 border-red-800 text-red-300'
                      }`}>
                        <div className="flex items-center gap-2 font-bold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            {supabaseHealth.connected && supabaseHealth.tableExists
                              ? 'Connected to Supabase: "appointments" table is live & accepting bookings!'
                              : supabaseHealth.connected && !supabaseHealth.tableExists
                              ? 'Connected to Supabase! Action Required: Create the "appointments" table using the SQL Editor.'
                              : `Connection Notice: ${supabaseHealth.errorMessage || 'Unable to connect'}`}
                          </span>
                        </div>
                        {supabaseHealth.errorMessage && (
                          <p className="text-[11px] opacity-90">{supabaseHealth.errorMessage}</p>
                        )}
                      </div>
                    )}

                    {syncFeedback && (
                      <div className="p-2.5 bg-neutral-900 border border-neutral-700/80 rounded text-xs text-neutral-300">
                        {syncFeedback}
                      </div>
                    )}
                  </div>

                  {/* Quick Setup Guide for Barbershop Owner */}
                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">Database Setup in 3 Steps</h4>
                        <p className="text-xs text-neutral-400">If you haven't run the SQL query in Supabase yet, follow these steps:</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopySql}
                          className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className={`w-3.5 h-3.5 ${copiedSql ? 'text-black' : ''}`} />
                          <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                        </button>
                        <button
                          onClick={handleDownloadSqlMigration}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download .sql</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-[#0E1013] border border-neutral-800/80 rounded-lg space-y-1">
                        <span className="font-mono text-[#D4AF37] font-bold">1. Copy Script</span>
                        <p className="text-neutral-400">Click the "Copy SQL Schema" button above.</p>
                      </div>
                      <div className="p-3 bg-[#0E1013] border border-neutral-800/80 rounded-lg space-y-1">
                        <span className="font-mono text-[#D4AF37] font-bold">2. Paste in Supabase</span>
                        <p className="text-neutral-400">
                          Go to your <a href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`} target="_blank" rel="noreferrer" className="text-[#D4AF37] underline">SQL Editor</a> and paste the query.
                        </p>
                      </div>
                      <div className="p-3 bg-[#0E1013] border border-neutral-800/80 rounded-lg space-y-1">
                        <span className="font-mono text-[#D4AF37] font-bold">3. Click Run</span>
                        <p className="text-neutral-400">Click 'Run'. All tables, indexes, and booking policies will be ready immediately.</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <pre className="text-[11px] font-mono text-neutral-300 bg-[#0A0B0E] p-4 rounded-lg overflow-x-auto max-h-80 border border-neutral-800">
                        {SUPABASE_SQL_MIGRATION}
                      </pre>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleResetDefaults}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Factory Seed Data</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: ADMIN ACCOUNT & SECURITY */}
              {activeTab === 'account' && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F3ED]">Master Admin Account &amp; Access Control</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Manage owner credentials, verify locked registration status, and review security settings.
                    </p>
                  </div>

                  {/* Locked Registration Badge Banner */}
                  <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-emerald-300 font-bold text-sm">One-Time Registration Slot: PERMANENTLY LOCKED</strong>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900 text-emerald-200">
                            Strict Policy Active
                          </span>
                        </div>
                        <p className="text-neutral-300 mt-1">
                          In accordance with your requirements, once this primary administrator account was created, all further admin registrations were permanently disabled. Nobody else can create an admin account on this website.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Owner Profile Card */}
                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl p-5 space-y-4">
                    <h4 className="text-sm font-bold text-[#F5F3ED] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      <span>Registered Administrator Profile</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-[#0F1116] border border-neutral-800 rounded-lg">
                        <span className="text-neutral-500 font-semibold block text-[11px]">Administrator Name</span>
                        <div className="font-semibold text-white mt-1 text-sm">
                          {currentAdmin?.full_name || 'Bradford Shop Owner'}
                        </div>
                      </div>

                      <div className="p-3 bg-[#0F1116] border border-neutral-800 rounded-lg">
                        <span className="text-neutral-500 font-semibold block text-[11px]">Registered Email</span>
                        <div className="font-mono text-neutral-200 mt-1">
                          {currentAdmin?.email || adminEmail}
                        </div>
                      </div>

                      <div className="p-3 bg-[#0F1116] border border-neutral-800 rounded-lg">
                        <span className="text-neutral-500 font-semibold block text-[11px]">Registration Lock</span>
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Enforced &amp; Locked</span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#0F1116] border border-neutral-800 rounded-lg">
                        <span className="text-neutral-500 font-semibold block text-[11px]">Account ID</span>
                        <div className="font-mono text-neutral-400 mt-1 text-[11px] truncate">
                          {currentAdmin?.id || 'admin-master-001'}
                        </div>
                      </div>

                      <div className="p-3 bg-[#0F1116] border border-neutral-800 rounded-lg">
                        <span className="text-neutral-500 font-semibold block text-[11px]">Emergency Recovery PIN</span>
                        <div className="font-mono text-neutral-200 mt-1 flex items-center gap-2">
                          <span>{currentAdmin?.security_pin ? '•••• (Configured)' : 'None set'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#0F1116] border border-neutral-800 rounded-lg">
                        <span className="text-neutral-500 font-semibold block text-[11px]">Created At</span>
                        <div className="font-mono text-neutral-400 mt-1 text-[11px]">
                          {currentAdmin?.created_at ? new Date(currentAdmin.created_at).toLocaleString('en-GB') : 'Initial Setup'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Change Password Form */}
                  <div className="bg-[#14161C] border border-neutral-800 rounded-xl p-5 space-y-4">
                    <h4 className="text-sm font-bold text-[#F5F3ED] flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#D4AF37]" />
                      <span>Update Administrator Password</span>
                    </h4>

                    {changePasswordFeedback && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                        changePasswordFeedback.type === 'success'
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-red-950/60 border-red-800 text-red-300'
                      }`}>
                        {changePasswordFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        )}
                        <span>{changePasswordFeedback.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                      <div>
                        <label className="text-xs font-semibold text-neutral-300 block mb-1">
                          Current Admin Password *
                        </label>
                        <input
                          type="password"
                          value={changeOldPassword}
                          onChange={e => setChangeOldPassword(e.target.value)}
                          required
                          placeholder="Enter current password"
                          className="w-full px-3.5 py-2 bg-[#181B22] border border-neutral-700 rounded-lg text-xs text-[#F5F3ED] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-neutral-300 block mb-1">
                          New Password * (min 6 characters)
                        </label>
                        <input
                          type="password"
                          value={changeNewPassword}
                          onChange={e => setChangeNewPassword(e.target.value)}
                          required
                          placeholder="Enter new strong password"
                          className="w-full px-3.5 py-2 bg-[#181B22] border border-neutral-700 rounded-lg text-xs text-[#F5F3ED] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0C0E] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Update Master Password
                      </button>
                    </form>
                  </div>

                  {/* Public Entry Point Policy Reminder */}
                  <div className="p-4 bg-[#14161C] border border-neutral-800 rounded-xl space-y-2 text-xs text-neutral-400">
                    <span className="font-semibold text-neutral-300 block">Footer Navigation Policy:</span>
                    <p>
                      The admin login and setup link is placed exclusively in the footer of the website. No admin buttons or sign-in triggers exist in the header, navigation bar, hero, or service cards.
                    </p>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

      </div>

      {/* Edit Service Modal */}
      {isServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-[#16181E] border border-neutral-700 rounded-xl p-6 space-y-4 text-xs">
            <h4 className="text-base font-bold text-white">
              {editingService.title ? 'Edit Service' : 'Add New Service'}
            </h4>

            <div>
              <label className="text-neutral-300 block mb-1">Service Title *</label>
              <input
                type="text"
                value={editingService.title}
                onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#101216] border border-neutral-700 rounded text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-300 block mb-1">Price (£ GBP) *</label>
                <input
                  type="number"
                  step="0.50"
                  value={editingService.price}
                  onChange={e => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-[#101216] border border-neutral-700 rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Duration (mins) *</label>
                <input
                  type="number"
                  step="5"
                  value={editingService.duration_minutes}
                  onChange={e => setEditingService({ ...editingService, duration_minutes: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 bg-[#101216] border border-neutral-700 rounded text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-300 block mb-1">Category</label>
              <select
                value={editingService.category}
                onChange={e => setEditingService({ ...editingService, category: e.target.value as ServiceCategory })}
                className="w-full px-3 py-2 bg-[#101216] border border-neutral-700 rounded text-white capitalize"
              >
                <option value="fades">Fades &amp; Tapers</option>
                <option value="haircuts">Haircuts</option>
                <option value="beards">Beards &amp; Shaves</option>
                <option value="combos">Full Packages</option>
                <option value="junior">Junior &amp; Students</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-300 block mb-1">Description</label>
              <textarea
                rows={2}
                value={editingService.description}
                onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#101216] border border-neutral-700 rounded text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingService.requires_owner_confirmation}
                  onChange={e => setEditingService({ ...editingService, requires_owner_confirmation: e.target.checked })}
                  className="rounded text-[#D4AF37]"
                />
                <span className="text-neutral-300">Flag as Provisional</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveService(editingService)}
                  className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold rounded"
                >
                  Save Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspect HTML Email Modal */}
      {previewEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-xl p-6 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <span className="font-bold text-white text-xs">{previewEmail.subject}</span>
              <button onClick={() => setPreviewEmail(null)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div 
              className="bg-white text-black p-4 rounded-lg max-h-96 overflow-y-auto text-xs"
              dangerouslySetInnerHTML={{ __html: previewEmail.html_content }}
            />
          </div>
        </div>
      )}

      {/* Inspect Booking Dossier Modal */}
      {inspectBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#14161C] border border-neutral-700 rounded-2xl p-6 space-y-5 text-xs shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">Booking Dossier</span>
                <span className="font-mono px-2 py-0.5 rounded bg-neutral-800 text-[#D4AF37] font-bold text-xs">
                  #{inspectBooking.booking_reference}
                </span>
              </div>
              <button
                onClick={() => setInspectBooking(null)}
                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Contact Details */}
            <div className="bg-[#0F1116] border border-neutral-800 rounded-xl p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                Client Contact Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Full Name</span>
                  <span className="font-bold text-white text-sm">{inspectBooking.customer_name}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Telephone</span>
                  <a href={`tel:${inspectBooking.customer_phone}`} className="font-mono text-[#D4AF37] hover:underline font-semibold flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{inspectBooking.customer_phone}</span>
                  </a>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-neutral-500 block text-[11px]">Email Address</span>
                  <a href={`mailto:${inspectBooking.customer_email}`} className="font-mono text-neutral-300 hover:underline flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{inspectBooking.customer_email}</span>
                  </a>
                </div>
                {inspectBooking.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-neutral-800">
                    <span className="text-neutral-500 block text-[11px]">Special Requests / Notes</span>
                    <p className="text-neutral-200 bg-[#161922] p-2.5 rounded-lg border border-neutral-800 mt-1 italic">
                      "{inspectBooking.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Service & Schedule Details */}
            <div className="bg-[#0F1116] border border-neutral-800 rounded-xl p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                Appointment Particulars
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Service</span>
                  <span className="font-semibold text-white">{inspectBooking.service_snapshot.title}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Assigned Barber</span>
                  <span className="font-semibold text-white">{inspectBooking.staff_name_snapshot}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Scheduled Date</span>
                  <span className="font-mono text-white font-semibold">{inspectBooking.appointment_date}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Time Window (London)</span>
                  <span className="font-mono text-white font-semibold">
                    {inspectBooking.start_time} - {inspectBooking.end_time}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Duration</span>
                  <span className="font-mono text-neutral-300">{inspectBooking.service_snapshot.duration_minutes} mins</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">In-Shop Price</span>
                  <span className="font-mono text-[#D4AF37] font-bold text-sm">
                    £{inspectBooking.total_price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Immediate Transition Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Current Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  inspectBooking.status === 'confirmed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  inspectBooking.status === 'completed' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                  inspectBooking.status === 'cancelled' ? 'bg-red-950 text-red-400 border border-red-800' :
                  'bg-neutral-800 text-neutral-400'
                }`}>
                  {inspectBooking.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {inspectBooking.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateAptStatus(inspectBooking.id, 'completed');
                        setInspectBooking(prev => prev ? { ...prev, status: 'completed' } : null);
                      }}
                      className="px-3 py-1.5 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 font-bold rounded text-xs transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateAptStatus(inspectBooking.id, 'cancelled', 'Cancelled by admin');
                        setInspectBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
                      }}
                      className="px-3 py-1.5 bg-red-900/70 hover:bg-red-800 text-red-200 font-bold rounded text-xs transition-colors cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                {inspectBooking.status === 'cancelled' && (
                  <button
                    onClick={() => {
                      handleUpdateAptStatus(inspectBooking.id, 'confirmed');
                      setInspectBooking(prev => prev ? { ...prev, status: 'confirmed' } : null);
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded text-xs transition-colors cursor-pointer"
                  >
                    Reactivate
                  </button>
                )}
                <button
                  onClick={() => setInspectBooking(null)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
