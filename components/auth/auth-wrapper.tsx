"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import SignInModal from './sign-in-modal'
import SignUpModal from './sign-up-modal'
import UserProfile from './user-profile'

interface AuthWrapperProps {
  language: 'en' | 'bn'
  onSettingsClick?: () => void
  onHelpClick?: () => void
}

export default function AuthWrapper({ language, onSettingsClick, onHelpClick }: AuthWrapperProps) {
  const { user, isLoading } = useAuth()
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)

  const t = {
    en: {
      signUp: 'Sign up',
      signIn: 'Sign in',
    },
    bn: {
      signUp: 'সাইন আপ',
      signIn: 'সাইন ইন',
    },
  }[language]

  const handleOpenSignIn = () => {
    setShowSignUpModal(false)
    setShowSignInModal(true)
  }

  const handleOpenSignUp = () => {
    setShowSignInModal(false)
    setShowSignUpModal(true)
  }

  const handleCloseModals = () => {
    setShowSignInModal(false)
    setShowSignUpModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse"></div>
        <div className="h-8 w-16 rounded-full bg-white/10 animate-pulse"></div>
      </div>
    )
  }

  if (user) {
    return <UserProfile language={language} onSettingsClick={onSettingsClick} onHelpClick={onHelpClick} />
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full bg-white/5 hover:bg-white/10 border-white/10"
          onClick={handleOpenSignUp}
        >
          {t.signUp}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full bg-white/5 hover:bg-white/10 border-white/10"
          onClick={handleOpenSignIn}
        >
          {t.signIn}
        </Button>
      </div>

      <SignInModal
        isOpen={showSignInModal}
        onClose={handleCloseModals}
        onOpenSignUp={handleOpenSignUp}
        language={language}
      />

      <SignUpModal
        isOpen={showSignUpModal}
        onClose={handleCloseModals}
        onOpenSignIn={handleOpenSignIn}
        language={language}
      />
    </>
  )
} 