import ProtectedRoute from '@/components/ProtectedRoute'
import ExpenseForm from '@/components/ExpenseForm'

export default function AddExpensePage() {
  return (
    <ProtectedRoute>
      <h2 className='mt-20 text-center text-3xl font-bold'>Add Expense</h2>
      <div className="flex justify-center items-center ">
        <ExpenseForm />
      </div>
    </ProtectedRoute>
  )
}
