import ProtectedRoute from '@/components/ProtectedRoute'
import ExpenseTable from '@/components/ExpenseTable'
import LogoutButton from '@/components/Logout'

export default function Dashboard() {
  return (
    <div>
    <ProtectedRoute>
    <h2>My Expenses</h2>
    <ExpenseTable />
    
  
    </ProtectedRoute>
    </div>
  )
}
