'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApplyForConsultantMutation } from '@/lib/api/consultant';
import { Loader2, X } from 'lucide-react';

const applySchema = z.object({
  about_yourself: z.string().min(2, 'Minimum 2 characters').max(2000, 'Maximum 2000 characters'),
  why_consultant: z.string().min(2, 'Minimum 2 characters').max(2000, 'Maximum 2000 characters'),
  category: z.string().min(1, 'Category is required'),
  specialization_id: z.string().nullable(),
  experience_years: z.number().min(0, 'Minimum 0').max(60, 'Maximum 60').nullable(),
  per_minute_fee: z.number().min(10, 'Minimum ₹10 per minute').max(10000, 'Maximum ₹10,000 per minute'),
  linkedin_url: z.string().url('Invalid URL').nullable().optional(),
  resume_url: z.string().url('Invalid URL').nullable().optional(),
});

type ApplyFormData = z.infer<typeof applySchema>;

interface ApplyConsultantFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ApplyConsultantForm({ onSuccess, onCancel }: ApplyConsultantFormProps) {
  const [applyForConsultant, { isLoading, isSuccess, data }] = useApplyForConsultantMutation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      category: 'healthcare',
      specialization_id: null,
      experience_years: null,
      per_minute_fee: 50,
      linkedin_url: null,
      resume_url: null,
    },
  });

  const onSubmit = async (formData: ApplyFormData) => {
    setError(null);
    try {
      await applyForConsultant({
        ...formData,
        specialization_id: formData.specialization_id || null,
        experience_years: formData.experience_years || null,
      }).unwrap();

      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.data?.detail || 'Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Apply to Become a Consultant
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {isSuccess && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-300 text-sm">
            Application submitted successfully! Our team will review it shortly.
            {data?.id && ` Request ID: ${data.id.substring(0, 8)}`}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            About Yourself <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('about_yourself')}
            rows={3}
            placeholder="Tell us about your background and expertise..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.about_yourself && (
            <p className="mt-1 text-sm text-red-500">{errors.about_yourself.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Why Consultant? <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('why_consultant')}
            rows={3}
            placeholder="Why do you want to become a consultant?"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.why_consultant && (
            <p className="mt-1 text-sm text-red-500">{errors.why_consultant.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              {...register('category')}
              placeholder="e.g. healthcare"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Experience (years)
            </label>
            <input
              type="number"
              {...register('experience_years', { valueAsNumber: true })}
              placeholder="0"
              min={0}
              max={60}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.experience_years && (
              <p className="mt-1 text-sm text-red-500">{errors.experience_years.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Per Minute Fee (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('per_minute_fee', { valueAsNumber: true })}
            placeholder="50"
            min={10}
            max={10000}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.per_minute_fee && (
            <p className="mt-1 text-sm text-red-500">{errors.per_minute_fee.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            LinkedIn URL (optional)
          </label>
          <input
            {...register('linkedin_url')}
            placeholder="https://linkedin.com/in/your-profile"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.linkedin_url && (
            <p className="mt-1 text-sm text-red-500">{errors.linkedin_url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Resume URL (optional)
          </label>
          <input
            {...register('resume_url')}
            placeholder="https://example.com/resume.pdf"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.resume_url && (
            <p className="mt-1 text-sm text-red-500">{errors.resume_url.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          * Required fields. Your application will be reviewed by our admin team.
        </p>
      </form>
    </div>
  );
}