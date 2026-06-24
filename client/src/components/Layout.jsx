import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, CloudSun, Leaf, LogOut, Menu, ShieldCheck, UserRound, X, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { navigation } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

const icons = {
  dashboard: Leaf,
  recommendations: ShieldCheck,
  weather: CloudSun,
  schemes: ShieldCheck,
  community: UserRound,
  disease: Leaf
};

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const { language, t, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((res) => res.data.data.notifications),
    refetchInterval: 15000 // poll every 15 seconds
  });
  const notifications = notifData || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark single read
  const markReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all read
  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    }
  });

  const signOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-forest-600 text-white">
            <Leaf size={22} />
          </span>
          <div>
            <p className="font-bold text-forest-900">Krishi Mytra</p>
            <p className="text-xs text-slate-500">Smart farm companion</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-1">
          {navigation.map(([key]) => {
            const Icon = icons[key];
            return (
              <NavLink
                key={key}
                to={`/${key === 'dashboard' ? '' : key}`}
                end={key === 'dashboard'}
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {t(key === 'recommendations' ? 'cropAdvisor' : key === 'weather' ? 'weatherIntel' : key === 'schemes' ? 'govSchemes' : key === 'disease' ? 'diseaseCheck' : key)}
              </NavLink>
            );
          })}
        </nav>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className="nav-link mt-2">
            <ShieldCheck size={18} />
            {t('adminConsole')}
          </NavLink>
        )}
        <div className="mt-auto rounded-lg bg-forest-50 p-3">
          <p className="text-xs font-semibold text-forest-800">{t('needAgronomyHelp')}</p>
          <p className="mt-1 text-xs text-slate-600">{t('talkToExpert')}</p>
        </div>
      </aside>

      {/* Backdrop */}
      {open && <button aria-label="Close sidebar backdrop" className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button className="lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="hidden text-sm text-slate-500 lg:block">{t('farmSnapshot')}</div>

          <div className="ml-auto flex items-center gap-4">
            {/* Language Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 rounded-md px-2 py-1">
              <span>{t('language')}:</span>
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent font-semibold text-forest-700 outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                className="relative rounded-md p-2 text-slate-500 hover:bg-slate-50"
                aria-label="Notifications"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-clay-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <button className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 z-20 w-80 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
                      <span className="text-sm font-bold text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllReadMutation.mutate()}
                          className="flex items-center gap-1 text-xs font-semibold text-forest-600 hover:underline"
                        >
                          <CheckCheck size={14} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto mt-1 space-y-1">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-slate-400">No notifications yet.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (!notif.read) markReadMutation.mutate(notif._id);
                              setNotifOpen(false);
                            }}
                            className={`p-2.5 rounded-md text-left transition cursor-pointer hover:bg-slate-50 ${!notif.read ? 'bg-forest-50/40 border-l-2 border-forest-600' : ''}`}
                          >
                            <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{notif.body}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-forest-100 text-sm font-bold text-forest-700">
                {(user?.name || 'F').charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name || 'Farm Partner'}</p>
                <p className="text-xs text-slate-500">{user?.region || 'Maharashtra'}</p>
              </div>
            </div>

            {/* Logout */}
            <button onClick={signOut} className="rounded-md p-2 text-slate-500 hover:bg-slate-50" aria-label="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
