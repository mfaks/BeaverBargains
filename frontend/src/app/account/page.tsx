"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '../../components/auth/AuthContext'
import ImageUploadAndCropper from '@/components/ui/ImageUploadAndCropper'
import { z } from 'zod'
import { FaFacebookMessenger, FaBox, FaList, FaHeart } from 'react-icons/fa'
import NavBar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { User } from '@/types/User'
import BeaverIcon from '@/components/ui/BeaverIcon'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

export default function Account() {
  const [bio, setBio] = useState('')
  const [bioChanged, setBioChanged] = useState(false)
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [croppedImage, setCroppedImage] = useState<File | null>(null)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const router = useRouter()
  const { isAuthenticated, user, loading, updateUserProfileImageUrl } = useAuth()
  const [isNewImageUploaded, setIsNewImageUploaded] = useState(false)
  const [showRemoveImageConfirmation, setShowRemoveImageConfirmation] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    } else {
      fetchUserDetails()
    }
  }, [isAuthenticated, loading, user, router])

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
        const response = await axios.put(`https://beaverbargains.onrender.com/api/users/${user?.id}/profile-image`, formData, config)
        const updatedUser = response.data
        const fullImageUrl = getFullImageUrl(updatedUser.profileImageUrl)

        if (user && userDetails) {
          const newUser: User = {
            ...userDetails,
            profileImageUrl: fullImageUrl
          }

          setUserDetails(newUser)
          updateUserProfileImageUrl(fullImageUrl)

          toast({
            title: 'Success',
            description: 'Profile picture updated successfully!',
          })

          setProfileImage(file)
          setIsNewImageUploaded(true)
        }

      } catch (error) {
        console.error('Error updating profile picture:', error)
        toast({
          title: 'Error',
          description: 'Failed to update profile picture. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  useEffect(() => {
    if (user && user.profileImageUrl) {
      setUserDetails(prevDetails => prevDetails ? {
        ...prevDetails,
        profileImageUrl: getFullImageUrl(user.profileImageUrl)
      } : null)
    }
  }, [user?.profileImageUrl])

  const fetchUserDetails = async () => {
    if (user) {
      try {
        const token = localStorage.getItem('token')
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        }
        const response = await axios.get<User>(`https://beaverbargains.onrender.com/api/users/${user.id}`, config)
        setUserDetails({
          ...response.data,
          profileImageUrl: getFullImageUrl(response.data.profileImageUrl)
        })
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

  const handleImageDoubleClick = (imageUrl: string) => {
    setEnlargedImage(imageUrl)
  }

  const handleRemoveProfileImage = async () => {
    setShowRemoveImageConfirmation(true)
  }

  const confirmRemoveProfileImage = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
      await axios.delete(`https://beaverbargains.onrender.com/api/users/${user?.id}/profile-image`, config)

      if (user && userDetails) {
        const newUser: User = {
          ...userDetails,
          profileImageUrl: undefined
        }

        setUserDetails(newUser)
        updateUserProfileImageUrl('')

        toast({
          title: 'Success',
          description: 'Profile picture removed successfully!',
        })

        setProfileImage(null)
        setIsNewImageUploaded(false)
      }
    } catch (error) {
      console.error('Error removing profile picture:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove profile picture. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setShowRemoveImageConfirmation(false)
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
        await axios.put(`https://beaverbargains.onrender.com/api/users/${user?.id}/biography`, updateDto, config)
      }

      if (currentPassword && newPassword) {
        await axios.put(`https://beaverbargains.onrender.com/api/users/${user?.id}/password`, {
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
        await axios.delete(`https://beaverbargains.onrender.com/api/users/${user?.id}`, config)
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

  const BASE_URL = 'https://beaverbargains.onrender.com'
  const getFullImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) {
      return ''
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }
    return `${BASE_URL}/uploads/${imageUrl}`
  }

  return (
    <div>
      {isAuthenticated ? (
        <div className='flex flex-col min-h-screen bg-orange-50 text-orange-500'>
          <NavBar />
          <div className='flex-1 overflow-hidden'>
            <div className='bg-orange-100 py-3 mb-6 flex items-center justify-center'>
              <BeaverIcon className='text-orange-700 mr-3' />
              <h1 className='text-xl font-bold text-center text-orange-700'>My Account</h1>
              <BeaverIcon className='text-orange-700 ml-3' />
            </div>
            <main className='container mx-auto px-4 py-6'>
              {loading ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                  {/* Profile Card */}
                  <Card className='bg-white shadow rounded-lg text-black'>
                    <CardHeader className='flex items-center justify-center gap-2 p-3'>
                      <div className='flex flex-col items-center space-y-2'>
                        <CardHeader className='p-2'>
                          <CardTitle className='text-base font-semibold text-center'>My Profile</CardTitle>
                        </CardHeader>
                        <Avatar
                          className='h-20 w-20 cursor-pointer'
                          onDoubleClick={() => handleImageDoubleClick(getFullImageUrl(userDetails?.profileImageUrl))}
                        >
                          <AvatarImage src={getFullImageUrl(userDetails?.profileImageUrl)} alt={userDetails?.firstName || 'User'} />
                          <AvatarFallback>{userDetails?.firstName?.charAt(0)}{userDetails?.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className='text-center'>
                        <CardTitle className='text-lg font-semibold'>{user?.firstName} {user?.lastName}</CardTitle>
                        <CardDescription className='text-xs text-gray-600'>{user?.email}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className='p-3'>
                      <div className='space-y-2'>
                        <div>
                          <Label className='text-xs font-medium'>First Name</Label>
                          <Input placeholder='First Name' defaultValue={user?.firstName} className='border-gray-300 h-8 text-sm' readOnly />
                        </div>
                        <div>
                          <Label className='text-xs font-medium'>Last Name</Label>
                          <Input placeholder='Last Name' defaultValue={user?.lastName} className='border-gray-300 h-8 text-sm' readOnly />
                        </div>
                        <div>
                          <Label className='text-xs font-medium'>Email</Label>
                          <Input placeholder='Email' defaultValue={user?.email} className='border-gray-300 h-8 text-sm' readOnly />
                        </div>
                        <div>
                          <Label className='text-xs font-medium'>Biography</Label>
                          <Input
                            placeholder='Include a short bio to introduce yourself to buyers'
                            value={bio}
                            onChange={(e) => {
                              setBio(e.target.value)
                              setBioChanged(userDetails ? e.target.value !== userDetails.bio : false)
                            }}
                            className='border-gray-300 h-8 text-sm'
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className='p-3'>
                      <Button
                        variant='outline'
                        className={`text-xs py-1 px-2 w-full ${bioChanged ? 'bg-orange-500 text-white' : 'text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white'}`}
                        onClick={handleSaveProfile}
                        disabled={!bioChanged}
                      >
                        Save Biography
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Account Settings Card */}
                  <Card className='bg-white shadow rounded-lg text-black flex flex-col'>
                    <CardHeader className='p-3'>
                      <CardTitle className='text-base font-semibold text-center'>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className='p-3 flex-1 space-y-2'>
                      <div className='flex flex-col items-center space-y-2'>
                        <Label className='text-xs font-medium'>Profile Picture</Label>
                        <Avatar className='h-24 w-24'>
                          <AvatarImage src={getFullImageUrl(userDetails?.profileImageUrl)} alt={userDetails?.firstName || 'User'} />
                          <AvatarFallback>{userDetails?.firstName?.charAt(0)}{userDetails?.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className='flex justify-center space-x-2'>
                          {userDetails?.profileImageUrl && !isNewImageUploaded ? (
                            <AlertDialog open={showRemoveImageConfirmation} onOpenChange={setShowRemoveImageConfirmation}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant='destructive'
                                  onClick={handleRemoveProfileImage}
                                  className='text-[10px] py-0.5 px-1.5 h-6 min-h-0 font-normal'
                                >
                                  Remove Picture
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white rounded-lg shadow-lg border border-orange-200 p-6 max-w-md mx-auto">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-semibold text-orange-700 mb-2">Remove Profile Picture</AlertDialogTitle>
                                  <AlertDialogDescription className="text-sm text-gray-600">
                                    Are you sure you want to remove your profile picture? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6 flex justify-end space-x-2">
                                  <AlertDialogCancel className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmRemoveProfileImage}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <ImageUploadAndCropper
                              onImageCropped={(file) => {
                                setCroppedImage(file)
                                handleProfileImageChange(file)
                              }}
                              onClose={() => { }}
                              currentImage={user?.profileImageUrl || null}
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className='text-xs font-medium'>Current Password</Label>
                        <Input
                          type='password'
                          placeholder='Enter your current password'
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className='border-gray-300 h-8 text-sm'
                        />
                      </div>
                      <div>
                        <Label className='text-xs font-medium'>New Password</Label>
                        <Input
                          type='password'
                          placeholder='Enter your new password'
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className='border-gray-300 h-8 text-sm'
                        />
                      </div>
                      <div>
                        <Label className='text-xs font-medium'>Confirm New Password</Label>
                        <Input
                          type='password'
                          placeholder='Confirm your new password'
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className='border-gray-300 h-8 text-sm'
                        />
                      </div>
                      {passwordError && <p className='text-red-500 text-xs'>{passwordError}</p>}
                      <div className='flex justify-center'>
                        <Button
                          variant='outline'
                          className={`w-full text-xs py-1 ${newPassword && confirmNewPassword && newPassword === confirmNewPassword
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
                    <CardFooter className='p-3 flex justify-center'>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='destructive'
                            className='w-full max-w-xs text-white bg-red-600 hover:bg-red-700 border-red-600 text-xs py-1'
                          >
                            Delete My Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white rounded-lg shadow-lg border border-orange-200 p-6 max-w-md mx-auto">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-semibold text-orange-700 mb-2">Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm text-gray-600">
                              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6 flex justify-end space-x-2">
                            <AlertDialogCancel className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                </div>
              )}

              {/* Quick Actions Card */}
              {loading ? (
                <SkeletonCard />
              ) : (
                <Card className='bg-white shadow rounded-lg text-black mt-6'>
                  <CardHeader>
                    <CardTitle className='text-center font-semibold text-base'>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                      {[
                        { title: 'Messages', icon: FaFacebookMessenger, description: 'View your messages with buyers and sellers.', action: 'View Messages' },
                        { title: 'Favorites', icon: FaHeart, description: 'View items you\'ve added to your favorites.', action: 'View Favorites' },
                        { title: 'Listed Items', icon: FaList, description: 'Manage the items you are listing for sale.', action: 'View Listed Items' },
                        { title: 'Orders', icon: FaBox, description: 'View the status of your orders.', action: 'Manage Orders' }
                      ].map((item, index) => (
                        <Card key={index} className='bg-gray-50 shadow-sm'>
                          <CardHeader className='flex items-center justify-center p-2'>
                            <item.icon className='text-2xl text-orange-500' />
                          </CardHeader>
                          <CardContent className='text-center p-2'>
                            <CardTitle className='text-sm font-semibold'>{item.title}</CardTitle>
                            <CardDescription className='text-xs'>{item.description}</CardDescription>
                          </CardContent>
                          <CardFooter className='text-center p-2'>
                            <Button
                              variant='outline'
                              className='w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white text-xs py-1'
                              onClick={() => router.push(`/${item.title.toLowerCase().replace(' ', '-')}`)}
                            >
                              {item.action}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
          <Footer />
          {enlargedImage && (
            <div
              className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
              onClick={() => setEnlargedImage(null)}
            >
              <img
                src={enlargedImage}
                alt="Enlarged profile"
                className='max-w-full max-h-full object-contain'
              />
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}