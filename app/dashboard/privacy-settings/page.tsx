"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, Eye } from "lucide-react"

export default function PrivacySettingsPage() {
  const supabase = createClient()
  const [privacy, setPrivacy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadPrivacyPreferences()
  }, [])

  async function loadPrivacyPreferences() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("privacy_preferences").select("*").eq("user_id", user.id).single()

      if (data) setPrivacy(data)
      else {
        const { data: newPrefs } = await supabase
          .from("privacy_preferences")
          .insert({ user_id: user.id })
          .select()
          .single()
        if (newPrefs) setPrivacy(newPrefs)
      }
    } catch (error) {
      console.error("[v0] Error loading privacy preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function savePreferences() {
    setIsSaving(true)
    try {
      await supabase.from("privacy_preferences").update(privacy).eq("id", privacy.id)
    } catch (error) {
      console.error("[v0] Error saving preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Privacy Settings</h1>
        <p className="text-muted-foreground">
          Control your privacy features. No identity required—just pure encryption.
        </p>
      </div>

      <Alert className="border-teal-200 bg-teal-50">
        <Shield className="h-4 w-4 text-teal-600" />
        <AlertDescription className="text-teal-800">
          Zolana is 100% anonymous. Your transactions, sender, receiver, and amounts are completely hidden using Zcash's
          zk-SNARKs.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy Level
            </CardTitle>
            <CardDescription>Choose your anonymity level—all transactions are encrypted by default</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="privacy-level">Privacy Level</Label>
              <Select
                value={privacy?.privacy_level}
                onValueChange={(value) => setPrivacy({ ...privacy, privacy_level: value })}
              >
                <SelectTrigger id="privacy-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div>
                      <div className="font-medium">Standard Privacy</div>
                      <div className="text-xs text-muted-foreground">Basic Zcash shielding</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="enhanced">
                    <div>
                      <div className="font-medium">Enhanced Privacy</div>
                      <div className="text-xs text-muted-foreground">Additional coin mixing</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="maximum">
                    <div>
                      <div className="font-medium">Maximum Privacy</div>
                      <div className="text-xs text-muted-foreground">Full anonymity set with routing</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anonymity-set">Anonymity Set Size (Zcash participants)</Label>
              <Select
                value={privacy?.anonymity_set_size?.toString()}
                onValueChange={(value) => setPrivacy({ ...privacy, anonymity_set_size: Number.parseInt(value) })}
              >
                <SelectTrigger id="anonymity-set">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 participants (faster)</SelectItem>
                  <SelectItem value="16">16 participants (recommended)</SelectItem>
                  <SelectItem value="32">32 participants (maximum)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Advanced Privacy Features
            </CardTitle>
            <CardDescription>Optional enhancements to your anonymity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mixing-toggle" className="text-base font-medium">
                  Automatic Coin Mixing
                </Label>
                <p className="text-sm text-muted-foreground mt-1">Mix coins through multiple hops before settlement</p>
              </div>
              <Switch
                id="mixing-toggle"
                checked={privacy?.mixing_enabled}
                onCheckedChange={(value) => setPrivacy({ ...privacy, mixing_enabled: value })}
              />
            </div>

            <div className="border-t pt-4 space-y-2">
              <Label htmlFor="fade-time">Privacy Metadata Fade Time</Label>
              <Select
                value={privacy?.privacy_fade_time?.toString()}
                onValueChange={(value) => setPrivacy({ ...privacy, privacy_fade_time: Number.parseInt(value) })}
              >
                <SelectTrigger id="fade-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">2 days</SelectItem>
                  <SelectItem value="72">3 days (recommended)</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Metadata is permanently deleted after this period</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-900">100% Anonymous Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-emerald-900">
            <p className="text-sm">
              ✓ No identity verification required
              <br />✓ No document uploads
              <br />✓ No phone number needed
              <br />✓ All transactions shielded by default
              <br />✓ Metadata deleted automatically
            </p>
          </CardContent>
        </Card>

        <Button onClick={savePreferences} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Privacy Settings"}
        </Button>
      </div>
    </div>
  )
}
