'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState<any[]>([])

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, amount, description, expense_date, categories(name)')
        .order('expense_date', { ascending: false })

      if (error) {
        console.error(error.message)
        return
      }

      setExpenses(data || [])
    }

    fetchExpenses()
  }, [])

  return (
    <div>
      <Table className="w-3/4 mx-auto mt-8 border rounded-xl">
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead> {/* 🆕 Added */}
          </TableRow>
        </TableHeader>

        <TableBody>
          {expenses.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">₹{e.amount}</TableCell>
              <TableCell>{e.categories?.name}</TableCell>
              <TableCell>{e.description}</TableCell>
              <TableCell>
                {e.expense_date
                  ? new Date(e.expense_date).toLocaleDateString()
                  : '—'}
              </TableCell> {/* 🆕 Display date */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
