"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { updateProfileAction } from "@/lib/profile-actions";
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-950 border-t-transparent" />
      </div>
    );
  }

  const displayName = profile.name || "Member";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    // Only name and email are stored on the server (see
    // updateProfileAction); phone/location/bio stay local to this form.
    const result = await updateProfileAction({
      name: form.name,
      email: form.email,
    });
    setSaving(false);
    if (result?.error) {
      setSaveError(result.error);
      return;
    }
    setProfile((prev) => ({ ...prev, name: form.name.trim(), email: form.email.trim().toLowerCase() }));
    toast("Name and email updated successfully!", "success");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
          Account Dossier
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
          Collector & Consignor Profile
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Review credentials, verified contact info, and marketplace standing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Identity Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200/90 p-8 flex flex-col items-center text-center shadow-2xs space-y-4">
          <div className="w-24 h-24 rounded-full bg-zinc-950 text-white flex items-center justify-center text-3xl font-bold font-mono shadow-md">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
              {displayName}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">{profile.email}</p>
          </div>

          <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200">
            {(profile.role || "buyer").toUpperCase()} CLEARANCE
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono pt-2 border-t border-zinc-100 w-full justify-center">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <span>Member since {profile.memberSince || "2024"}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            disabled
            onClick={() => toast("Profile photo uploads enabled in Phase 2", "info")}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Change Photo</span>
          </Button>
        </div>

        {/* Right Column: Edit Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">
              Personal Information
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Used for consignment settlement, shipping notifications, and identity verification.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {saveError && (
              <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl p-3">
                {saveError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Legal Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                icon={User}
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                icon={Mail}
                required
              />
              <Input
                label="Telephone Contact"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                icon={Phone}
              />
              <Input
                label="Primary Location / City"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Mumbai, India"
                icon={MapPin}
              />
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5"
              >
                Collector Statement / Bio
              </label>
              <p className="text-[11px] text-zinc-400 mb-1.5">
                Telephone, location and bio are kept in this form only — the
                server stores your name and email.
              </p>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Share your collecting interests or consignment background..."
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 focus:outline-none transition-colors resize-none shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Save Profile Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
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
                Reset
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
