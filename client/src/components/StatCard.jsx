export default function StatCard({ icon: Icon, label, value, helper, tone = 'forest' }) {
  const toneMap = { forest: 'bg-forest-50 text-forest-700', clay: 'bg-clay-50 text-clay-600', blue: 'bg-sky-50 text-sky-600', gold: 'bg-amber-50 text-amber-600' };
  return <div className="panel p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-md ${toneMap[tone]}`}><Icon size={20} /></span></div><p className="mt-3 text-xs text-slate-500">{helper}</p></div>;
}
