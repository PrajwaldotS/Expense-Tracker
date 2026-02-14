'use client'

export default function Logout() {
  const logout = () => {
    // Remove JWT token
    localStorage.removeItem('token')

    // Redirect to login page
    window.location.href = '/'
  }

  return (
    <div className='flex justify-center items-center my-2'>
      <button
        onClick={logout}
        className='bg-card cursor-pointer text-foreground border shadow px-4 py-1 rounded-lg'
      >
        Logout
      </button>
    </div>
  )
}
