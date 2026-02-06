'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import CategorySelect from './CategorySelect'
import ZoneSelect from './ZoneSelect'
import { FiDollarSign, FiFileText } from 'react-icons/fi'
import { Form } from 'lucide-react'
import FormResetButton from './Resetbutton'
import { FaRupeeSign } from "react-icons/fa";

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
      zone_id: zoneId,
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
    <div className="min-h-[70vh]  px-4 mt-20">
      <div className="w-full max-w-xl bg-card border shadow-sm rounded-xl p-6 space-y-6">

        {/* HEADER */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Add New Expense</h2>
          <p className="text-sm text-muted-foreground">
            Record a new transaction for tracking and reporting
          </p>
        </div>

        {/* FORM GRID */}
        <div className="grid gap-4 md:grid-cols-2">

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <CategorySelect value={categoryId} onChange={setCategoryId} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Zone</label>
            <ZoneSelect value={zoneId} onChange={setZoneId} />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Amount</label>
            <div className="relative">
              <FaRupeeSign className="absolute left-3 top-3 text-destructive" />
              <input
                placeholder="Enter amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                type="number"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f15bb5] outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-3 text-[#9b5de5]" />
              <input
                placeholder="Optional note"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9b5de5] outline-none"
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={addExpense}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Adding Expense...' : 'Add Expense'}
        </button>
        <FormResetButton onReset={() => {
          setAmount('')
          setDesc('')
          setCategoryId('')
          setZoneId('')
        }}/>

        {/* MESSAGE */}
        {msg && (
          <p className={`text-sm text-center ${
            msg.includes('success')
              ? 'text-[#00f5d4]'
              : 'text-destructive'
          }`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  )
}
