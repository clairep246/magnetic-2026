import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    testTimeout: 15000, 
    include: ['pages/**/*.test.{js,jsx,ts,tsx}', 'src/**/*.test.{js,jsx,ts,tsx}', 'tests/**/*.test.{js,jsx,ts,tsx}'],
  },
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
        activityPage: resolve(root, 'pages/ActivityPage/activity.html'),
        activityBrowser: resolve(root, 'pages/ActivityBrowser/browser.html'),
        friends: resolve(root, 'pages/Friends/friend.html'),
        recommendationsActivity: resolve(root, 'pages/ReccActivity/reccAct.html'),
        recommendationsUsers: resolve(root, 'pages/RecommendFriends/recommendF.html'),
      },
    },
  },
})