// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'h1': ['2.5rem', { lineHeight: '1.2' }],  // 40px
        'h2': ['2rem', { lineHeight: '1.3' }],    // 32px
        'h3': ['1.75rem', { lineHeight: '1.4' }], // 28px
        'h4': ['1.5rem', { lineHeight: '1.4' }],  // 24px
        'h5': ['1.25rem', { lineHeight: '1.5' }], // 20px
        'h6': ['1.125rem', { lineHeight: '1.5' }],// 18px
        'body': ['1rem', { lineHeight: '1.6' }],  // 16px
        'small': ['0.875rem', { lineHeight: '1.5' }], // 14px
      },
      colors: {
        'hata-blue': '#1e3a8a', // adjust to your actual blue
        'hata-red': '#b91c1c',  // adjust
        // ... other colors
      }
    }
  }
}