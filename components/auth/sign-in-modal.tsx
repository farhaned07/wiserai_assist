"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignUp: () => void
  language: 'en' | 'bn'
}

export default function SignInModal({ isOpen, onClose, onOpenSignUp, language }: SignInModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const t = {
    en: {
      title: 'Sign In',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      signInButton: 'Sign In',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      forgotPassword: 'Forgot password?',
      errorTitle: 'Error',
      invalidCredentials: 'Invalid email or password',
    },
    bn: {
      title: 'সাইন ইন',
      emailLabel: 'ইমেইল',
      emailPlaceholder: 'আপনার ইমেইল লিখুন',
      passwordLabel: 'পাসওয়ার্ড',
      passwordPlaceholder: 'আপনার পাসওয়ার্ড লিখুন',
      signInButton: 'সাইন ইন',
      noAccount: 'অ্যাকাউন্ট নেই?',
      signUp: 'সাইন আপ',
      forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
      errorTitle: 'ত্রুটি',
      invalidCredentials: 'অবৈধ ইমেইল বা পাসওয়ার্ড',
    },
  }[language]

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) return
    
    setIsLoading(true)
    
    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast({
          title: t.errorTitle,
          description: t.invalidCredentials,
          variant: 'destructive',
        })
        return
      }
      
      onClose()
    } catch (error) {
      toast({
        title: t.errorTitle,
        description: t.invalidCredentials,
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
        <form onSubmit={handleSignIn} className="space-y-4 pt-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t.passwordLabel}</Label>
              <Button variant="link" size="sm" className="px-0 font-normal h-auto">
                {t.forgotPassword}
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                {t.signInButton}
              </span>
            ) : (
              t.signInButton
            )}
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t.noAccount}</span>{' '}
            <Button variant="link" size="sm" className="px-0 font-normal h-auto" onClick={onOpenSignUp}>
              {t.signUp}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 