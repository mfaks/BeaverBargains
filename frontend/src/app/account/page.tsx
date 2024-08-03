"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'
import UnauthorizedModal from '@/components/ui/UnauthorizedModal'
import ImageUploadAndCropper from '@/components/ui/ImageUploadAndCropper'
import { z } from 'zod'
import { FaFacebookMessenger, FaBox, FaStar, FaList } from 'react-icons/fa'
import NavBar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { UserDetails } from '@/types/UserDetails'

export default function Account() {
  const [bio, setBio] = useState('')
  const [bioChanged, setBioChanged] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [croppedImage, setCroppedImage] = useState<File | null>(null)
  const router = useRouter()
  const { isAuthenticated, user, updateUserProfileImage } = useAuth()
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      setShowUnauthorizedModal(true)
      const timer = setTimeout(() => {
        router.push('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <UnauthorizedModal
        isOpen={showUnauthorizedModal}
        onClose={() => setShowUnauthorizedModal(false)}
        message='You must be logged in to view this page. Redirecting to login...'
      />
    )
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated && user) {
        try {
          const token = localStorage.getItem('token')
          const config = {
            headers: { Authorization: `Bearer ${token}` }
          }
          const response = await axios.get<UserDetails>(`http://localhost:8080/api/users/${user.id}`, config)
          setUserDetails(response.data)
          setBio(response.data.bio || '')
        } catch (error) {
          console.error('Error fetching user details:', error)
          toast({
            title: 'Error',
            description: 'Failed to fetch user details. Please try again.',
            variant: 'destructive',
          })
        }
      }
    }

    fetchUserDetails()
  }, [isAuthenticated, user, toast])

  const handleProfileImageChange = async (file: File | null) => {
    if (file) {
      const formData = new FormData()
      formData.append('image', file)

      try {
        const token = localStorage.getItem('token')
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
        const response = await axios.put(`http://localhost:8080/api/users/${user?.id}/profile-image`, formData, config)
        const updatedUser = response.data
        updateUserProfileImage(updatedUser.profileImageUrl)

        if (user && userDetails) {
          const newUser: UserDetails = {
            ...userDetails,
            profileImage: updatedUser.profileImageUrl
          }

          setUserDetails(newUser)

          toast({
            title: 'Success',
            description: 'Profile picture updated successfully!',
          })

          setProfileImage(file)
        }
      } catch (error) {
        console.error('Error updating profile picture:', error)
        toast({
          title: 'Error',
          description: 'Failed to update profile picture. Please try again.',
          variant: 'destructive',
        })
      }
    } else {
      try {
        const token = localStorage.getItem('token')
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
        const response = await axios.delete(`http://localhost:8080/api/users/${user?.id}/profile-image`, config)
        const updatedUser = response.data
        updateUserProfileImage('')

        if (user && userDetails) {
          const newUser: UserDetails = {
            ...userDetails,
            profileImage: undefined
          }

          setUserDetails(newUser)

          toast({
            title: 'Success',
            description: 'Profile picture removed successfully!',
          })

          setProfileImage(null)
        }
      } catch (error) {
        console.error('Error removing profile picture:', error)
        toast({
          title: 'Error',
          description: 'Failed to remove profile picture. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password must be no more than 20 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one digit')
    .regex(/[@$!%*?&#]/, 'Password must include at least one special character')

  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    const result = passwordSchema.safeParse(password)
    if (result.success) {
      return { isValid: true }
    } else {
      return { isValid: false, error: result.error.errors[0].message }
    }
  }

  const handlePasswordChange = () => {
    setPasswordError('')

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from the current password.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    const validationResult = validatePassword(newPassword)
    if (!validationResult.isValid) {
      setPasswordError(validationResult.error || 'Invalid password.')
      return
    }

    handleSaveProfile()
  }

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      const updateDto = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        bio: bio,
      }

      if (bioChanged) {
        await axios.put(`http://localhost:8080/api/users/${user?.id}/biography`, updateDto, config)
      }

      if (currentPassword && newPassword) {
        await axios.put(`http://localhost:8080/api/users/${user?.id}/password`, {
          currentPassword,
          newPassword
        }, config)
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
        variant: 'default',
      })
      setBioChanged(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token')
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        }
        await axios.delete(`http://localhost:8080/api/users/${user?.id}`, config)
        toast({
          title: 'Success',
          description: 'Your account has been deleted successfully. Navigating back to home.',
          variant: 'default',
        })
        localStorage.removeItem('token')
        router.push('/')
      } catch (error) {
        console.error('Error deleting account:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete account. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className='bg-orange-50 text-black flex flex-col min-h-screen'>
      <NavBar />
      <main className='container mx-auto py-8 px-4 max-w-7xl flex-grow mb-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card className='bg-white shadow rounded-lg text-black'>
            <CardHeader className='flex items-center justify-center gap-3 p-4'>
              <div className='flex flex-col items-center space-y-3'>
                <CardHeader className='p-4'>
                  <CardTitle className='text-lg font-semibold text-center'>My Profile</CardTitle>
                </CardHeader>
                <Avatar className='h-24 w-24'>
                  <AvatarImage src={user?.profileImage} alt='Profile' />
                  <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className='text-center'>
                <CardTitle className='text-xl font-semibold'>{user?.firstName} {user?.lastName}</CardTitle>
                <CardDescription className='text-sm text-gray-600'>{user?.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className='p-4'>
              <div className='space-y-3'>
                <div>
                  <Label className='text-sm font-medium'>First Name</Label>
                  <Input placeholder='First Name' defaultValue={user?.firstName} className='border-gray-300' readOnly />
                </div>
                <div>
                  <Label className='text-sm font-medium'>Last Name</Label>
                  <Input placeholder='Last Name' defaultValue={user?.lastName} className='border-gray-300' readOnly />
                </div>
                <div>
                  <Label className='text-sm font-medium'>Email</Label>
                  <Input placeholder='Email' defaultValue={user?.email} className='border-gray-300' readOnly />
                </div>
                <div>
                  <Label className='text-sm font-medium'>Biography</Label>
                  <Input
                    placeholder='Include a short bio to introduce yourself to buyers'
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value)
                      setBioChanged(userDetails ? e.target.value !== userDetails.bio : false)
                    }}
                    className='border-gray-300'
                  />
                </div>
                <div className='flex justify-between items-center mt-4'>
                  <Button
                    variant='outline'
                    className={`${bioChanged
                      ? 'bg-orange-500 text-white'
                      : 'text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white'
                      } `}
                    onClick={handleSaveProfile}
                    disabled={!bioChanged}
                  >
                    Save Biography
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-white shadow rounded-lg text-black flex flex-col'>
            <CardHeader className='p-4'>
              <CardTitle className='text-lg font-semibold text-center'>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className='p-4 flex-1 space-y-3'>
              <div className='flex flex-col items-center space-y-3'>
                <Label className='text-sm font-medium'>Profile Picture</Label>
                <Avatar className='h-24 w-24'>
                  <AvatarImage src={user?.profileImage} alt='Profile' />
                  <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex justify-center space-x-2'>
                  <ImageUploadAndCropper
                    onImageCropped={(file) => {
                      setCroppedImage(file)
                      handleProfileImageChange(file)
                    }}
                    onClose={() => { }}
                    currentImage={user?.profileImage || null}
                  />
                </div>
              </div>
              <div>
                <Label className='text-sm font-medium'>Current Password</Label>
                <Input
                  type='password'
                  placeholder='Enter your current password'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className='border-gray-300'
                />
              </div>
              <div>
                <Label className='text-sm font-medium'>New Password</Label>
                <Input
                  type='password'
                  placeholder='Enter your new password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className='border-gray-300'
                />
              </div>
              <div>
                <Label className='text-sm font-medium'>Confirm New Password</Label>
                <Input
                  type='password'
                  placeholder='Confirm your new password'
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className='border-gray-300'
                />
              </div>
              {passwordError && <p className='text-red-500 text-sm'>{passwordError}</p>}
              <div className='flex justify-center'>
                <Button
                  variant='outline'
                  className={`w-full ${newPassword && confirmNewPassword && newPassword === confirmNewPassword
                    ? 'bg-orange-500 text-white'
                    : 'text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white'
                    } `}
                  onClick={handlePasswordChange}
                  disabled={!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
            <CardFooter className='p-4 flex justify-center'>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='destructive'
                    className='w-full max-w-xs text-white bg-red-600 hover:bg-red-700 border-red-600'
                  >
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
          <Card className='bg-white shadow rounded-lg text-black col-span-full md:col-span-2'>
            <CardHeader>
              <CardTitle className='text-center font-semibold'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Card className='bg-gray-50 shadow-sm'>
                  <CardHeader className='flex items-center justify-center p-4'>
                    <FaFacebookMessenger className='text-3xl text-orange-500' />
                  </CardHeader>
                  <CardContent className='text-center'>
                    <CardTitle className='text-lg font-semibold'>Messages</CardTitle>
                    <CardDescription>View your messages with buyers and sellers.</CardDescription>
                  </CardContent>
                  <CardFooter className='text-center'>
                    <Button variant='outline' className='w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white'
                      onClick={() => router.push('/messages')}>
                      View Messages
                    </Button>
                  </CardFooter>
                </Card>
                <Card className='bg-gray-50 shadow-sm'>
                  <CardHeader className='flex items-center justify-center p-4'>
                    <FaStar className='text-3xl text-orange-500' />
                  </CardHeader>
                  <CardContent className='text-center'>
                    <CardTitle className='text-lg font-semibold'>Watch List</CardTitle>
                    <CardDescription>View items you've added to your watch list.</CardDescription>
                  </CardContent>
                  <CardFooter className='text-center'>
                    <Button variant='outline' className='w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white'
                      onClick={() => router.push('/favorites')}>
                      View Watch List
                    </Button>
                  </CardFooter>
                </Card>
                <Card className='bg-gray-50 shadow-sm'>
                  <CardHeader className='flex items-center justify-center p-4'>
                    <FaList className='text-3xl text-orange-500' />
                  </CardHeader>
                  <CardContent className='text-center'>
                    <CardTitle className='text-lg font-semibold'>Listed Items</CardTitle>
                    <CardDescription>Manage the items you are listing for sale.</CardDescription>
                  </CardContent>
                  <CardFooter className='text-center'>
                    <Button variant='outline' className='w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white'
                      onClick={() => router.push('/listings')}>
                      View Listed Items
                    </Button>
                  </CardFooter>
                </Card>
                <Card className='bg-gray-50 shadow-sm'>
                  <CardHeader className='flex items-center justify-center p-4'>
                    <FaBox className='text-3xl text-orange-500' />
                  </CardHeader>
                  <CardContent className='text-center'>
                    <CardTitle className='text-lg font-semibold'>Orders</CardTitle>
                    <CardDescription>View the status of your orders.</CardDescription>
                  </CardContent>
                  <CardFooter className='text-center'>
                    <Button variant='outline' className='w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white'
                      onClick={() => router.push('/orders')}>
                      Manage Orders
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}