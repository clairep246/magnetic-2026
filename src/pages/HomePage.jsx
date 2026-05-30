import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function HomePage() {
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
    <section>
      <h1>Home</h1>
      {todos.length === 0 ? (
        <p>No items found yet.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
