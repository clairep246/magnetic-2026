import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        login: resolve(root, 'pages/Login/login.html'),
        signup: resolve(root, 'pages/Signup/signup.html'),
        welcome: resolve(root, 'pages/Welcome/welcome.html'),
        profile: resolve(root, 'pages/Profile/profile.html'),
        editProfile: resolve(root, 'pages/EditProfile/edit.html'),
        createActivity: resolve(root, 'pages/CreateActivity/create.html'),
        activityBrowser: resolve(root, 'pages/ActivityBrowser/browser.html'),
      },
    },
  },
})
