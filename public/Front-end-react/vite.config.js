import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Front-end-react/',      // روابط تبدأ من هنا
  build: {
    outDir: 'public/Front-end-react', // البناء يذهب مباشرة داخل public/Front-end-react
    assetsDir: 'assets',
    emptyOutDir: true,                 // يمسح المجلد قبل البناء
  },
})
