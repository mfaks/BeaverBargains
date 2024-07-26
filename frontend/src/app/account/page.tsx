"use client"

import { useState, useEffect } from "react"
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
import axios from 'axios'
import { useToast } from "@/components/ui/use-toast"

interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const [bio, setBio] = useState("")
  const [bioChanged, setBioChanged] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated && user) {
        try {
          const token = localStorage.getItem('token');
          const config = {
            headers: { Authorization: `Bearer ${token}` }
          };
          const response = await axios.get<UserDetails>(`http://localhost:8080/api/users/${user.id}`, config);
          setUserDetails(response.data);
          setBio(response.data.bio || "");
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast({
            title: "Error",
            description: "Failed to fetch user details. Please try again.",
            variant: "destructive",
          })
        }
      }
    };

    fetchUserDetails();
  }, [isAuthenticated, user, toast]);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handlePasswordChange = () => {
    setPasswordError("");

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from the current password.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    handleSaveProfile();
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
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
        await axios.put(`http://localhost:8080/api/users/${user?.id}/biography`, updateDto, config);
      }

      if (currentPassword && newPassword) {
        await axios.put(`http://localhost:8080/api/users/${user?.id}/password`, {
          currentPassword,
          newPassword
        }, config);
      }

      if (profileImage) {
        const formData = new FormData();
        formData.append("image", profileImage);
        await axios.post(`http://localhost:8080/api/users/${user?.id}/profile-image`, formData, config);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default",
      })
      setBioChanged(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        }
        await axios.delete(`http://localhost:8080/api/users/${user?.id}`, config);
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully.",
          variant: "default",
        });
        logout();
        router.push('/');
      } catch (error) {
        console.error("Error deleting account:", error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        })
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
                  <Input
                    placeholder="Include a short bio to introduce yourself to buyers!"
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      setBioChanged(userDetails ? e.target.value !== userDetails.bio : false);
                    }}
                    className="border-gray-300"
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    className={`${
                      bioChanged
                        ? "bg-orange-500 text-white"
                        : "text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white"
                    }`}
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
                    className="text-sm text-gray-500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center">
              <Button
                variant="outline"
                className="bg-red-500 text-white"
                onClick={handleDeleteAccount}
              >
                Delete My Account
              </Button>
              <Button
                variant="outline"
                className="bg-orange-500 text-white"
                onClick={handlePasswordChange}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
          <Card className="bg-white shadow rounded-lg text-black">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold text-center">Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col items-center">
                <FaFacebookMessenger className="h-10 w-10 mb-2 text-gray-600" />
                <span className="text-center text-gray-600">Messages</span>
              </div>
              <div className="flex flex-col items-center">
                <FaBox className="h-10 w-10 mb-2 text-gray-600" />
                <span className="text-center text-gray-600">Orders</span>
              </div>
              <div className="flex flex-col items-center">
                <FaList className="h-10 w-10 mb-2 text-gray-600" />
                <span className="text-center text-gray-600">Wish List</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
