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
    <div className='mt-20 grid grid-cols-1 gap-4 justify-center  w-[50%] bg-black/10 p-6 rounded-md shadow-lg'>
      <h2 className=' text-center text-3xl font-bold'>Add Expense</h2>
      <CategorySelect value={categoryId} onChange={setCategoryId}  />
      <input placeholder="Amount" onChange={e => setAmount(e.target.value)} className='bg-white p-2 rounded-md' />
      <input placeholder="Description" onChange={e => setDesc(e.target.value)} className='bg-white p-2 rounded-md' />
      <button onClick={addExpense} className='bg-blue-500 text-white hover:bg-blue-600 p-2 rounded-md'>Add Expense</button>
      <p>{msg}</p>
    </div>
  )
}
