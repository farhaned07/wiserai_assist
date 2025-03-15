  <div className="absolute right-2 top-4 flex items-center gap-2">
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      disabled={isLoading || !input.trim()}
      onClick={handleSubmit}
      className="relative group flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/90 to-purple-500/90 text-white/90 disabled:from-white/5 disabled:to-white/5 disabled:text-white/40 transition-all duration-300 overflow-hidden"
    >
      {isLoading ? (
        <motion.div
          className="w-4 h-4 border-2 border-white/30 border-t-white/90 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <>
          <Send size={15} className="relative z-10" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-blue-400/90 to-purple-400/90 opacity-0 group-hover:opacity-100 transition-all duration-300"
            initial={false}
          />
        </>
      )}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
        initial={false}
      />
    </motion.button>
  </div> 