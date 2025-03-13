"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignIn: () => void
  language: 'en' | 'bn'
}

export default function SignUpModal({ isOpen, onClose, onOpenSignIn, language }: SignUpModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()

  const t = {
    en: {
      title: 'Sign Up',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Create a password',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      signUpButton: 'Sign Up',
      haveAccount: 'Already have an account?',
      signIn: 'Sign In',
      errorTitle: 'Error',
      passwordMismatch: 'Passwords do not match',
      signUpError: 'Error creating account',
      successTitle: 'Success',
      signUpSuccess: 'Account created successfully! Please check your email to confirm your account.',
    },
    bn: {
      title: 'সাইন আপ',
      emailLabel: 'ইমেইল',
      emailPlaceholder: 'আপনার ইমেইল লিখুন',
      passwordLabel: 'পাসওয়ার্ড',
      passwordPlaceholder: 'একটি পাসওয়ার্ড তৈরি করুন',
      confirmPasswordLabel: 'পাসওয়ার্ড নিশ্চিত করুন',
      confirmPasswordPlaceholder: 'আপনার পাসওয়ার্ড নিশ্চিত করুন',
      signUpButton: 'সাইন আপ',
      haveAccount: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
      signIn: 'সাইন ইন',
      errorTitle: 'ত্রুটি',
      passwordMismatch: 'পাসওয়ার্ড মিলছে না',
      signUpError: 'অ্যাকাউন্ট তৈরি করতে ত্রুটি',
      successTitle: 'সফল',
      signUpSuccess: 'অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে! আপনার অ্যাকাউন্ট নিশ্চিত করতে আপনার ইমেইল চেক করুন।',
    },
  }[language]

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !confirmPassword) return
    
    if (password !== confirmPassword) {
      toast({
        title: t.errorTitle,
        description: t.passwordMismatch,
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const { error } = await signUp(email, password)
      
      if (error) {
        toast({
          title: t.errorTitle,
          description: error.message || t.signUpError,
          variant: 'destructive',
        })
        return
      }
      
      toast({
        title: t.successTitle,
        description: t.signUpSuccess,
      })
      
      onClose()
    } catch (error: any) {
      toast({
        title: t.errorTitle,
        description: error.message || t.signUpError,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">{t.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSignUp} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.emailLabel}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.passwordLabel}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t.signUpButton}
              </span>
            ) : (
              t.signUpButton
            )}
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t.haveAccount}</span>{' '}
            <Button variant="link" size="sm" className="px-0 font-normal h-auto" onClick={onOpenSignIn}>
              {t.signIn}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 