'use client'
import { useState } from 'react'
import CategorySelect from './CategorySelect'
import ZoneSelect from './ZoneSelect'
import { FiFileText } from 'react-icons/fi'
import FormResetButton from './Resetbutton'
import { FaRupeeSign } from "react-icons/fa";

export default function ExpenseForm() {
  const [zoneId, setZoneId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState<File | null>(null)

  const addExpense = async () => {
    setMsg('')

    if (!categoryId) return setMsg('Please select a category')
    if (!zoneId) return setMsg('Please select a zone')
    if (!amount || Number(amount) <= 0) return setMsg('Enter a valid amount')

    setLoading(true)

    const token = localStorage.getItem('token')
    if (!token) {
      setMsg('Not logged in')
      setLoading(false)
      return
    }

    try {
      // 🔹 STEP 1: CREATE EXPENSE
      const res = await fetch('http://localhost:2294/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          categoryId,
          zoneId,
          amount: Number(amount),
          description: desc,
          expenseDate: new Date().toISOString()
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg(data.message || 'Error adding expense')
        setLoading(false)
        return
      }

      const expenseId = data.id

      // 🔹 STEP 2: UPLOAD RECEIPT IF EXISTS
      if (receipt) {
        const formData = new FormData()
        formData.append('image', receipt)

        await fetch(
          `http://localhost:2294/api/expenses/${expenseId}/upload-receipt`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          }
        )
      }

      setMsg('Expense added successfully!')
      setAmount('')
      setDesc('')
      setCategoryId('')
      setZoneId('')
      setReceipt(null)

    } catch (error) {
      console.error(error)
      setMsg('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-[70vh] px-4 mt-20">
      <div className="w-full max-w-xl bg-card border shadow-sm rounded-xl p-6 space-y-6">

        <div>
          <h2 className="text-xl font-semibold text-foreground">Add New Expense</h2>
          <p className="text-sm text-muted-foreground">
            Record a new transaction for tracking and reporting
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <CategorySelect value={categoryId} onChange={setCategoryId} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Zone</label>
            <ZoneSelect value={zoneId} onChange={setZoneId} />
          </div>

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

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">
            Receipt (optional)
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setReceipt(e.target.files?.[0] || null)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

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
          setReceipt(null)
        }}/>

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
