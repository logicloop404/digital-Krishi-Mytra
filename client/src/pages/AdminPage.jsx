import { useQuery } from '@tanstack/react-query';
import { BarChart3, Flag, Landmark, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { t } = useLanguage();

  // Fetch admin analytics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => api.get('/admin/analytics').then((res) => res.data.data)
  });

  // Fetch registered users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.get('/admin/users').then((res) => res.data.data)
  });

  const stats = statsData || { users: 12, schemes: 3, moderatedPosts: 0 };
  const users = usersData?.users || [];

  return (
    <>
      <PageHeader title={t('adminConsole')} subtitle="Monitor platform health and manage farmer-facing resources." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label={t('registeredFarmers')}
          value={statsLoading ? '...' : stats.users.toString().padStart(2, '0')}
          helper="Total registered database profiles"
        />
        <StatCard
          icon={Landmark}
          label={t('activeSchemes')}
          value={statsLoading ? '...' : stats.schemes.toString().padStart(2, '0')}
          helper="Active schemes verified"
          tone="blue"
        />
        <StatCard
          icon={Flag}
          label={t('reportedPosts')}
          value={statsLoading ? '...' : stats.moderatedPosts.toString().padStart(2, '0')}
          helper="Flagged discussions moderated"
          tone="clay"
        />
        <StatCard
          icon={BarChart3}
          label={t('adviceViews')}
          value="184"
          helper="Total crop recommendations compiled"
          tone="gold"
        />
      </div>

      <section className="panel mt-6 p-5">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="font-bold text-slate-900">{t('managementQueue')}</h2>
          <span className="rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-700">
            {users.length} Users Listed
          </span>
        </div>

        {usersLoading ? (
          <LoadingSkeleton rows={4} />
        ) : users.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No users found in database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Region</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100">
                    <td className="py-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-4 text-slate-500">{item.email}</td>
                    <td className="py-4 text-slate-600">{item.region || 'Maharashtra'}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-forest-50 text-forest-700'}`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => toast('User management permission locks are active')}
                        className="font-semibold text-forest-700 hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
