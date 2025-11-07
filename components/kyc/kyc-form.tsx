"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload } from "lucide-react"

export function KYCForm({ profile }: { profile: any }) {
  const [documentType, setDocumentType] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!documentType || !file) {
      setError("Please select document type and file")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("documentType", documentType)
      formData.append("file", file)

      const response = await fetch("/api/compliance/kyc/submit", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      setSuccess(true)
      setFile(null)
      setDocumentType("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>Submit ID Document</CardTitle>
        <CardDescription>Upload a government-issued ID for verification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your documents are encrypted and stored securely. We never share your data with third parties.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="docType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="docType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="driver_license">Driver's License</SelectItem>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="proof_of_address">Proof of Address</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload Document</Label>
            <div
              onClick={() => document.getElementById("fileInput")?.click()}
              className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:bg-primary/5 transition"
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">{file ? file.name : "Click to upload or drag and drop"}</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, or JPG (max 10MB)</p>
            </div>
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Document submitted successfully! We'll review it within 24 hours.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !documentType || !file}>
            {isLoading ? "Uploading..." : "Submit Document"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
