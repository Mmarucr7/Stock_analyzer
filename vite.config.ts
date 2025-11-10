import { defineConfig, loadEnv } from 'vite';

// Load environment variables
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      'process.env': env, // Optional for some libraries
    },
  };
});
