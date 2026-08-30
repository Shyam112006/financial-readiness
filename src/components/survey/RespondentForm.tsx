'use client';

import React, { useState } from 'react';
import { User, Mail, Calendar, ArrowRight, ShieldCheck, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { isValidEmail, isValidName, isValidAge } from '@/lib/validation';

export interface RespondentData {
  name: string;
  email: string;
  age: number;
}

interface RespondentFormProps {
  initialData?: RespondentData;
  onSubmit: (data: RespondentData) => void;
  totalQuestions: number;
}

export function RespondentForm({
  initialData,
  onSubmit,
  totalQuestions,
}: RespondentFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [age, setAge] = useState<string>(initialData?.age ? String(initialData.age) : '');
  const [errors, setErrors] = useState<{ name?: string; email?: string; age?: string; form?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; age?: boolean }>({});
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);

  const validate = () => {
    const newErrors: { name?: string; email?: string; age?: string; form?: string } = {};

    if (!isValidName(name)) {
      newErrors.name = 'Please enter your full name (at least 2 characters)';
    }

    if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isValidAge(age)) {
      newErrors.age = 'Please enter a valid age between 10 and 120';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, age: true });

    if (!validate()) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email has already submitted
    try {
      setIsCheckingEmail(true);
      setErrors((prev) => ({ ...prev, form: undefined }));

      const checkRes = await fetch(`/api/survey/check-email?email=${encodeURIComponent(cleanEmail)}`);
      const checkData = await checkRes.json();

      if (checkRes.ok && checkData.alreadySubmitted) {
        setErrors((prev) => ({
          ...prev,
          email: 'This email has already completed the assessment. Each participant is allowed only one attempt.',
        }));
        setIsCheckingEmail(false);
        return;
      }
    } catch {
      // Continue if check fails network-wise; server submit will enforce duplicate check
    } finally {
      setIsCheckingEmail(false);
    }

    onSubmit({
      name: name.trim(),
      email: cleanEmail,
      age: parseInt(age, 10),
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mb-4">
          <User className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Respondent Information
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Please enter your details to personalize your financial index report and receive your verified results certificate.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (touched.name) {
                  setErrors((prev) => ({
                    ...prev,
                    name: isValidName(e.target.value) ? undefined : 'Please enter your full name',
                  }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, name: true }));
                validate();
              }}
              placeholder="e.g. Alex Morgan"
              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm ${
                errors.name && touched.name
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.name && touched.name && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Single attempt only
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  setErrors((prev) => ({
                    ...prev,
                    email: isValidEmail(e.target.value) ? undefined : 'Please enter a valid email address',
                  }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, email: true }));
                validate();
              }}
              placeholder="alex.morgan@company.com"
              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm ${
                errors.email && touched.email
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.email}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Your email is used to dispatch your score, index, and attached PDF certificate.
          </p>
        </div>

        {/* Age Field */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Age <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
            <input
              type="number"
              min="10"
              max="120"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                if (touched.age) {
                  setErrors((prev) => ({
                    ...prev,
                    age: isValidAge(e.target.value) ? undefined : 'Please enter a valid age (10 to 120)',
                  }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, age: true }));
                validate();
              }}
              placeholder="e.g. 28"
              className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm ${
                errors.age && touched.age
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.age && touched.age && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.age}</p>
          )}
        </div>

        {/* Survey brief info badge */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            Estimated: ~3-5 minutes
          </span>
          <span className="font-semibold text-slate-800">
            {totalQuestions} Questions Total
          </span>
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isCheckingEmail}
          className="w-full text-base py-3.5 font-semibold shadow-md hover:shadow-lg transition-all"
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Begin Assessment Questions
        </Button>
      </form>
    </div>
  );
}

export default RespondentForm;
