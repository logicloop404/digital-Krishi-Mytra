import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, ExternalLink, Search, SlidersHorizontal, Award, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAudioReader } from '../hooks/useAudioReader';

const fallback = [
  { _id: '1', title: 'PM-KISAN Samman Nidhi', category: 'Income Support', benefit: '₹6,000 per year', description: 'Direct income support for eligible landholding farmer families.', tags: ['Landholding farmer', 'Aadhaar required'], eligibility: ['Landholding farmer'] },
  { _id: '2', title: 'Pradhan Mantri Fasal Bima Yojana', category: 'Crop Insurance', benefit: 'Low premium insurance', description: 'Financial protection against crop loss from weather, pests and disease.', tags: ['All farmers', 'Seasonal enrolment'], eligibility: ['All farmers'] },
  { _id: '3', title: 'Soil Health Card Scheme', category: 'Soil Health', benefit: 'Free soil analysis', description: 'Get nutrient status and fertilizer recommendations for your farmland.', tags: ['All farmers', 'Apply at KVK'], eligibility: ['All farmers'] }
];

export default function SchemesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { speak, stop, isPlaying } = useAudioReader();
  const [playingScheme, setPlayingScheme] = useState(null);
  const [search, setSearch] = useState('');
  const [filterEligible, setFilterEligible] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'bookmarks'

  // Fetch schemes
  const { data: schemesData, isLoading } = useQuery({
    queryKey: ['schemes', search],
    queryFn: () => api.get('/schemes', { params: { search } }).then((r) => r.data.data),
    placeholderData: { schemes: fallback }
  });

  // Fetch bookmarks
  const { data: bookmarksData } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => api.get('/schemes/bookmarked').then((r) => r.data.data.schemes),
    enabled: !!user
  });

  const schemes = schemesData?.schemes?.length ? schemesData.schemes : fallback;
  const bookmarkedIds = (bookmarksData || []).map(b => b._id);

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: (id) => api.post(`/schemes/${id}/bookmark`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Scheme bookmarks updated');
    },
    onError: () => {
      toast.error('Failed to update bookmarks');
    }
  });

  // Match eligibility dynamically
  const isFarmerEligible = (scheme) => {
    if (!user) return true;
    const isLandholding = user.landArea > 0;
    
    // Check eligibility constraints in scheme model
    const rules = scheme.eligibility || [];
    if (rules.length === 0) return true;

    return rules.every(rule => {
      const lower = rule.toLowerCase();
      if (lower.includes('landholding') && !isLandholding) return false;
      if (lower.includes('all farmers')) return true;
      // Region checks if specified in scheme (e.g. Maharashtra)
      if (lower.includes('maharashtra') && user.region?.toLowerCase() !== 'maharashtra') return false;
      return true;
    });
  };

  const displayedList = (activeTab === 'bookmarks' ? (bookmarksData || []) : schemes).filter(scheme => {
    if (filterEligible) return isFarmerEligible(scheme);
    return true;
  });

  return (
    <>
      <PageHeader
        title={t('govSchemes')}
        subtitle="Find benefits matched to your farm profile and eligibility."
        action={
          <button
            onClick={() => setFilterEligible(!filterEligible)}
            className={`btn-secondary ${filterEligible ? 'bg-forest-50 border-forest-300 text-forest-700' : ''}`}
          >
            <SlidersHorizontal size={17} /> {filterEligible ? 'Showing Eligible Only' : 'Filter by Eligibility'}
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'all' ? 'text-forest-700 border-b-2 border-forest-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          All Schemes
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'bookmarks' ? 'text-forest-700 border-b-2 border-forest-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Bookmarked ({bookmarkedIds.length})
        </button>
      </div>

      <section className="panel p-4 mb-6">
        <div className="relative">
          <Search size={19} className="absolute left-3 top-3 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="field pl-10" placeholder="Search schemes by name, benefit or category..." />
        </div>
      </section>

      {isLoading ? (
        <LoadingSkeleton rows={3} />
      ) : displayedList.length === 0 ? (
        <div className="panel p-12 text-center text-slate-400">
          <Award size={36} className="mx-auto mb-2 text-slate-300" />
          <p>No schemes fit your criteria right now.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {displayedList.map((scheme) => {
            const isBookmarked = bookmarkedIds.includes(scheme._id);
            const eligible = isFarmerEligible(scheme);

            return (
              <article key={scheme._id} className="panel flex flex-col p-5 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-700">{scheme.category}</span>
                    <div className="flex gap-2">
                      {eligible && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Eligible</span>
                      )}
                      <button
                        onClick={() => {
                          if (playingScheme === scheme._id && isPlaying) {
                            stop();
                            setPlayingScheme(null);
                          } else {
                            setPlayingScheme(scheme._id);
                            speak(`Scheme title is ${scheme.title}. Category: ${scheme.category}. Key benefit: ${scheme.benefit}. Description: ${scheme.description}`);
                          }
                        }}
                        className={`rounded-md p-1.5 transition ${playingScheme === scheme._id && isPlaying ? 'text-forest-600 bg-forest-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        aria-label={`Listen to ${scheme.title}`}
                      >
                        {playingScheme === scheme._id && isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <button
                        onClick={() => bookmarkMutation.mutate(scheme._id)}
                        className={`rounded-md p-1.5 transition ${isBookmarked ? 'text-forest-600 bg-forest-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        aria-label={`Bookmark ${scheme.title}`}
                      >
                        <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-slate-900">{scheme.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{scheme.description}</p>
                </div>

                <div className="mt-5">
                  <div className="rounded-md bg-clay-50 p-3 mb-4">
                    <p className="text-xs font-semibold uppercase text-clay-600">Key benefit</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{scheme.benefit}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scheme.tags?.map((tag) => (
                      <span key={tag} className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500">{tag}</span>
                    ))}
                  </div>
                  <button className="flex items-center gap-1 text-sm font-semibold text-forest-700 hover:underline">
                    {t('applyScheme')} <ExternalLink size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
