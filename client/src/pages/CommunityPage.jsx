import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Search, ThumbsUp, UserRoundPlus, X, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const fallback = [
  { _id: '1', title: 'Best organic treatment for early leaf spot in groundnut?', body: 'I noticed brown spots spreading after last week’s rain. Looking for a practical organic approach.', category: 'Disease & Pest', author: { name: 'Anil Patil' }, upvotes: 24, commentsCount: 8, createdAt: new Date() },
  { _id: '2', title: 'When should I start soybean sowing around Nashik?', body: 'Rain has started in parts of our district. Is it safe to sow this week?', category: 'Crop Planning', author: { name: 'Meera Jadhav' }, upvotes: 16, commentsCount: 12, createdAt: new Date() }
];

export default function CommunityPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  
  const { register: regQuestion, handleSubmit: handleQuestionSubmit, reset: resetQuestion, formState: { errors: questErrors } } = useForm();
  const { register: regComment, handleSubmit: handleCommentSubmit, reset: resetComment } = useForm();

  // Fetch discussions
  const { data: forumData, isLoading } = useQuery({
    queryKey: ['forum'],
    queryFn: () => api.get('/forum').then((r) => r.data.data)
  });

  const posts = forumData?.posts?.length ? forumData.posts : fallback;

  // Fetch details of selected post (comments)
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['forumDetails', selectedPostId],
    queryFn: () => api.get(`/forum/${selectedPostId}`).then((r) => r.data.data),
    enabled: !!selectedPostId
  });

  const selectedPost = detailData?.post;
  const comments = detailData?.comments || [];

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (values) => api.post('/forum', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum'] });
      toast.success('Your question has been posted to the forum');
      setAskModalOpen(false);
      resetQuestion();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit post');
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: (id) => api.patch(`/forum/${id}/upvote`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum'] });
      // Invalidate details too in case they have it open
      if (selectedPostId) {
        queryClient.invalidateQueries({ queryKey: ['forumDetails', selectedPostId] });
      }
      toast.success('Upvote recorded');
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: (body) => api.post(`/forum/${selectedPostId}/comments`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumDetails', selectedPostId] });
      queryClient.invalidateQueries({ queryKey: ['forum'] });
      toast.success('Response added');
      resetComment();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    }
  });

  const submitQuestion = (data) => {
    createPostMutation.mutate(data);
  };

  const submitComment = (data) => {
    if (!data.commentBody?.trim()) return;
    createCommentMutation.mutate(data.commentBody);
  };

  // Filter posts
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.body.toLowerCase().includes(search.toLowerCase()) ||
    post.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title={t('community')}
        subtitle="Ask, share and learn from growers facing the same field realities."
        action={
          <button className="btn-primary" onClick={() => setAskModalOpen(true)}>
            <UserRoundPlus size={17} /> {t('askQuestion')}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_270px]">
        {/* Posts List */}
        <section>
          <div className="panel p-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="field py-2 pl-9"
                placeholder={t('searchDiscussions')}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="mt-4">
              <LoadingSkeleton rows={3} />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredPosts.map((post) => (
                <article className="panel p-5 transition hover:border-forest-300" key={post._id}>
                  <div className="flex gap-4">
                    {/* Upvote */}
                    <button
                      className="flex w-10 shrink-0 flex-col items-center rounded-md bg-slate-50 py-2 text-slate-500 hover:bg-forest-50 hover:text-forest-700"
                      onClick={() => upvoteMutation.mutate(post._id)}
                    >
                      <ThumbsUp size={17} />
                      <span className="mt-1 text-xs font-bold">{post.upvotes}</span>
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-forest-50 px-2 py-0.5 text-xs font-semibold text-forest-700">{post.category}</span>
                        <span className="text-xs text-slate-400">
                          {post.author?.name || 'Farmer'} · {new Date(post.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h2
                        onClick={() => setSelectedPostId(post._id)}
                        className="mt-2 text-lg font-bold text-slate-900 cursor-pointer hover:text-forest-700 transition"
                      >
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{post.body}</p>
                      <button
                        onClick={() => setSelectedPostId(post._id)}
                        className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-forest-700"
                      >
                        <MessageCircle size={16} /> {post.commentsCount || 0} responses
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Popular Topics Sidebar */}
        <aside className="panel h-fit p-5">
          <h2 className="font-bold text-slate-900">{t('popularTopics')}</h2>
          <div className="mt-4 space-y-2">
            {['Crop Planning', 'Disease & Pest', 'Irrigation', 'Market Prices', 'Organic Farming'].map((topic) => (
              <button
                key={topic}
                onClick={() => setSearch(topic)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-forest-50 hover:text-forest-700"
              >
                <span>{topic}</span>
                <span className="text-xs text-slate-400">›</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Ask Question Modal */}
      {askModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="fixed inset-0 bg-slate-900/40" onClick={() => setAskModalOpen(false)} />
          <div className="panel relative z-10 w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
            <button className="absolute right-4 top-4 text-slate-400 hover:text-slate-600" onClick={() => setAskModalOpen(false)}>
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserRoundPlus className="text-forest-600" /> Ask a Question
            </h2>
            <form onSubmit={handleQuestionSubmit(submitQuestion)} className="space-y-4">
              <label>
                <span className="field-label">Question Category</span>
                <select className="field" {...regQuestion('category')}>
                  <option value="Crop Planning">Crop Planning</option>
                  <option value="Disease & Pest">Disease & Pest</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Market Prices">Market Prices</option>
                  <option value="Organic Farming">Organic Farming</option>
                </select>
              </label>
              <label>
                <span className="field-label">Short title</span>
                <input
                  className="field"
                  placeholder="e.g. When should I sow Soybean in Nashik area?"
                  {...regQuestion('title', {
                    required: 'Title is required',
                    minLength: { value: 8, message: 'Title must be at least 8 characters' }
                  })}
                />
                {questErrors.title && <small className="text-clay-600">{questErrors.title.message}</small>}
              </label>
              <label>
                <span className="field-label">Explain your situation</span>
                <textarea
                  rows={4}
                  className="field resize-none"
                  placeholder="Provide soil description, water availability, or photos details..."
                  {...regQuestion('body', {
                    required: 'Description is required',
                    minLength: { value: 15, message: 'Description must be at least 15 characters' }
                  })}
                />
                {questErrors.body && <small className="text-clay-600">{questErrors.body.message}</small>}
              </label>
              <button
                type="submit"
                disabled={createPostMutation.isPending}
                className="btn-primary w-full"
              >
                {createPostMutation.isPending ? 'Publishing...' : 'Post Question'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Post Details (Comments Modal) */}
      {selectedPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <button className="fixed inset-0 bg-slate-900/40" onClick={() => setSelectedPostId(null)} />
          <div className="relative z-10 w-full max-w-xl h-full p-6 bg-white shadow-xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <span className="rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-700">
                  {selectedPost?.category}
                </span>
                <button className="text-slate-400 hover:text-slate-600" onClick={() => setSelectedPostId(null)}>
                  <X size={22} />
                </button>
              </div>

              {detailLoading ? (
                <LoadingSkeleton rows={4} />
              ) : (
                <>
                  <div className="flex gap-3 mb-6">
                    <button
                      className="flex w-10 h-14 shrink-0 flex-col items-center justify-center rounded-md bg-slate-50 text-slate-500 hover:bg-forest-50 hover:text-forest-700"
                      onClick={() => upvoteMutation.mutate(selectedPost._id)}
                    >
                      <ThumbsUp size={15} />
                      <span className="text-xs font-bold mt-1">{selectedPost?.upvotes}</span>
                    </button>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900 leading-tight">{selectedPost?.title}</h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Posted by {selectedPost?.author?.name || 'Farmer'} · {selectedPost?.author?.region || 'Maharashtra'}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
                        {selectedPost?.body}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h2 className="font-bold text-slate-800 text-sm mb-4">Responses ({comments.length})</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {comments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No responses yet. Be the first to reply!</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment._id} className="border border-slate-100 rounded-md p-3 bg-white">
                            <p className="text-xs font-bold text-slate-800">
                              {comment.author?.name || 'Farmer partner'}{' '}
                              <span className="text-[10px] font-normal text-slate-400 ml-1">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </p>
                            <p className="text-xs text-slate-600 mt-1">{comment.body}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Response Form */}
            {user && (
              <form onSubmit={handleCommentSubmit(submitComment)} className="border-t pt-4 mt-6">
                <div className="relative">
                  <input
                    className="field pr-10"
                    placeholder="Type your agricultural response..."
                    {...regComment('commentBody', { required: true })}
                  />
                  <button
                    type="submit"
                    disabled={createCommentMutation.isPending}
                    className="absolute right-2 top-2 text-forest-600 hover:text-forest-700 disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
