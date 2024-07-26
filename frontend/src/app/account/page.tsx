"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import NavBar from "../NavBar"
import Footer from "../Footer"
import { FaFacebookMessenger, FaBox, FaStar, FaList } from "react-icons/fa"
import { useAuth } from '../AuthContext'
import UnauthorizedModal from '../UnauthorizedModal'
import axios from 'axios'

export default function ProfilePage() {
  const [bio, setBio] = useState("Enter your bio here")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [errorMessage, setErrorMessage] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setErrorMessage("You must be logged in to access the profile page. Redirecting to login.")
      setModalOpen(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }, [isAuthenticated, router])

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const updateDto = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        bio,

        currentPassword,
        newPassword
      }
      
      await axios.put(`http://localhost:8080/api/users/${user?.id}/profile`, updateDto, config);

      if (profileImage) {
        const formData = new FormData();
        formData.append("image", profileImage);
        await axios.post(`http://localhost:8080/api/users/${user?.id}/profile-image`, formData, config);
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Failed to update profile: ${error.response.data}`);
      } else {
        alert("An unexpected error occurred while updating the profile.");
      }
    }
  }

  return (
    <div className="bg-white text-black min-h-screen">
      <NavBar />
      <main className="container mx-auto py-4 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white shadow rounded-lg text-black">
            <CardHeader className="flex items-center justify-center gap-3 p-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user?.profileImage || "/placeholder-user.jpg"} />
                <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle className="text-lg font-semibold">{user?.firstName} {user?.lastName}</CardTitle>
                <CardDescription className="text-xs text-gray-600">{user?.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">First Name</Label>
                  <Input placeholder="First Name" defaultValue={user?.firstName} className="border-gray-300" readOnly />
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Name</Label>
                  <Input placeholder="Last Name" defaultValue={user?.lastName} className="border-gray-300" readOnly />
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <Input placeholder="Email" defaultValue={user?.email} className="border-gray-300" readOnly />
                </div>
                <div>
                  <Label className="text-sm font-medium">Biography</Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="border-gray-300 rounded-lg p-2 w-full text-sm"
                    rows={2}
                    placeholder="Include a short bio to introduce yourself to buyers!"
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    className="text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white"
                    onClick={handleSaveProfile}
                  >
                    Save Biography
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow rounded-lg text-black flex flex-col">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold text-center">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3">
              <div>
                <Label className="text-sm font-medium">Profile Picture</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user?.profileImage || "/placeholder-user.jpg"} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        setProfileImage(files[0])
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Current Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">New Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm your new password"
                  className="border-gray-300"
                />
              </div>
              <div>
                <Button
                  variant="outline"
                  className="w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white"
                  onClick={handleSaveProfile}
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
            <CardFooter className="p-4 flex justify-center">
              <Button variant="destructive" className="w-full max-w-xs text-white bg-red-600 hover:bg-red-700 border-red-600">
                Delete My Account
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card className="bg-white shadow rounded-lg text-black">
            <CardHeader className="flex items-center justify-center p-4">
              <FaFacebookMessenger className="text-3xl text-orange-500" />
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-lg font-semibold">Messages</CardTitle>
              <CardDescription>View your messages with buyers and sellers.</CardDescription>
            </CardContent>
            <CardFooter className="text-center">
              <Button variant="outline" className="w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white">
                View Messages
              </Button>
            </CardFooter>
          </Card>
          <Card className="bg-white shadow rounded-lg text-black">
            <CardHeader className="flex items-center justify-center p-4">
              <FaStar className="text-3xl text-orange-500" />
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-lg font-semibold">Watch List</CardTitle>
              <CardDescription>View items you've added to your watch list.</CardDescription>
            </CardContent>
            <CardFooter className="text-center">
              <Button variant="outline" className="w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white">
                View Watch List
              </Button>
            </CardFooter>
          </Card>
          <Card className="bg-white shadow rounded-lg text-black">
            <CardHeader className="flex items-center justify-center p-4">
              <FaList className="text-3xl text-orange-500" />
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-lg font-semibold">Order List</CardTitle>
              <CardDescription>View the status of your orders and transactions.</CardDescription>
            </CardContent>
            <CardFooter className="text-center">
              <Button variant="outline" className="w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white">
                View Order List
              </Button>
            </CardFooter>
          </Card>
          <Card className="bg-white shadow rounded-lg text-black">
            <CardHeader className="flex items-center justify-center p-4">
              <FaBox className="text-3xl text-orange-500" />
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-lg font-semibold">Orders</CardTitle>
              <CardDescription>Manage your orders and track deliveries.</CardDescription>
            </CardContent>
            <CardFooter className="text-center">
              <Button variant="outline" className="w-full text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white">
                Manage Orders
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
