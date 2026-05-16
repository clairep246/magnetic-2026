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
        login: resolve(root, 'Login/login.html'),
        signup: resolve(root, 'Signup/signup.html'),
        welcome: resolve(root, 'Welcome/welcome.html'),
        profile: resolve(root, 'Profile/profile.html'),
        editProfile: resolve(root, 'EditProfile/edit.html'),
        createActivity: resolve(root, 'CreateActivity/create.html'),
        activityBrowser: resolve(root, 'ActivityBrowser/browser.html'),
      },
    },
  },
})
