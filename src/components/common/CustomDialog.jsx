"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function CustomDialog({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            key="dialog-backdrop"
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* FULLSCREEN MODAL */}
          <motion.div
            key="dialog-content"
            className="fixed inset-0 bg-white flex flex-col overflow-hidden z-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
