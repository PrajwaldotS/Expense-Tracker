'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import CategorySelect from './CategorySelect'

export default function ExpenseForm() {
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [msg, setMsg] = useState('')

  const addExpense = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setMsg('Not logged in')

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      category_id: categoryId,
      amount: Number(amount),
      description: desc,
      expense_date: new Date().toISOString().split('T')[0],
    })

    if (error) setMsg(error.message)
    else setMsg('Expense added!')
  }

  return (
    <div>
      <CategorySelect value={categoryId} onChange={setCategoryId} />
      <input placeholder="Amount" onChange={e => setAmount(e.target.value)} />
      <input placeholder="Description" onChange={e => setDesc(e.target.value)} />
      <button onClick={addExpense}>Add Expense</button>
      <p>{msg}</p>
    </div>
  )
}
