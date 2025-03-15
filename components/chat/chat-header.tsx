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
      className="flex justify-between items-center p-4 border-b border-white/5 bg-[#1A1B1E]/90 backdrop-blur-lg sticky top-0 z-50 shadow-glow-enhanced"
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <motion.div 
        className="flex items-center gap-2" 
        whileHover={{ scale: 1.02 }} 
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-2xl font-bold text-white font-poppins tracking-tight">
            onnesha
          </span>
        </motion.div>
      </motion.div>
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="rounded-full bg-white/5 hover:bg-white/10 hover:text-blue-400 transition-all duration-300 shadow-glow font-bengali text-base font-medium px-4 h-9"
          >
            {language === "en" ? "বাং" : "EN"}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPaymentModal(true)}
            className="rounded-full bg-white/5 hover:bg-white/10 hover:text-yellow-400 transition-all duration-300 shadow-glow relative"
            title={language === "en" ? "Premium subscription" : "প্রিমিয়াম সাবস্ক্রিপশন"}
          >
            <Crown size={18} className="text-yellow-400" />
            <motion.span 
              className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettingsDialog(!showSettingsDialog)}
            className="rounded-full bg-white/5 hover:bg-white/10 hover:text-blue-400 transition-all duration-300 shadow-glow"
          >
            <Settings size={18} />
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