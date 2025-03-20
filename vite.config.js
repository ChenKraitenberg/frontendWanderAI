// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv'; // תיקון שם המשתנה
// טעינת משתני הסביבה
dotenv.config();
export default defineConfig({
    plugins: [react()],
    envPrefix: 'VITE_',
});
