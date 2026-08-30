'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Mail, Phone, Calendar, ArrowRight, ShieldCheck, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { isValidEmail, isValidName, isValidPhone, isValidAge } from '@/lib/validation';

export interface RespondentData {
  name: string;
  email: string;
  phone: string;
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
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [age, setAge] = useState<string>(initialData?.age ? String(initialData.age) : '');
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; age?: string; form?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean; age?: boolean }>({});
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);

  const validate = () => {
    const newErrors: { name?: string; email?: string; phone?: string; age?: string; form?: string } = {};

    if (!isValidName(name)) {
      newErrors.name = 'Please enter your full name (at least 2 characters)';
    }

    if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isValidPhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!isValidAge(age)) {
      newErrors.age = 'Please enter a valid age between 10 and 120';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, age: true });

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
      phone: phone.trim(),
      age: parseInt(age, 10),
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-[#eef2f6] p-6 sm:p-10 relative text-[#0f1e3a]">
      {/* Brand Logo & Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image
            src="/Logo-ShreeCapital.png"
            alt="Shree Capital logo"
            width={220}
            height={80}
            priority
            className="h-11 sm:h-12 md:h-13 w-auto object-contain"
          />
          <span className="sr-only">Shree Capital</span>
        </div>
        
        <p className="text-xs sm:text-sm text-[#334e68] mt-2 leading-relaxed max-w-md mx-auto">
          Please enter your details to personalize your financial readiness report and receive your verified assessment scorecard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#0f1e3a] mb-2">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#627d98]">
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
              className={`w-full pl-11 pr-4 py-3 bg-[#f8fafc] border rounded-xl text-[#0f1e3a] placeholder-[#9fb3c8] focus:outline-none focus:ring-2 focus:bg-white transition-all text-base sm:text-sm ${
                errors.name && touched.name
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-[#bcccdc] focus:ring-[#1f5e8c] focus:border-[#1f5e8c]'
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
            <label className="text-xs sm:text-sm font-semibold text-[#0f1e3a]">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#c9a44c] bg-[#fdf8ee] border border-[#c9a44c]/30 px-2.5 py-0.5 rounded-full">
              Single attempt only
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#627d98]">
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
              className={`w-full pl-11 pr-4 py-3 bg-[#f8fafc] border rounded-xl text-[#0f1e3a] placeholder-[#9fb3c8] focus:outline-none focus:ring-2 focus:bg-white transition-all text-base sm:text-sm ${
                errors.email && touched.email
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-[#bcccdc] focus:ring-[#1f5e8c] focus:border-[#1f5e8c]'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.email}
            </p>
          )}
          <p className="text-xs text-[#627d98] mt-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1f5e8c] shrink-0" />
            Your official PDF report will be dispatched to this email.
          </p>
        </div>

        {/* Phone Number Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#0f1e3a] mb-2">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#627d98]">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (touched.phone) {
                  setErrors((prev) => ({
                    ...prev,
                    phone: isValidPhone(e.target.value) ? undefined : 'Please enter a valid 10-digit phone number',
                  }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, phone: true }));
                validate();
              }}
              placeholder="e.g. 9876543210"
              className={`w-full pl-11 pr-4 py-3 bg-[#f8fafc] border rounded-xl text-[#0f1e3a] placeholder-[#9fb3c8] focus:outline-none focus:ring-2 focus:bg-white transition-all text-base sm:text-sm ${
                errors.phone && touched.phone
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-[#bcccdc] focus:ring-[#1f5e8c] focus:border-[#1f5e8c]'
              }`}
            />
          </div>
          {errors.phone && touched.phone && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.phone}</p>
          )}
        </div>

        {/* Age Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#0f1e3a] mb-2">
            Age <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#627d98]">
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
              className={`w-full pl-11 pr-4 py-3 bg-[#f8fafc] border rounded-xl text-[#0f1e3a] placeholder-[#9fb3c8] focus:outline-none focus:ring-2 focus:bg-white transition-all text-base sm:text-sm ${
                errors.age && touched.age
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-[#bcccdc] focus:ring-[#1f5e8c] focus:border-[#1f5e8c]'
              }`}
            />
          </div>
          {errors.age && touched.age && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.age}</p>
          )}
        </div>

        {/* Survey brief info badge */}
        <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#eef2f6] flex items-center justify-between text-xs text-[#334e68]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#1f5e8c]" />
            Estimated: ~3-5 minutes
          </span>
          <span className="font-semibold text-[#0f1e3a]">
            {totalQuestions} Questions Total
          </span>
        </div>

        <button
          type="submit"
          disabled={isCheckingEmail}
          className="w-full text-sm sm:text-base py-3.5 sm:py-4 px-6 font-semibold text-[#0f1e3a] bg-[#c9a44c] hover:bg-[#b8933b] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
        >
          {isCheckingEmail ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#0f1e3a]" />
          ) : (
            <>
              <span>Begin Assessment Questions</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default RespondentForm;
