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
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(true)}>
              <Pencil className="w-3 h-3 mr-1" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Identity card */}
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
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">User Profile</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-semibold text-foreground leading-tight">{profile.name}</h1>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] uppercase tracking-wider font-medium ${
                      ext.orgRole === "Super Admin"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : ext.orgRole === "Organisation Admin"
                          ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {ext.orgRole}
                  </Badge>
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

          {/* Bio */}
          <div className="min-w-0 md:border-l md:border-border md:pl-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">About</div>
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

          {/* Position */}
          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Position</h2>
            <div className="divide-y divide-border">
              <Row icon={Briefcase} label="Job Title" value={ext.jobTitle} editing={editing} onChange={v => setExt({ ...ext, jobTitle: v })} placeholder="e.g. Product Manager" />
              <Row icon={Building2} label="Department" value={ext.department} editing={editing} onChange={v => setExt({ ...ext, department: v })} placeholder="e.g. Strategy" />
              <Row icon={Calendar} label="Joined" value={ext.joinedAt} editing={editing} onChange={v => setExt({ ...ext, joinedAt: v })} type="date" />
            </div>
          </Card>


        </div>

        {/* Right: Preferences */}
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs flex items-center gap-1.5 mb-1.5"><Languages className="w-3.5 h-3.5" /> Language</Label>
                {editing ? (
                  <Select value={ext.language} onValueChange={v => setExt({ ...ext, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
              <div>
                <Label className="text-xs flex items-center gap-1.5 mb-1.5"><Clock className="w-3.5 h-3.5" /> Timezone</Label>
                {editing ? (
                  <Input value={ext.timezone} onChange={e => setExt({ ...ext, timezone: e.target.value })} />
                ) : (
                  <div className="text-xs text-foreground">{ext.timezone}</div>
                )}
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

          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Password
            </h2>
            <PasswordChange />
          </Card>
        </div>
      </div>
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

function PasswordChange() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (pw.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters", variant: "destructive" });
      return;
    }
    if (pw !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) {
      toast({ title: "Could not update password", description: error.message, variant: "destructive" });
      return;
    }
    setPw("");
    setConfirm("");
    toast({ title: "Password updated" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Label htmlFor="new-pw" className="text-xs text-muted-foreground w-32 shrink-0">New password</Label>
        <Input id="new-pw" type="password" value={pw} onChange={e => setPw(e.target.value)} className="h-7 text-xs flex-1" placeholder="At least 8 characters" />
      </div>
      <div className="flex items-center gap-3">
        <Label htmlFor="confirm-pw" className="text-xs text-muted-foreground w-32 shrink-0">Confirm password</Label>
        <Input id="confirm-pw" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="h-7 text-xs flex-1" placeholder="Repeat new password" />
      </div>
      <div className="flex justify-end">
        <Button size="sm" className="h-7 text-xs" onClick={submit} disabled={loading || !pw || !confirm}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </div>
    </div>
  );
}
