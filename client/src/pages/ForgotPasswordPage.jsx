import { Link } from 'react-router-dom';
import { Leaf, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const submit = async (values) => {
    try {
      const { data } = await api.post('/auth/forgot-password', values);
      toast.success(data.message || 'Check your email for the reset link');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to process request');
    }
  };

  return (
    <main className="grid min-h-screen bg-forest-50 lg:grid-cols-2">
      <section className="hidden bg-cover bg-center p-12 lg:flex lg:flex-col lg:justify-between" style={{ backgroundImage: "linear-gradient(90deg, rgba(11,53,30,.84), rgba(11,53,30,.46)), url('/farm-landscape.png')" }}>
        <div className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/15"><Leaf /></span>
          <span className="font-bold">Digital Krishi Mytra</span>
        </div>
        <div className="max-w-lg text-white">
          <p className="text-4xl font-bold leading-tight">Forgot your password?</p>
          <p className="mt-4 text-base text-white/80">No worries. Input your registered email, and we will send a password reset link directly to your inbox.</p>
        </div>
        <p className="text-xs text-white/65">Built for Indian farmers, one field at a time.</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-2 font-bold text-forest-700 lg:hidden"><Leaf /> Digital Krishi Mytra</Link>
          <h1 className="text-3xl font-bold text-slate-900">Reset Password</h1>
          <p className="mt-2 text-sm text-slate-500">Request an email reset link to regain access.</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)}>
            <label>
              <span className="field-label">Email address</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input className="field pl-10" type="email" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
              </span>
              {errors.email && <small className="mt-1 block text-clay-600">{errors.email.message}</small>}
            </label>
            <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Sending link...' : 'Send reset link'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Remembered your password? <Link className="font-semibold text-forest-700 hover:underline" to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
