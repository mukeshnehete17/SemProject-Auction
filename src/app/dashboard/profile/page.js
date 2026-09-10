"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { User, Mail, Phone, MapPin, Calendar, Camera } from "lucide-react";

function ProfileContent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
        });
      })
      .catch(() => {
        const fallback = {
          name: session.user.name || "",
          email: session.user.email || "",
          phone: "",
          location: "",
          bio: "",
          memberSince: "",
          role: session.user.role,
        };
        setProfile(fallback);
        setForm({
          name: fallback.name,
          email: fallback.email,
          phone: "",
          location: "",
          bio: "",
        });
      });
  }, [session]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const displayName = profile.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast("Profile updated successfully!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold mb-4">
            {initials}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mt-2 capitalize">
            {(profile.role || "buyer").toLowerCase()}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
            <Calendar className="h-4 w-4" />
            <span>Member since {profile.memberSince || "N/A"}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            disabled
            onClick={() => toast("Coming in Phase 2")}
          >
            <Camera className="h-4 w-4" />
            Change Photo
          </Button>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Personal Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                icon={User}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                icon={Mail}
                required
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                icon={Phone}
              />
              <Input
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                icon={MapPin}
              />
            </div>
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors resize-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setForm({
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone || "",
                    location: profile.location || "",
                    bio: profile.bio || "",
                  })
                }
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ToastProvider>
      <ProfileContent />
    </ToastProvider>
  );
}
