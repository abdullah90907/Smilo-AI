import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";
import { getDoctorProfile, updateDoctorProfile } from "@/lib/api";

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    clinic_name: "",
    specialization: "",
    experience_years: "",
    city: "",
    qualifications: "",
    registration_number: "",
    linkedin_url: "",
    facebook_url: "",
    profile_image_url: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getDoctorProfile();
        if (data.success) {
          setProfile(data.profile);
          setFormData({
            full_name: data.profile.full_name,
            clinic_name: data.profile.clinic_name,
            specialization: data.profile.specialization,
            experience_years: data.profile.experience_years.toString(),
            city: data.profile.city,
            qualifications: data.profile.qualifications,
            registration_number: data.profile.registration_number || "",
            linkedin_url: data.profile.linkedin_url || "",
            facebook_url: data.profile.facebook_url || "",
            profile_image_url: data.profile.profile_image_url || "",
            new_password: "",
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
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      toast.error("Passwords do not match!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      };

      const data = await updateDoctorProfile(payload);
      if (data.success) {
        setProfile(data.profile);
        setFormData({
          ...formData,
          new_password: "",
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
        <p className="text-muted-foreground">Manage your professional information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Update your professional headshot</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-8">
          <div className="relative">
            <Avatar className="w-32 h-32">
              {formData.profile_image_url ? (
                <AvatarImage src={formData.profile_image_url} />
              ) : (
                <AvatarFallback className="bg-[#21b2c0] text-white text-3xl">
                  {getInitials(formData.full_name || "Doctor")}
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
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your professional details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic_name">Clinic Name</Label>
              <Input
                id="clinic_name"
                value={formData.clinic_name}
                onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <Textarea
                id="qualifications"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                type="url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
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
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
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
