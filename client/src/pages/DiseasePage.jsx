import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Leaf, ShieldCheck, Stethoscope, History, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { useAudioReader } from '../hooks/useAudioReader';

export default function DiseasePage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { speak, stop, isPlaying } = useAudioReader();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);

  // Fetch past reports
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['diseaseHistory'],
    queryFn: () => api.get('/diseases/reports').then((r) => r.data.data.reports)
  });

  const reports = historyData || [];

  // Detection mutation
  const detectMutation = useMutation({
    mutationFn: (form) => api.post('/diseases/detect', form),
    onSuccess: (res) => {
      setResult(res.data.data.report);
      queryClient.invalidateQueries({ queryKey: ['diseaseHistory'] });
      toast.success('Leaf analysis completed successfully');
    },
    onError: () => {
      toast.error('Could not complete scan analysis. Showing mock result.');
      setResult({
        disease: 'Early Leaf Spot',
        confidence: 87,
        crop: 'Soybean',
        prevention: ['Remove affected leaves from field edges', 'Avoid overhead irrigation late in the day'],
        treatment: ['Apply a recommended fungicide after consulting local extension staff', 'Maintain 10-14 day monitoring intervals']
      });
    }
  });

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const reader = new window.FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  };

  const submit = async () => {
    if (!file) return toast.error('Choose a clear crop leaf image first');
    const form = new FormData();
    form.append('image', file);
    detectMutation.mutate(form);
  };

  return (
    <>
      <PageHeader title={t('diseaseCheck')} subtitle="Upload a clear leaf image for an AI-assisted preliminary assessment." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload panel */}
        <section className="panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-forest-50 text-forest-700">
                <Stethoscope size={21} />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">{t('uploadLeaf')}</h2>
                <p className="text-xs text-slate-500">JPG, PNG or WEBP · up to 5 MB</p>
              </div>
            </div>

            <label className="grid min-h-64 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-forest-200 bg-forest-50/50 p-6 text-center hover:bg-forest-50 transition relative overflow-hidden">
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
              {previewUrl ? (
                <img src={previewUrl} alt="Leaf Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div>
                  <ImagePlus className="mx-auto text-forest-600 mb-2" size={36} />
                  <p className="text-sm font-semibold text-slate-700">Select a leaf photo</p>
                  <p className="text-xs text-slate-500 mt-1">Capture the leaf in natural light, against a plain background.</p>
                </div>
              )}
            </label>
          </div>

          <div className="mt-6">
            <button
              onClick={submit}
              disabled={detectMutation.isPending}
              className="btn-primary w-full"
            >
              {detectMutation.isPending ? 'Analyzing leaf image...' : t('analyzeHealth')}
            </button>
            <p className="mt-4 text-xs leading-5 text-slate-500 text-center">
              This is an advisory tool, not a substitute for a qualified agricultural expert’s diagnosis.
            </p>
          </div>
        </section>

        {/* Results display */}
        <section className="panel p-6 min-h-80">
          {result ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Possible condition</p>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1">{result.disease}</h2>
                    <p className="text-xs text-slate-500">{result.crop} leaf assessment</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (isPlaying) {
                          stop();
                        } else {
                          speak(`Possible crop condition detected is ${result.disease} with ${result.confidence} percent confidence. Prevention guidelines: ${result.prevention.join('. ')}. Treatment suggestions: ${result.treatment.join('. ')}`);
                        }
                      }}
                      className={`rounded-md p-1.5 border transition ${isPlaying ? 'text-forest-600 bg-forest-50 border-forest-300' : 'text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                      aria-label="Listen to report details"
                    >
                      {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-forest-100 text-center bg-forest-50/30 font-bold text-forest-700">
                      {result.confidence}%
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-clay-50 p-4 mb-6">
                  <h3 className="font-semibold text-clay-700">Recommended next step</h3>
                  <p className="text-xs text-slate-600 mt-1">Confirm symptoms with a local agricultural officer before applying treatment.</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <ShieldCheck className="text-forest-600" size={17} /> Prevention
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                      {result.prevention?.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <Leaf className="text-clay-500" size={17} /> Treatment
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                      {result.treatment?.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {result.imageUrl && (
                <div className="mt-6 border-t pt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Scan snapshot:</p>
                  <img src={result.imageUrl} alt="Scan Result" className="h-28 w-40 object-cover rounded-md border border-slate-100" />
                </div>
              )}
            </div>
          ) : (
            <div className="grid h-full place-items-center text-center py-12">
              <div>
                <Leaf className="mx-auto text-slate-300 mb-2 animate-bounce" size={48} />
                <h2 className="font-bold text-slate-700">Your result will appear here</h2>
                <p className="mt-2 max-w-xs text-xs text-slate-500">Upload a focused image of a symptomatic leaf to start the analysis.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* History section */}
      <section className="panel mt-6 p-5">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
          <History size={18} className="text-forest-600" /> {t('previousScans')}
        </h2>
        {historyLoading ? (
          <LoadingSkeleton rows={1} />
        ) : reports.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No previous scans found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reports.map((rep) => (
              <div
                key={rep._id}
                onClick={() => setResult(rep)}
                className="border border-slate-100 rounded-md p-3 transition cursor-pointer hover:border-forest-300 hover:shadow-sm bg-white"
              >
                <div className="aspect-[4/3] rounded overflow-hidden mb-2.5 bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {rep.imageUrl ? (
                    <img src={rep.imageUrl} alt={rep.disease} className="w-full h-full object-cover" />
                  ) : (
                    <Leaf className="text-slate-300" size={24} />
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{rep.disease}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(rep.createdAt).toLocaleDateString('en-IN')}</p>
                <span className="inline-block mt-2 rounded bg-forest-50 px-1.5 py-0.5 text-[10px] font-bold text-forest-700">
                  {rep.confidence}% Confidence
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
