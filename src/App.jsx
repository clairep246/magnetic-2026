
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [todos, setTodos] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadTodos() {
      const { data, error } = await supabase.from('todos').select()

      if (error) {
        setError(error.message)
        return
      }

      setTodos(data ?? [])
    }

    loadTodos()
  }, [])

  if (error) {
    return <p>Unable to load todos: {error}</p>
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}
