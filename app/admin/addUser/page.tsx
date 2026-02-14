'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiEye, FiEyeOff, FiLock, FiPhone } from 'react-icons/fi'

type Gender = 'male' | 'female' | 'other'
type IdProofType = 'aadhaar' | 'pan' | 'driving_license'

export default function CreateUserPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [role, setRole] = useState<'admin' | 'user'>('user')

  const [showCurrent, setShowCurrent] = useState(false)

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [idProofType, setIdProofType] = useState<IdProofType | ''>('')
  const [idProofFile, setIdProofFile] = useState<File | null>(null)

  const [msg, setMsg] = useState('')

  /* ---------------- ADMIN CHECK ---------------- */
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch('http://localhost:2294/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          router.push('/login')
          return
        }

        const data = await res.json()

        if (data.role !== 'admin') {
          router.push('/Dashboard')
        }

      } catch (error) {
        console.error(error)
        router.push('/login')
      }
    }

    checkAdmin()
  }, [router])

  /* ---------------- CREATE USER ---------------- */
  const createUser = async () => {
    try {
      setMsg('')

      if (!name || !email || !password || !dob || !gender || !role ) {
        setMsg('Please fill all required fields')
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        setMsg('Not authorized')
        return
      }

      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("role", role)
      formData.append("phone", phone)
      formData.append("dob", dob)
      formData.append("gender", gender)
          
      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto)
      }
      if (idProofFile && idProofType) {
        formData.append('idProofType', idProofType)
        formData.append('idProofFile', idProofFile)
      }

      const res = await fetch('http://localhost:2294/api/admin/create-user', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to create user')
      }

      setMsg('User created successfully!')

      /* RESET */
      setName('')
      setEmail('')
      setPassword('')
      setPhone('')
      setDob('')
      setGender('')
      setProfilePhoto(null)
      setIdProofType('')
      setIdProofFile(null)

    } catch (err: any) {
      console.error('Create user failed:', err)
      setMsg(err.message || 'Something went wrong')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-[70vh] px-4 mt-20">
        <div className="w-full max-w-lg bg-card border shadow-sm rounded-xl p-6 space-y-6">

          <div>
            <h2 className="text-xl font-semibold">Create New User</h2>
            <p className="text-sm text-muted-foreground">
              Add a new member to the finance system
            </p>
          </div>

          <div className="space-y-4">
            <input
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Password
              </label>

              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-[#9b5de5]" />

                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#9b5de5] outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="relative">
              <FiPhone className="absolute left-3 top-3 text-muted-foreground" />
              <input
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
                placeholder="Contact Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option className='bg-card text-foreground' value="">Select gender</option>
              <option className='bg-card text-foreground' value="male">Male</option>
              <option className='bg-card text-foreground' value="female">Female</option>
              <option className='bg-card text-foreground' value="other">Prefer Not to say</option>
            </select>

            <label className="text-muted-foreground">
              Profile Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files?.[0] ?? null)}
              name="profilePhoto"
            />
          </div>

          <button
            onClick={createUser}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg"
          >
            Create User
          </button>

          {msg && (
            <p className={`text-sm text-center ${
              msg.includes('success')
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
