import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Calendar,
  Bell,
  Shield,
  Languages,
  Clock,
  Pencil,
  Check,
  X as XIcon,
  Camera,
  KeyRound,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { getStoredProfile, type UserProfile } from "@/components/UserProfileDialog";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "vcg.userProfile";
const EXT_STORAGE_KEY = "vcg.userProfileExtended";

type ExtendedProfile = {
  phone: string;
  location: string;
  department: string;
  jobTitle: string;
  website: string;
  linkedin: string;
  twitter: string;
  github: string;
  joinedAt: string;
  timezone: string;
  language: string;
  orgRole: "Super Admin" | "Organisation Admin" | "User";
  expertise: string[];
  interests: string[];
  notifyEmail: boolean;
  notifyProduct: boolean;
  notifyWeekly: boolean;
  twoFactor: boolean;
};

const defaultExt: ExtendedProfile = {
  phone: "",
  location: "",
  department: "",
  jobTitle: "",
  website: "",
  linkedin: "",
  twitter: "",
  github: "",
  joinedAt: new Date().toISOString().slice(0, 10),
  timezone: "Europe/Ljubljana",
  language: "English",
  orgRole: "Super Admin",
  expertise: [],
  interests: [],
  notifyEmail: true,
  notifyProduct: true,
  notifyWeekly: false,
  twoFactor: false,
};

function getStoredExt(): ExtendedProfile {
  try {
    const raw = localStorage.getItem(EXT_STORAGE_KEY);
    if (!raw) return defaultExt;
    return { ...defaultExt, ...JSON.parse(raw) };
  } catch {
    return defaultExt;
  }
}

const profileSchema = z.object({
  name: z.string().trim().nonempty().max(100),
  role: z.string().trim().max(100),
  email: z.string().trim().max(255).email().or(z.literal("")),
  company: z.string().trim().max(100),
  bio: z.string().trim().max(500),
  avatarUrl: z.string().trim().max(2_500_000),
});

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [ext, setExt] = useState<ExtendedProfile>(getStoredExt);
  const [editing, setEditing] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    document.title = `${profile.name} – Profile | VCG.AI`;
  }, [profile.name]);

  const initials = profile.name.split(" ").map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const handleSave = () => {
    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      toast({ title: "Invalid profile", description: result.error.issues[0]?.message ?? "Check inputs", variant: "destructive" });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    localStorage.setItem(EXT_STORAGE_KEY, JSON.stringify(ext));
    window.dispatchEvent(new Event("vcg-profile-updated"));
    toast({ title: "Profile updated" });
    setEditing(false);
  };

  const handleCancel = () => {
    setProfile(getStoredProfile());
    setExt(getStoredExt());
    setEditing(false);
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfile(p => ({ ...p, avatarUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const addTag = (key: "expertise" | "interests", val: string, clear: () => void) => {
    const v = val.trim();
    if (!v || v.length > 40) return;
    setExt(e => ({ ...e, [key]: Array.from(new Set([...(e[key] as string[]), v])) }));
    clear();
  };

  const removeTag = (key: "expertise" | "interests", val: string) => {
    setExt(e => ({ ...e, [key]: (e[key] as string[]).filter(x => x !== val) }));
  };

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-6">
      {/* Page header */}
      <div className="flex items-center justify-between pb-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCancel}>
                <XIcon className="w-3 h-3 mr-1" /> Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleSave}>
                <Check className="w-3 h-3 mr-1" /> Save changes
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(true)}>
                <Pencil className="w-3 h-3 mr-1" /> Edit Profile
              </Button>
              <Button size="sm" className="h-7 text-xs bg-foreground text-background hover:bg-foreground/90" onClick={() => setPwOpen(true)}>
                <KeyRound className="w-3 h-3 mr-1" /> Change Password
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Identity card */}
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">My Profile</h2>
      <Card className="p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_2.5fr] gap-6 items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="bg-muted text-foreground text-sm font-semibold">{initials || "U"}</AvatarFallback>
            </Avatar>
            {editing && (
              <label className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-sm hover:bg-primary/90">
                <Camera className="w-3 h-3" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </label>
            )}
          </div>

          {/* Identity */}
          <div className="min-w-0">
            {editing ? (
              <div className="space-y-2">
                <Input value={profile.name} maxLength={100} onChange={e => setProfile({ ...profile, name: e.target.value })} className="h-8 text-sm font-semibold" />
                <Input placeholder="Role" value={profile.role} maxLength={100} className="h-8 text-xs" onChange={e => setProfile({ ...profile, role: e.target.value })} />
                <Input placeholder="Company" value={profile.company} maxLength={100} className="h-8 text-xs" onChange={e => setProfile({ ...profile, company: e.target.value })} />
                <Select value={ext.orgRole} onValueChange={(v) => setExt({ ...ext, orgRole: v as ExtendedProfile["orgRole"] })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Organisation Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Organisation Admin">Organisation Admin</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <Badge
                  variant="secondary"
                  className={`text-[9px] uppercase tracking-wider font-medium px-1.5 py-0 whitespace-nowrap mb-1.5 ${
                    ext.orgRole === "Super Admin"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : ext.orgRole === "Organisation Admin"
                        ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                        : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {ext.orgRole}
                </Badge>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-semibold text-foreground leading-tight">{profile.name}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                  {profile.role && <span>{profile.role}</span>}
                  {profile.role && profile.company && <span className="opacity-50">·</span>}
                  {profile.company && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {profile.company}
                    </span>
                  )}
                  {ext.location && (
                    <>
                      <span className="opacity-50">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {ext.location}
                      </span>
                    </>
                  )}
                </div>
                {ext.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ext.expertise.slice(0, 6).map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px] uppercase tracking-wider font-normal">{t}</Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Position */}
          <div className="min-w-0 md:border-l md:border-border md:pl-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Position</div>
            <div className="divide-y divide-border">
              <Row icon={Briefcase} label="Job Title" value={ext.jobTitle} editing={editing} onChange={v => setExt({ ...ext, jobTitle: v })} placeholder="e.g. Product Manager" />
              <Row icon={Building2} label="Department" value={ext.department} editing={editing} onChange={v => setExt({ ...ext, department: v })} placeholder="e.g. Strategy" />
              <Row icon={Calendar} label="Joined" value={ext.joinedAt} editing={editing} onChange={v => setExt({ ...ext, joinedAt: v })} type="date" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: About + Contact */}
        <div className="lg:col-span-2 space-y-5">
          {/* Interests removed */}

          {/* Contact */}
          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Contact</h2>
            <div className="divide-y divide-border">
              <Row icon={Mail} label="Email" value={profile.email} editing={editing} onChange={v => setProfile({ ...profile, email: v })} type="email" />
              <Row icon={Phone} label="Phone" value={ext.phone} editing={editing} onChange={v => setExt({ ...ext, phone: v })} placeholder="+1 555 000 0000" />
              <Row icon={MapPin} label="Location" value={ext.location} editing={editing} onChange={v => setExt({ ...ext, location: v })} placeholder="City, Country" />
            </div>
          </Card>

          {/* About */}
          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">About</h2>
            {editing ? (
              <Textarea
                rows={4}
                maxLength={500}
                placeholder="Tell us about yourself..."
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="text-xs"
              />
            ) : (
              <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {profile.bio || <span className="text-muted-foreground italic">No bio added yet.</span>}
              </p>
            )}
          </Card>


        </div>

        {/* Right: Preferences */}
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Preferences</h2>
            <div className="divide-y divide-border">
              <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-32 shrink-0">
                  <Languages className="w-3.5 h-3.5" /> Language
                </div>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <Select value={ext.language} onValueChange={v => setExt({ ...ext, language: v })}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["English", "Slovenian", "German", "French", "Spanish", "Portuguese"].map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-xs text-foreground">{ext.language}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-32 shrink-0">
                  <Clock className="w-3.5 h-3.5" /> Timezone
                </div>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <Input value={ext.timezone} onChange={e => setExt({ ...ext, timezone: e.target.value })} className="h-7 text-xs" />
                  ) : (
                    <div className="text-xs text-foreground">{ext.timezone}</div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Notifications
            </h2>
            <div className="space-y-3">
              <ToggleRow label="Email notifications" desc="Account & activity emails" checked={ext.notifyEmail} disabled={!editing} onChange={v => setExt({ ...ext, notifyEmail: v })} />
              <ToggleRow label="Product updates" desc="New features & releases" checked={ext.notifyProduct} disabled={!editing} onChange={v => setExt({ ...ext, notifyProduct: v })} />
              <ToggleRow label="Weekly digest" desc="Summary every Monday" checked={ext.notifyWeekly} disabled={!editing} onChange={v => setExt({ ...ext, notifyWeekly: v })} />
            </div>
          </Card>
        </div>
      </div>

      <PasswordChangeDialog open={pwOpen} onOpenChange={setPwOpen} email={profile.email} />
    </div>
  );
}

function Row({
  icon: Icon, label, value, editing, onChange, type = "text", placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; editing: boolean;
  onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-32 shrink-0">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <Input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="h-7 text-xs" />
        ) : (
          <div className="text-xs text-foreground break-words">{value || <span className="text-muted-foreground">—</span>}</div>
        )}
      </div>
    </div>
  );
}

function TagList({ tags, editing, onRemove }: { tags: string[]; editing: boolean; onRemove: (t: string) => void }) {
  if (!tags.length) return <div className="text-xs text-muted-foreground italic">None added yet.</div>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(t => (
        <Badge key={t} variant="secondary" className="text-xs gap-1">
          {t}
          {editing && (
            <button onClick={() => onRemove(t)} className="ml-1 hover:text-destructive" aria-label={`Remove ${t}`}>
              <XIcon className="w-3 h-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
}

function ToggleRow({ label, desc, checked, disabled, onChange }: { label: string; desc: string; checked: boolean; disabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}

function PasswordChangeDialog({ open, onOpenChange, email }: { open: boolean; onOpenChange: (v: boolean) => void; email: string }) {
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwFocused, setPwFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = [
    { label: "At least 8 characters", ok: pw.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(pw) },
    { label: "One lowercase letter", ok: /[a-z]/.test(pw) },
    { label: "One number", ok: /\d/.test(pw) },
    { label: "One special character", ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  const allOk = checks.every(c => c.ok);

  const reset = () => {
    setCurrent("");
    setPw("");
    setConfirm("");
    setPwFocused(false);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const submit = async () => {
    if (!current) {
      toast({ title: "Current password required", variant: "destructive" });
      return;
    }
    if (!allOk) {
      toast({ title: "Password does not meet requirements", variant: "destructive" });
      return;
    }
    if (pw !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (signInError) {
      setLoading(false);
      toast({ title: "Current password is incorrect", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) {
      toast({ title: "Could not update password", description: error.message, variant: "destructive" });
      return;
    }
    reset();
    onOpenChange(false);
    toast({ title: "Password updated" });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Change Password</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="cur-pw" className="text-xs text-muted-foreground">Current password</Label>
            <Input id="cur-pw" type="password" value={current} onChange={e => setCurrent(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pw" className="text-xs text-muted-foreground">New password</Label>
            <Input
              id="new-pw"
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              className="h-8 text-xs"
              placeholder="Choose a strong password"
            />
            {(pwFocused || pw.length > 0) && (
              <ul className="mt-1.5 space-y-1">
                {checks.map(c => (
                  <li key={c.label} className="flex items-center gap-1.5 text-[11px]">
                    {c.ok ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <XIcon className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw" className="text-xs text-muted-foreground">Confirm new password</Label>
            <Input id="confirm-pw" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="h-8 text-xs" />
            {confirm.length > 0 && confirm !== pw && (
              <p className="text-[11px] text-destructive">Passwords do not match</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button
            size="sm"
            className="h-7 text-xs bg-foreground text-background hover:bg-foreground/90"
            onClick={submit}
            disabled={loading || !current || !allOk || pw !== confirm}
          >
            {loading ? "Updating…" : "Update password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
