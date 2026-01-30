'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    supabase
      .from('expenses')
      .select('*, categories(name)')
      .order('expense_date', { ascending: false })
      .then(({ data }) => setExpenses(data || []))
  }, [])

  return (
    <div>
      <h3>Expenses</h3>
      {expenses.map((e: any) => (
        <div key={e.id}>
          ₹{e.amount} — {e.categories?.name} — {e.description}
        </div>
      ))}
    </div>
  )
}
