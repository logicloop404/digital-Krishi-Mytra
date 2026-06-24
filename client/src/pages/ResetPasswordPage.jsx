import { Link, useNavigate, useParams } from 'react-router-dom';
import { Leaf, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const password = watch('password');

  const submit = async (values) => {
    try {
      const { data } = await api.patch(`/auth/reset-password/${token}`, { password: values.password });
      login(data.data);
      toast.success('Your password has been successfully reset.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token is invalid or has expired');
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
          <p className="text-4xl font-bold leading-tight">Create your new password</p>
          <p className="mt-4 text-base text-white/80">Choose a strong password containing at least 8 characters to keep your account and farm data secure.</p>
        </div>
        <p className="text-xs text-white/65">Built for Indian farmers, one field at a time.</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-2 font-bold text-forest-700 lg:hidden"><Leaf /> Digital Krishi Mytra</Link>
          <h1 className="text-3xl font-bold text-slate-900">Choose new password</h1>
          <p className="mt-2 text-sm text-slate-500">Please choose a password with 8 characters or more.</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)}>
            <label>
              <span className="field-label">New Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-3 top-3 text-slate-400" size={18} />
                <input className="field pl-10" type="password" placeholder="Min. 8 characters" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })} />
              </span>
              {errors.password && <small className="mt-1 block text-clay-600">{errors.password.message}</small>}
            </label>
            <label>
              <span className="field-label">Confirm Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-3 top-3 text-slate-400" size={18} />
                <input className="field pl-10" type="password" placeholder="Confirm your password" {...register('confirmPassword', { required: 'Confirm password is required', validate: (value) => value === password || 'Passwords do not match' })} />
              </span>
              {errors.confirmPassword && <small className="mt-1 block text-clay-600">{errors.confirmPassword.message}</small>}
            </label>
            <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Updating password...' : 'Update password'}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
