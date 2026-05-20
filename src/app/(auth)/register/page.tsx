'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { getReadableError } from '@/lib/utils';
import type { AuthResponse } from '@/types';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function getRedirectPath(role: AuthResponse['user']['role']) {
  if (role === 'owner') return '/owner/properties';
  if (role === 'admin') return '/admin/analytics';
  return '/user/bookings';
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { user, hydrated } = useAuth();
  const nextPath = searchParams.get('next');
  const safeNextPath = nextPath && nextPath.startsWith('/') ? nextPath : null;

  useEffect(() => {
    if (!hydrated || !user) return;
    router.replace(safeNextPath ?? getRedirectPath(user.role));
  }, [hydrated, router, safeNextPath, user]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // Adjusted the endpoint to your register router route
      const response = await api.post<AuthResponse>('/auth/register', values);
      setAuth(response.data.user, response.data.token);
      toast.success('Account created successfully!');
      router.push(safeNextPath ?? getRedirectPath(response.data.user.role));
    } catch (error) {
      toast.error(getReadableError(error, 'Unable to register your account.'));
    }
  };

  if (!hydrated || user) {
    return <LoadingSpinner className="min-h-screen" label="Checking your session..." />;
  }

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join us to manage bookings and properties cleanly."
      switchLabel="Already have an account?"
      switchHref={safeNextPath ? `/login?next=${encodeURIComponent(safeNextPath)}` : '/login'}
      switchText="Sign in"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-dark/85">
            Full Name
          </label>
          <input id="name" type="text" className="field" placeholder="John Doe" {...register('name')} />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-dark/85">
            Email
          </label>
          <input id="email" type="email" className="field" placeholder="you@example.com" {...register('email')} />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-dark/85">
            Password
          </label>
          <input id="password" type="password" className="field" placeholder="••••••••" {...register('password')} />
          {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-screen" label="Loading setup options..." />}>
      <RegisterForm />
    </Suspense>
  );
}