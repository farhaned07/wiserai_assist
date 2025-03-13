"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut, HelpCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserProfileProps {
  language: 'en' | 'bn'
  onSettingsClick?: () => void
  onHelpClick?: () => void
}

export default function UserProfile({ language, onSettingsClick, onHelpClick }: UserProfileProps) {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const t = {
    en: {
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      signOut: 'Sign Out',
      successTitle: 'Success',
      signOutSuccess: 'Signed out successfully',
    },
    bn: {
      profile: 'প্রোফাইল',
      settings: 'সেটিংস',
      help: 'সাহায্য',
      signOut: 'সাইন আউট',
      successTitle: 'সফল',
      signOutSuccess: 'সফলভাবে সাইন আউট হয়েছে',
    },
  }[language]

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      toast({
        title: t.successTitle,
        description: t.signOutSuccess,
      })
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar>
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t.profile}</DropdownMenuLabel>
        {user?.email && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground truncate max-w-[200px]">
            {user.email}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t.settings}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onHelpClick}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>{t.help}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t.signOut}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 