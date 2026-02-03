'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import CategorySelect from './CategorySelect'
import ZoneSelect from './ZoneSelect'

export default function ExpenseForm() {
  const [zoneId, setZoneId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const addExpense = async () => {
    setMsg('')

    if (!categoryId) return setMsg('Please select a category')
    if (!zoneId) return setMsg('Please select a zone')
    if (!amount || Number(amount) <= 0) return setMsg('Enter a valid amount')

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMsg('Not logged in')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      category_id: categoryId,
      zone_id: zoneId, // ✅ ZONE LINKED
      amount: Number(amount),
      description: desc,
      expense_date: new Date().toISOString().split('T')[0],
    })

    if (error) {
      setMsg(error.message)
    } else {
      setMsg('Expense added successfully!')
      setAmount('')
      setDesc('')
      setCategoryId('')
      setZoneId('')
    }

    setLoading(false)
  }

  return (
    <div className="mt-20 grid grid-cols-1 gap-4 justify-center max-w-md mx-2 bg-black/10 p-6 rounded-md shadow-lg">
      <h2 className="text-center text-3xl font-bold">Add Expense</h2>

      <CategorySelect value={categoryId} onChange={setCategoryId} />
      <ZoneSelect value={zoneId} onChange={setZoneId} />

      <input
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="bg-white p-2 rounded-md"
        type="number"
      />

      <input
        placeholder="Description"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        className="bg-white p-2 rounded-md"
      />

      <button
        onClick={addExpense}
        disabled={loading}
        className="bg-blue-500 text-white hover:bg-blue-600 p-2 rounded-md disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Expense'}
      </button>

      {msg && <p className="text-center text-sm text-red-600">{msg}</p>}
    </div>
  )
}
