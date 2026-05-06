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
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
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

      {/* Identity header (page-level, no card) */}
      <div className="flex items-start gap-4 mb-6">
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
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2 max-w-xl">
              <Input value={profile.name} maxLength={100} onChange={e => setProfile({ ...profile, name: e.target.value })} className="h-8 text-sm font-semibold" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Role" value={profile.role} maxLength={100} className="h-8 text-xs" onChange={e => setProfile({ ...profile, role: e.target.value })} />
                <Input placeholder="Company" value={profile.company} maxLength={100} className="h-8 text-xs" onChange={e => setProfile({ ...profile, company: e.target.value })} />
              </div>
            </div>
          ) : (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">User Profile</div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">{profile.name}</h1>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: About + Contact */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">About</h2>
            {editing ? (
              <Textarea
                rows={4}
                maxLength={500}
                placeholder="Tell us about yourself..."
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
              />
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {profile.bio || <span className="text-muted-foreground italic">No bio added yet.</span>}
              </p>
            )}

            <Separator className="my-5" />

            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Interests</h2>
            <TagList tags={ext.interests} editing={editing} onRemove={t => removeTag("interests", t)} />
            {editing && (
              <div className="flex gap-2 mt-3">
                <Input placeholder="Add interest..." value={interestInput} onChange={e => setInterestInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag("interests", interestInput, () => setInterestInput("")); } }} />
                <Button type="button" variant="outline" size="sm" onClick={() => addTag("interests", interestInput, () => setInterestInput(""))}>Add</Button>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Contact & Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Field icon={Mail} label="Email" value={profile.email} editing={editing} onChange={v => setProfile({ ...profile, email: v })} type="email" />
              <Field icon={Phone} label="Phone" value={ext.phone} editing={editing} onChange={v => setExt({ ...ext, phone: v })} />
              <Field icon={Briefcase} label="Job Title" value={ext.jobTitle} editing={editing} onChange={v => setExt({ ...ext, jobTitle: v })} />
              <Field icon={Building2} label="Department" value={ext.department} editing={editing} onChange={v => setExt({ ...ext, department: v })} />
              <Field icon={MapPin} label="Location" value={ext.location} editing={editing} onChange={v => setExt({ ...ext, location: v })} />
              <Field icon={Calendar} label="Joined" value={ext.joinedAt} editing={editing} onChange={v => setExt({ ...ext, joinedAt: v })} type="date" />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Field icon={Globe} label="Website" value={ext.website} editing={editing} onChange={v => setExt({ ...ext, website: v })} placeholder="https://" />
              <Field icon={Linkedin} label="LinkedIn" value={ext.linkedin} editing={editing} onChange={v => setExt({ ...ext, linkedin: v })} placeholder="linkedin.com/in/..." />
              <Field icon={Twitter} label="Twitter / X" value={ext.twitter} editing={editing} onChange={v => setExt({ ...ext, twitter: v })} placeholder="@handle" />
              <Field icon={Github} label="GitHub" value={ext.github} editing={editing} onChange={v => setExt({ ...ext, github: v })} placeholder="github.com/..." />
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
                  <div className="text-sm text-foreground">{ext.language}</div>
                )}
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1.5 mb-1.5"><Clock className="w-3.5 h-3.5" /> Timezone</Label>
                {editing ? (
                  <Input value={ext.timezone} onChange={e => setExt({ ...ext, timezone: e.target.value })} />
                ) : (
                  <div className="text-sm text-foreground">{ext.timezone}</div>
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
              <Shield className="w-3.5 h-3.5" /> Security
            </h2>
            <ToggleRow label="Two-factor authentication" desc="Extra login security" checked={ext.twoFactor} disabled={!editing} onChange={v => setExt({ ...ext, twoFactor: v })} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, label, value, editing, onChange, type = "text", placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; editing: boolean;
  onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </Label>
      {editing ? (
        <Input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      ) : (
        <div className="text-sm text-foreground break-words">{value || <span className="text-muted-foreground">—</span>}</div>
      )}
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
        <div className="text-sm text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
