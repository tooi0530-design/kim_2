import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Vercel 환경 변수를 로드합니다.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // 코드 내의 process.env.API_KEY를 실제 환경 변수 값으로 대체합니다.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});