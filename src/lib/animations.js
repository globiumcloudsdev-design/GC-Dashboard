// Advanced Motion System - Premium Agency Level

// Motion Hierarchy Levels:
// Level 1: Section entry (slow, confident)
// Level 2: Content reveal (staggered, directional)
// Level 3: Micro-interactions (fast, responsive)

// Global easing and timing
const easeOutExpo = [0.16, 1, 0.3, 1];
const easeOutCubic = [0.33, 1, 0.68, 1];

// ==========================================
// LEVEL 1: SECTION ENTRY VARIANTS
// ==========================================

export const sectionReveal = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.6, // Reduced from 0.8 for better performance
    ease: easeOutExpo,
  },
  viewport: { once: true, margin: "-80px" }
};

export const sectionRevealSlow = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 1,
    ease: easeOutExpo,
  },
  viewport: { once: true, margin: "-80px" }
};

// ==========================================
// LEVEL 2: CONTENT REVEAL VARIANTS
// ==========================================

export const contentStagger = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export const contentStaggerFast = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const contentStaggerSlow = {
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

export const depthFade = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    duration: 0.7,
    ease: easeOutCubic,
  }
};

export const slideUpDirectional = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.8,
    ease: easeOutExpo,
  }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: 0.8,
    ease: easeOutExpo,
  }
};

export const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: 0.8,
    ease: easeOutExpo,
  }
};

// ==========================================
// LEVEL 3: MICRO-INTERACTION VARIANTS
// ==========================================

export const cardLift = {
  initial: { y: 0, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
  hover: {
    y: -8,
    boxShadow: "0 25px 50px -12px rgba(16, 181, 219, 0.25)",
    transition: { duration: 0.3, ease: easeOutCubic }
  }
};

export const magneticHover = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export const buttonPress = {
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const subtleScale = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: easeOutCubic }
  }
};

export const avatarLift = {
  hover: {
    y: -4,
    transition: { duration: 0.3, ease: easeOutCubic }
  }
};

// ==========================================
// SPECIALIZED VARIANTS
// ==========================================

export const lineReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.6,
    ease: easeOutExpo,
  }
};

export const wordStagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3
    }
  }
};

export const marqueeAmbient = {
  animate: {
    x: ["0%", "-50%"],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 60, // Ultra-slow
        ease: "linear",
      },
    },
  }
};

export const marqueeAmbientReverse = {
  animate: {
    x: ["-50%", "0%"],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 60,
        ease: "linear",
      },
    },
  }
};

export const countUp = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 2,
    ease: [0.25, 1, 0.5, 1], // Custom easing for count-up
  }
};

export const underlineSlide = {
  initial: { scaleX: 0 },
  hover: {
    scaleX: 1,
    transition: { duration: 0.3, ease: easeOutCubic }
  }
};

// ==========================================
// UTILITY VARIANTS
// ==========================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, ease: easeOutCubic }
};

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easeOutCubic }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: easeOutCubic }
};
