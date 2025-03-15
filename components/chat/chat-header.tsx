import { Button } from "@/components/ui/button"
import { Settings, Crown } from "lucide-react"
import { motion } from "framer-motion"
import AuthWrapper from "@/components/auth/auth-wrapper"

type ChatHeaderProps = {
  language: "en" | "bn"
  toggleLanguage: () => void
  setShowPaymentModal: (show: boolean) => void
  setShowSettingsDialog: (show: boolean) => void
  showSettingsDialog: boolean
}

export default function ChatHeader({
  language,
  toggleLanguage,
  setShowPaymentModal,
  setShowSettingsDialog,
  showSettingsDialog,
}: ChatHeaderProps) {
  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: 0.1,
      },
    },
  }

  return (
    <motion.header
      className="flex justify-between items-center px-4 sm:px-6 h-[3.25rem] sm:h-14 border-b border-white/[0.04] bg-[#1A1B1E]/70 backdrop-blur-xl sticky top-0 z-50"
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <motion.div 
        className="flex items-center gap-2" 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <span className="text-lg sm:text-xl font-bold text-white/90 font-league-spartan">
            onnesha
          </span>
        </motion.div>
      </motion.div>
      <div className="flex items-center gap-2 sm:gap-2.5">
        <motion.div 
          whileHover={{ scale: 1.01 }} 
          whileTap={{ scale: 0.99 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white transition-colors duration-200 font-bengali text-sm font-medium h-8 sm:h-7 px-3 min-w-[2.75rem] sm:min-w-[2.5rem] touch-manipulation"
          >
            {language === "en" ? "বাং" : "EN"}
          </Button>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.01 }} 
          whileTap={{ scale: 0.99 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPaymentModal(true)}
            className="rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-yellow-400/80 hover:text-yellow-400 transition-colors duration-200 h-8 sm:h-7 w-8 sm:w-7 touch-manipulation"
            title={language === "en" ? "Premium subscription" : "প্রিমিয়াম সাবস্ক্রিপশন"}
          >
            <Crown size={14} />
            <span 
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400/80 rounded-full"
            />
          </Button>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.01 }} 
          whileTap={{ scale: 0.99 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettingsDialog(!showSettingsDialog)}
            className="rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white transition-colors duration-200 h-8 sm:h-7 w-8 sm:w-7 touch-manipulation"
          >
            <Settings size={14} />
          </Button>
        </motion.div>
        <AuthWrapper 
          language={language} 
          onSettingsClick={() => setShowSettingsDialog(!showSettingsDialog)}
          onHelpClick={() => {}} 
        />
      </div>
    </motion.header>
  )
} 