import { useEffect, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

export type UserProfile = {
  name: string;
  role: string;
  email: string;
  company: string;
  bio: string;
  avatarUrl: string;
};

const STORAGE_KEY = "vcg.userProfile";

const defaultProfile: UserProfile = {
  name: "Jon Goriup",
  role: "CEO",
  email: "",
  company: "VCG.AI",
  bio: "",
  avatarUrl: "/user-avatar.png",
};

const profileSchema = z.object({
  name: z.string().trim().nonempty({ message: "Name is required" }).max(100),
  role: z.string().trim().max(100),
  email: z.string().trim().max(255).email({ message: "Invalid email" }).or(z.literal("")),
  company: z.string().trim().max(100),
  bio: z.string().trim().max(500),
  avatarUrl: z.string().trim().max(2048),
});

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  useEffect(() => {
    const onStorage = () => setProfile(getStoredProfile());
    window.addEventListener("storage", onStorage);
    window.addEventListener("vcg-profile-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("vcg-profile-updated", onStorage);
    };
  }, []);
  return profile;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserProfile>(getStoredProfile);

  useEffect(() => {
    if (open) {
      setForm(getStoredProfile());
      setEditing(false);
    }
  }, [open]);

  const initials = form.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSave = () => {
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      toast({
        title: "Invalid profile",
        description: result.error.issues[0]?.message ?? "Please check your input",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    window.dispatchEvent(new Event("vcg-profile-updated"));
    toast({ title: "Profile updated" });
    setEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatarUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Profile" : "User Profile"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update your personal information." : "Your profile information."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2">
          <Avatar className="h-16 w-16 border-2 border-primary/30">
            <AvatarImage src={form.avatarUrl} alt={form.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          {editing && (
            <label className="text-xs text-primary hover:underline cursor-pointer">
              Change photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} maxLength={100}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={form.role} maxLength={100}
                onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} maxLength={255}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company} maxLength={100}
                onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={form.bio} maxLength={500} rows={3}
                onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <Row label="Name" value={form.name} />
            <Row label="Role" value={form.role || "—"} />
            <Row label="Email" value={form.email || "—"} />
            <Row label="Company" value={form.company || "—"} />
            <Row label="Bio" value={form.bio || "—"} />
          </div>
        )}

        <DialogFooter>
          {editing ? (
            <>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3">
    <span className="text-muted-foreground min-w-[80px]">{label}:</span>
    <span className="text-foreground break-words">{value}</span>
  </div>
);
