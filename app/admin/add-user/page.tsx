'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi'

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

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [idProofType, setIdProofType] = useState<IdProofType | ''>('')
  const [idProofFile, setIdProofFile] = useState<File | null>(null)

  const [msg, setMsg] = useState('')

  /* ---------------- ADMIN CHECK ---------------- */
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data?.role !== 'admin') {
        router.push('/Dashboard')
      }
    }

    checkAdmin()
  }, [router])

  /* ---------------- CREATE USER ---------------- */
  const createUser = async () => {
  try {
    setMsg('')

    if (!name || !email || !password || !dob || !gender) {
      setMsg('Please fill all required fields')
      return
    }

    /* 1️⃣ CREATE AUTH USER */
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const result = await res.json()

    if (!res.ok || !result.userId) {
      throw new Error(result.error || 'Failed to create user')
    }

    const userId: string = result.userId
    const username = name.toLowerCase().replace(/\s+/g, '-')

    /* 2️⃣ PROFILE PHOTO */
    let profilePhotoUrl: string | null = null

    if (profilePhoto) {
      const ext = profilePhoto.type.split('/')[1] || 'jpg'
      const fileName = `${username}-${dob}-${gender}-${username}.${ext}`

      const upload = await supabase.storage
        .from('profile-photos')
        .upload(`${userId}/${fileName}`, profilePhoto, { upsert: true })

      if (upload.error) {
        throw new Error(upload.error.message)
      }

      profilePhotoUrl = supabase.storage
        .from('profile-photos')
        .getPublicUrl(`${userId}/${fileName}`).data.publicUrl
    }

    /* 3️⃣ ID PROOF */
    let idProofUrl: string | null = null

    if (idProofFile && idProofType) {
      const ext = idProofFile.type.split('/')[1] || 'jpg'
      const fileName = `${username}-${dob}-${idProofType}-${username}.${ext}`

      const upload = await supabase.storage
        .from('id-proofs')
        .upload(`${userId}/${fileName}`, idProofFile, { upsert: true })

      if (upload.error) {
        throw new Error(upload.error.message)
      }

      idProofUrl = supabase.storage
        .from('id-proofs')
        .getPublicUrl(`${userId}/${fileName}`).data.publicUrl
    }

    /* 4️⃣ UPDATE USER TABLE */
    const update = await supabase
      .from('users')
      .update({
        phone: phone || null,
        dob,
        gender,
        profile_photo_url: profilePhotoUrl,
        id_proof_type: idProofType || null,
        id_proof_url: idProofUrl,
      })
      .eq('id', userId)
      .select()

    if (update.error) {
      throw new Error(update.error.message)
    }

    if (!update.data || update.data.length === 0) {
      throw new Error('User update blocked (RLS)')
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

            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Temporary Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

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
              <option className='bg-card text-foreground' value="other">Other</option>
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files?.[0] ?? null)}
            />

            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={idProofType}
              onChange={(e) => setIdProofType(e.target.value as IdProofType)}
            >
              <option className='bg-card text-foreground'  value="">Select ID Proof</option>
              <option className='bg-card text-foreground' value="aadhaar">Aadhaar Card</option>
              <option className='bg-card text-foreground' value="pan">PAN Card</option>
              <option className='bg-card text-foreground' value="driving_license">Driving Licence</option>
            </select>

            {idProofType && (
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setIdProofFile(e.target.files?.[0] ?? null)}
              />
            )}
          </div>

          <button
            onClick={createUser}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg"
          >
            Create User
          </button>

          {msg && (
            <p className={`text-sm text-center ${msg.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
