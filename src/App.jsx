
import { useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  useEffect(() => {
    console.log("useEffect is running")

    async function test() {
      const result = await supabase.from('test').select('*')
      console.log(result)
    }

    test()
  }, [])

  return <h1>Check console</h1>
}
