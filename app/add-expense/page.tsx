import ProtectedRoute from '@/components/ProtectedRoute'
import ExpenseForm from '@/components/ExpenseForm'

export default function AddExpensePage() {
  return (
    <ProtectedRoute>
      <h2>Add Expense</h2>
      <ExpenseForm />
    </ProtectedRoute>
  )
}
