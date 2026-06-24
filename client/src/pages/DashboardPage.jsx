import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CloudRain, Sprout, TrendingUp, WalletCards, ArrowUpRight, MapPin, CircleAlert, Plus, Trash2, FileDown, X } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const chartData = [{ m: 'Jan', v: 38 }, { m: 'Feb', v: 48 }, { m: 'Mar', v: 44 }, { m: 'Apr', v: 62 }, { m: 'May', v: 67 }, { m: 'Jun', v: 74 }];

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch dashboard summary
  const { data: dashboardData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data.data),
    placeholderData: { weather: { temperature: 29, condition: 'Partly cloudy', rainfall: 18 }, activities: [] }
  });

  // Fetch tracked crops
  const { data: cropsData, isLoading: cropsLoading } = useQuery({
    queryKey: ['crops'],
    queryFn: () => api.get('/crops').then((r) => r.data.data.crops)
  });

  const crops = cropsData || [];
  const weather = dashboardData?.weather;

  // Add crop mutation
  const addCropMutation = useMutation({
    mutationFn: (values) => api.post('/api/crops', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('New crop added for tracking');
      setModalOpen(false);
      reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add crop');
    }
  });

  // Update crop status mutation
  const updateCropMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/crops/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Crop status updated');
    }
  });

  // Delete crop mutation
  const deleteCropMutation = useMutation({
    mutationFn: (id) => api.delete(`/crops/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Crop removed from tracking');
    }
  });

  const handleAddCrop = (data) => {
    addCropMutation.mutate(data);
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(36, 138, 76); // forest-600
      doc.text('Digital Krishi Mytra - Farm Report', 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
      doc.text(`Farmer: ${user?.name || 'Farmer partner'}`, 14, 34);
      doc.text(`Region: ${user?.region || 'Maharashtra'}`, 14, 40);

      // Section: Overview
      doc.line(14, 45, 196, 45);
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Farm Overview Metrics', 14, 52);
      doc.setFontSize(12);
      doc.text(`- Tracked Crops Count: ${crops.length}`, 14, 60);
      doc.text(`- Current Local Weather: ${weather?.temperature ?? 29}C, ${weather?.condition ?? 'Partly cloudy'}`, 14, 66);
      doc.text(`- Predicted Rainfall: ${weather?.rainfall ?? 18}%`, 14, 72);

      // Section: Crops List
      doc.line(14, 78, 196, 78);
      doc.setFontSize(14);
      doc.text('Active Crop Tracker List', 14, 85);
      doc.setFontSize(11);
      let y = 92;
      if (crops.length === 0) {
        doc.text('No crops are currently being tracked. Add crops to get started.', 14, y);
      } else {
        crops.forEach((c) => {
          doc.text(`* ${c.name} - Status: ${c.status} | Area: ${c.area || 0} acres | Health Score: ${c.healthScore || 75}%`, 14, y);
          y += 8;
        });
      }

      doc.save('digital-krishi-mytra-report.pdf');
      toast.success('PDF report downloaded successfully');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <>
      <PageHeader
        title={`${t('goodMorning')}, ${user?.name?.split(' ')[0] || 'Farmer'}`}
        subtitle={t('farmSnapshot')}
        action={
          <div className="flex gap-2">
            <button onClick={exportPDF} className="btn-secondary">
              <FileDown size={17} /> Export Report
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={17} /> Add Crop
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Sprout} label={t('activeCrops')} value={crops.length.toString().padStart(2, '0')} helper={`${crops.filter(c => c.status === 'growing').length} are in growth stage`} />
        <StatCard icon={CloudRain} label={t('rainChance')} value={`${weather?.rainfall ?? 18}%`} helper="Light rainfall expected Friday" tone="blue" />
        <StatCard icon={TrendingUp} label={t('cropHealth')} value={crops.length ? `${Math.round(crops.reduce((acc, curr) => acc + (curr.healthScore || 75), 0) / crops.length)}%` : '82%'} helper="Average across all fields" tone="gold" />
        <StatCard icon={WalletCards} label={t('potentialProfit')} value="₹1.64L" helper="Across current recommendations" tone="clay" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="panel overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">{t('farmPerformance')}</h2>
              <p className="mt-1 text-xs text-slate-500">Crop health index over the season</p>
            </div>
            <button className="text-sm font-semibold text-forest-700 flex items-center gap-1">
              View report <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="health" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#248a4c" stopOpacity=".3" />
                    <stop offset="1" stopColor="#248a4c" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Area dataKey="v" stroke="#176b3a" strokeWidth={2.5} fill="url(#health)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Local Weather Panel */}
        <section className="panel bg-forest-700 p-5 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white/80">Local weather</span>
              <MapPin size={18} />
            </div>
            <p className="mt-5 text-xs text-white/70">{user?.region || 'Nashik'}, Maharashtra</p>
            <p className="mt-2 text-5xl font-bold">{weather?.temperature ?? 29}°</p>
            <p className="mt-1 text-sm text-white/80">{weather?.condition ?? 'Partly cloudy'}</p>
          </div>
          <div className="mt-6 border-t border-white/15 pt-4 text-sm space-y-2.5">
            <div className="flex justify-between">
              <span className="text-white/60">Humidity</span>
              <span className="font-semibold">68%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Wind</span>
              <span className="font-semibold">12 km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Rainfall</span>
              <span className="font-semibold">{weather?.rainfall ?? 18}%</span>
            </div>
          </div>
        </section>
      </div>

      {/* Interactive Crop Tracker List */}
      <section className="panel mt-6 p-5">
        <h2 className="font-bold text-slate-900 mb-4">{t('activeCrops')}</h2>
        {cropsLoading ? (
          <LoadingSkeleton rows={2} />
        ) : crops.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Sprout size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">You aren’t tracking any crops yet. Click "Add Crop" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-3">Crop</th>
                  <th className="pb-3">Season</th>
                  <th className="pb-3">Area (Acres)</th>
                  <th className="pb-3">Health Score</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop) => (
                  <tr key={crop._id} className="border-b border-slate-100">
                    <td className="py-3 font-semibold text-slate-800">{crop.name}</td>
                    <td className="py-3 text-slate-500">{crop.season || 'N/A'}</td>
                    <td className="py-3 text-slate-700">{crop.area || 0}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-12 rounded-full bg-slate-100 overflow-hidden inline-block">
                          <span className="h-full bg-forest-600 block" style={{ width: `${crop.healthScore || 75}%` }} />
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{crop.healthScore || 75}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <select
                        value={crop.status}
                        onChange={(e) => updateCropMutation.mutate({ id: crop._id, status: e.target.value })}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="planned">Planned</option>
                        <option value="sown">Sown</option>
                        <option value="growing">Growing</option>
                        <option value="harvested">Harvested</option>
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteCropMutation.mutate(crop._id)}
                        className="p-1 text-slate-400 hover:text-clay-600 rounded"
                        aria-label={`Delete ${crop.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Action Plan */}
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">{t('actionPlan')}</h2>
            <span className="rounded-full bg-clay-50 px-2.5 py-1 text-xs font-semibold text-clay-600">2 priorities</span>
          </div>
          {dashLoading ? (
            <div className="mt-4">
              <LoadingSkeleton rows={2} />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex gap-3 rounded-md bg-amber-50 p-3">
                <CircleAlert className="shrink-0 text-amber-600" size={19} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Apply preventive fungicide before Friday</p>
                  <p className="mt-1 text-xs text-slate-500">Rain forecast can increase leaf-spot risk in soybean.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-md bg-forest-50 p-3">
                <Sprout className="shrink-0 text-forest-600" size={19} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Review Tur crop recommendation</p>
                  <p className="mt-1 text-xs text-slate-500">High expected profit for your black soil profile.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">{t('recentActivity')}</h2>
          </div>
          <div className="mt-4 space-y-4">
            {(dashboardData?.activities?.length ? dashboardData.activities : [
              { title: 'Dashboard viewed', createdAt: new Date() },
              { title: 'Viewed PM-KISAN scheme', createdAt: new Date() }
            ]).map((item, index) => (
              <div key={item._id || index} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-forest-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.title}</p>
                  <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Add Crop Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="fixed inset-0 bg-slate-900/40" onClick={() => setModalOpen(false)} />
          <div className="panel relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <button className="absolute right-4 top-4 text-slate-400 hover:text-slate-600" onClick={() => setModalOpen(false)}>
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Sprout className="text-forest-600" /> Add Crop to Track
            </h2>
            <form onSubmit={handleSubmit(handleAddCrop)} className="space-y-4">
              <label>
                <span className="field-label">Crop Name</span>
                <input
                  className="field"
                  placeholder="e.g. Soybean, Cotton, Tur"
                  {...register('name', { required: 'Crop name is required' })}
                />
                {errors.name && <small className="text-clay-600">{errors.name.message}</small>}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="field-label">Season</span>
                  <select className="field" {...register('season')}>
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                  </select>
                </label>
                <label>
                  <span className="field-label">Status</span>
                  <select className="field" {...register('status')}>
                    <option value="planned">Planned</option>
                    <option value="sown">Sown</option>
                    <option value="growing">Growing</option>
                    <option value="harvested">Harvested</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="field-label">Area (Acres)</span>
                  <input
                    className="field"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g. 2.5"
                    {...register('area', { required: 'Area is required' })}
                  />
                  {errors.area && <small className="text-clay-600">{errors.area.message}</small>}
                </label>
                <label>
                  <span className="field-label">Health Score</span>
                  <input
                    className="field"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="75"
                    {...register('healthScore')}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={addCropMutation.isPending}
                className="btn-primary w-full mt-2"
              >
                {addCropMutation.isPending ? 'Saving...' : 'Start Tracking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
