'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function ManageExpenses() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<any[]>([])
  const [editingExpense, setEditingExpense] = useState<any | null>(null)

  useEffect(() => {
    checkAdmin()
    fetchExpenses()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role !== 'admin') router.push('/dashboard')
  }

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*, users(name), categories(name)')
      .order('expense_date', { ascending: false })

    setExpenses(data || [])
  }

  const deleteExpense = async (id: string) => {
    const confirmDelete = confirm('Delete this expense?')
    if (!confirmDelete) return

    await supabase.from('expenses').delete().eq('id', id)
    fetchExpenses()
  }

  const updateExpense = async () => {
    await supabase
      .from('expenses')
      .update({
        amount: editingExpense.amount,
        description: editingExpense.description,
      })
      .eq('id', editingExpense.id)

    setEditingExpense(null)
    fetchExpenses()
  }

  return (
    <div className="p-6 my-20">
      <h2 className="text-2xl font-bold mb-4">Manage All Expenses</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>User</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id} className="border-t">
              <td>{e.users?.name}</td>
              <td>{e.categories?.name}</td>
              <td>₹{e.amount}</td>
              <td>{e.description}</td>
              <td>{new Date(e.expense_date).toLocaleDateString()}</td>
              <td className="flex gap-2">
                <button
                  onClick={() => setEditingExpense(e)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExpense(e.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-3">Edit Expense</h3>

            <input
              type="number"
              value={editingExpense.amount}
              onChange={(e) =>
                setEditingExpense({ ...editingExpense, amount: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />

            <input
              value={editingExpense.description}
              onChange={(e) =>
                setEditingExpense({ ...editingExpense, description: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingExpense(null)}>Cancel</button>
              <button
                onClick={updateExpense}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
