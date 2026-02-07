import ProtectedRoute from '@/components/ProtectedRoute'
import ExpenseTable from '@/components/ExpenseTable'

import LogoutButton from '@/components/Logout'

export default function Dashboard() {
  return (
    <div className='my-20'>
    <ProtectedRoute>
    <h2 className='text-center text-3xl font-bold '>My Expenses</h2>
    <ExpenseTable />
    
  
    </ProtectedRoute>
    </div>
  )
}
