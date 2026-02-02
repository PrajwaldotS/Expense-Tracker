import ProtectedRoute from '@/components/ProtectedRoute'
import ExpenseForm from '@/components/ExpenseForm'

export default function AddExpensePage() {
  
  return (
    <ProtectedRoute>
      <div className="">
        <ExpenseForm />
      </div>
    </ProtectedRoute>
  )
}
