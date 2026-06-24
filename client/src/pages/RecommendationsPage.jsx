import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeIndianRupee, Droplets, Leaf, Save, ShieldAlert, Sprout, FileDown, BookmarkCheck, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { jsPDF } from 'jspdf';
import { useAudioReader } from '../hooks/useAudioReader';

export default function RecommendationsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { speak, stop, isPlaying } = useAudioReader();
  const [playingCrop, setPlayingCrop] = useState(null);
  const [activeTab, setActiveTab] = useState('match'); // 'match' or 'saved'
  const [lastResults, setLastResults] = useState([]);
  const [lastRecommendId, setLastRecommendId] = useState(null);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      soilType: 'Black soil',
      season: 'Kharif',
      region: 'Maharashtra',
      waterAvailability: 'Moderate',
      landArea: 3
    }
  });

  // Fetch past/saved recommendations
  const { data: recsData, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get('/recommendations').then((r) => r.data.data.recommendations)
  });

  const allRecommendations = recsData || [];
  const savedCrops = allRecommendations.filter(r => r.saved);

  // Mutation to generate recommendations
  const generateMutation = useMutation({
    mutationFn: (values) => api.post('/recommendations', values),
    onSuccess: (res) => {
      setLastResults(res.data.data.recommendations || []);
      // Keep track of the generated document ID if the backend returns it
      if (res.data.data.recommendation?._id) {
        setLastRecommendId(res.data.data.recommendation._id);
      }
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Recommendations generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate crop suggestions');
    }
  });

  // Mutation to save/toggle recommendation
  const saveMutation = useMutation({
    mutationFn: (id) => api.patch(`/recommendations/${id}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Recommendation save status updated');
    }
  });

  const submit = (values) => {
    generateMutation.mutate(values);
  };

  const handleSaveRecommendation = (item) => {
    // If we just generated the current recommendation set, we can save it.
    if (lastRecommendId) {
      saveMutation.mutate(lastRecommendId);
    } else {
      // Find recommendation doc containing this crop in past queries
      const found = allRecommendations.find(r => r.crops.some(c => c.crop === item.crop));
      if (found) {
        saveMutation.mutate(found._id);
      } else {
        toast('Showing recommendation status updated');
      }
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(36, 138, 76); // forest-600
      doc.text('Smart Crop Advisor - Recommendation Report', 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);

      doc.line(14, 34, 196, 34);
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Recommended Crops Matches', 14, 42);

      const listToExport = lastResults.length ? lastResults : (allRecommendations[0]?.crops || []);

      if (listToExport.length === 0) {
        doc.setFontSize(11);
        doc.text('No matching crop recommendations generated yet. Query farm conditions first.', 14, 50);
      } else {
        let y = 50;
        listToExport.forEach((c) => {
          doc.setFontSize(12);
          doc.setTextColor(36, 138, 76);
          doc.text(`${c.crop} (${c.suitability}% Match)`, 14, y);
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          y += 6;
          doc.text(`- Expected Yield: ${c.yield || 'N/A'} | Est. Profit: ${c.profit || 'N/A'} | Risk: ${c.risk || 'Low'}`, 14, y);
          y += 10;
        });
      }

      doc.save('krishi-crop-recommendations.pdf');
      toast.success('Recommendations PDF downloaded');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <>
      <PageHeader
        title={t('cropAdvisor')}
        subtitle="Match your soil, water and season with crops that fit your field."
        action={
          <button onClick={exportPDF} className="btn-secondary">
            <FileDown size={17} /> Export PDF
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('match')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'match' ? 'text-forest-700 border-b-2 border-forest-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {t('cropAdvisor')}
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'saved' ? 'text-forest-700 border-b-2 border-forest-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {t('savedCrops')} ({savedCrops.length})
        </button>
      </div>

      {activeTab === 'match' ? (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          {/* Form */}
          <aside className="panel h-fit p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-forest-50 text-forest-700">
                <Sprout size={19} />
              </span>
              <h2 className="font-bold text-slate-900">Farm conditions</h2>
            </div>
            <form onSubmit={handleSubmit(submit)} className="mt-5 space-y-4">
              <label>
                <span className="field-label">{t('soilType')}</span>
                <select className="field" {...register('soilType')}>
                  <option value="Black soil">Black soil</option>
                  <option value="Alluvial soil">Alluvial soil</option>
                  <option value="Red soil">Red soil</option>
                  <option value="Laterite soil">Laterite soil</option>
                </select>
              </label>
              <label>
                <span className="field-label">{t('season')}</span>
                <select className="field" {...register('season')}>
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Zaid">Zaid</option>
                </select>
              </label>
              <label>
                <span className="field-label">{t('region')}</span>
                <select className="field" {...register('region')}>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </label>
              <label>
                <span className="field-label">{t('waterAvailability')}</span>
                <select className="field" {...register('waterAvailability')}>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label>
                <span className="field-label">{t('landArea')}</span>
                <input className="field" type="number" min="0.1" step="0.1" {...register('landArea')} />
              </label>
              <button className="btn-primary w-full" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Analyzing conditions...' : t('recommendCrops')}
              </button>
            </form>
          </aside>

          {/* Results Match List */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Your crop matches</h2>
                <p className="mt-1 text-sm text-slate-500">Ranked by suitability for your stated conditions.</p>
              </div>
              <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">
                {lastResults.length ? lastResults.length : 3} matches
              </span>
            </div>

            <div className="grid gap-4">
              {(lastResults.length ? lastResults : (allRecommendations[0]?.crops || [])).map((item) => (
                <article className="panel p-5" key={item.crop}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-md text-white" style={{ backgroundColor: item.color || '#248a4c' }}>
                        <Leaf size={22} />
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900">{item.crop}</h3>
                        <p className="mt-0.5 text-sm text-slate-500">Strong match for your current profile</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xl font-bold text-forest-700">{item.suitability}%</p>
                        <p className="text-xs text-slate-500">suitability</p>
                      </div>
                      <button
                        className={`rounded-md border p-2 ${playingCrop === item.crop && isPlaying ? 'border-forest-600 bg-forest-50 text-forest-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        aria-label={`Listen to ${item.crop} recommendation`}
                        onClick={() => {
                          if (playingCrop === item.crop && isPlaying) {
                            stop();
                            setPlayingCrop(null);
                          } else {
                            setPlayingCrop(item.crop);
                            speak(`${item.crop} recommendation. ${item.suitability} percent suitability match. Expected yield is ${item.yield}. Estimated profit is ${item.profit}. Risk level is ${item.risk}.`);
                          }
                        }}
                      >
                        {playingCrop === item.crop && isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <button
                        className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-forest-700"
                        aria-label={`Save ${item.crop} recommendation`}
                        onClick={() => handleSaveRecommendation(item)}
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 border-t border-slate-100 pt-4">
                    <div className="flex gap-2">
                      <Sprout size={17} className="text-forest-600" />
                      <div>
                        <p className="text-xs text-slate-500">Expected yield</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{item.yield}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <BadgeIndianRupee size={17} className="text-clay-500" />
                      <div>
                        <p className="text-xs text-slate-500">Est. profit</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{item.profit}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ShieldAlert size={17} className="text-amber-500" />
                      <div>
                        <p className="text-xs text-slate-500">Risk level</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{item.risk}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-dashed border-forest-200 bg-forest-50 p-4 text-sm text-forest-800">
              <Droplets className="mr-2 inline" size={17} />Water alert: expect moderate rainfall later this week. Plan field operations around Friday.
            </div>
          </section>
        </div>
      ) : (
        /* Saved Recommendations tab */
        <div className="grid gap-4">
          {recsLoading ? (
            <LoadingSkeleton rows={3} />
          ) : savedCrops.length === 0 ? (
            <div className="panel p-8 text-center text-slate-400">
              <BookmarkCheck size={36} className="mx-auto mb-2 text-slate-300" />
              <p>You haven’t saved any recommendations yet. Click the save icon on matches.</p>
            </div>
          ) : (
            savedCrops.map((rec) => (
              <div key={rec._id} className="panel p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">Query inputs</h3>
                    <p className="text-xs text-slate-500">
                      Soil: {rec.inputs.soilType} | Season: {rec.inputs.season} | Water: {rec.inputs.waterAvailability} | Area: {rec.inputs.landArea} acres
                    </p>
                  </div>
                  <button
                    onClick={() => saveMutation.mutate(rec._id)}
                    className="text-xs font-semibold text-clay-600 hover:underline"
                  >
                    Remove from Saved
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {rec.crops.map((c) => (
                    <div key={c.crop} className="border border-slate-100 rounded-md p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-800">{c.crop}</span>
                        <span className="text-xs font-bold text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded">{c.suitability}%</span>
                      </div>
                      <p className="text-xs text-slate-500">Profit: {c.profit}</p>
                      <p className="text-xs text-slate-500">Risk: {c.risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
