/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        paper:       'var(--paper)',
        'paper-2':   'var(--paper-2)',
        card:        'var(--card)',
        'card-2':    'var(--card-2)',
        ink:         'var(--ink)',
        'ink-soft':  'var(--ink-soft)',
        'ink-faint': 'var(--ink-faint)',
        line:        'var(--line)',
        'line-2':    'var(--line-2)',
        accent:      'var(--accent)',
        'accent-2':  'var(--accent-2)',
      },
      fontFamily: {
        sans:  ['"Zen Kaku Gothic New"', '"Noto Sans JP"', 'ui-sans-serif', 'sans-serif'],
        serif: ['"Noto Serif TC"', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
}
