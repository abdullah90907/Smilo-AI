import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    blood_group: "",
    address: "",
    profile_image_url: "",
    age: "",
    gender: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/patient/profile", {
          headers: {
            "x-user-id": localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).user_id || JSON.parse(localStorage.getItem("user")!).id : "",
          },
        });
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          setFormData({
            name: data.profile.full_name || "",
            email: data.profile.email || "",
            phone_number: data.profile.phone_number || "",
            date_of_birth: data.profile.date_of_birth || "",
            blood_group: data.profile.blood_group || "",
            address: data.profile.address || "",
            profile_image_url: data.profile.profile_image_url || "",
            age: data.profile.age || "",
            gender: data.profile.gender || "",
            password: "",
            confirm_password: "",
          });
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, profile_image_url: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (formData.password && formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
      };

      const res = await fetch("http://127.0.0.1:8000/api/patient/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).user_id || JSON.parse(localStorage.getItem("user")!).id : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setFormData({
          ...formData,
          password: "",
          confirm_password: "",
        });
        toast.success(data.message);
        window.dispatchEvent(new Event("dashboard-update"));
      } else {
        toast.error(data.detail || "Failed to update profile");
      }
    } catch (e) {
      console.error("Error saving profile:", e);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-8">
          <div className="relative">
            <Avatar className="w-32 h-32">
              {formData.profile_image_url ? (
                <AvatarImage src={formData.profile_image_url} />
              ) : (
                <AvatarFallback className="bg-[#21b2c0] text-white text-3xl">
                  {getInitials(formData.name || "User")}
                </AvatarFallback>
              )}
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-[#21b2c0] text-white p-2 rounded-full cursor-pointer hover:bg-[#1a95a0]">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Recommended: Square image, at least 400x400px
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group</Label>
              <Input
                id="blood_group"
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your password (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          className="bg-[#21b2c0] hover:bg-[#1a95a0]"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
