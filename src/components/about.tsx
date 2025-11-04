import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Briefcase, GraduationCap, Code, Loader2, Edit2, Check, X, Plus, Trash2 } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useUser } from "@clerk/clerk-react"
import mammoth from "mammoth"

interface Experience {
  company: string
  title: string
  dates: string
  location?: string
  description: string[]
}

interface ResumeData {
  name?: string
  title?: string
  contact?: {
    email?: string
    phone?: string
    portfolio?: string
  }
  experience: Experience[]
  skills: string[]
  education: {
    degree?: string
    institution?: string
    dates?: string
  }[]
  languages?: string[]
}

const AUTHORIZED_USER_ID = "user_2yeq7o5pXddjNeLFDpoz5tTwkWS"

export function About() {
  const { user } = useUser()
  const isAuthorized = user?.id === AUTHORIZED_USER_ID
  
  const resumeDataFromDB = useQuery(api.queries.getResumeData)
  const updateResumeData = useMutation(api.mutations.updateResumeData)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<any>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convert DB data to local format
  const resumeData: ResumeData | null = resumeDataFromDB ? {
    name: resumeDataFromDB.name,
    title: resumeDataFromDB.title,
    contact: resumeDataFromDB.contact,
    experience: resumeDataFromDB.experience || [],
    skills: resumeDataFromDB.skills || [],
    education: resumeDataFromDB.education || [],
    languages: resumeDataFromDB.languages || [],
  } : null

  const parseResume = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      const text = result.value

      // Parse the resume text
      const parsed = parseResumeText(text)
      
      // Save to Convex
      await updateResumeData(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse resume")
      console.error("Error parsing resume:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const parseResumeText = (text: string): ResumeData => {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0)
    
    const data: ResumeData = {
      experience: [],
      skills: [],
      education: [],
      languages: []
    }

    let currentSection = ""
    let currentExperience: Experience | null = null
    let currentEducation: { degree?: string; institution?: string; dates?: string } | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const upperLine = line.toUpperCase()

      // Detect section headers
      if (upperLine.includes("EXPERIENCE") || upperLine.includes("WORK")) {
        currentSection = "experience"
        continue
      } else if (upperLine.includes("SKILLS") || upperLine.includes("TECHNICAL SKILLS")) {
        currentSection = "skills"
        continue
      } else if (upperLine.includes("EDUCATION")) {
        currentSection = "education"
        continue
      } else if (upperLine.includes("LANGUAGES")) {
        currentSection = "languages"
        continue
      }

      // Parse name and title
      if (!data.name && line.length > 0 && i < 5) {
        const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)
        if (nameMatch) {
          data.name = nameMatch[1]
          continue
        }
      }

      if (!data.title && line.length > 0 && i < 10 && !currentSection) {
        if (line.toLowerCase().includes("developer") || line.toLowerCase().includes("engineer") || 
            line.toLowerCase().includes("analyst") || line.toLowerCase().includes("software")) {
          data.title = line
          continue
        }
      }

      // Parse experience section
      if (currentSection === "experience") {
        if (upperLine.includes("EXPERIENCE") || upperLine.includes("WORK")) {
          continue
        }

        let companyTitleMatch = line.match(/^(.+?)\s*[—–-]\s*(.+)$/)
        if (!companyTitleMatch) {
          companyTitleMatch = line.match(/^(.+?)\s*-\s*(.+)$/)
        }
        if (companyTitleMatch) {
          if (currentExperience && (currentExperience.description.length > 0 || currentExperience.dates || currentExperience.title)) {
            data.experience.push(currentExperience)
          }
          
          const companyPart = companyTitleMatch[1].trim()
          const titlePart = companyTitleMatch[2].trim()
          const locationMatch = companyPart.match(/^(.+?),\s*(.+)$/)
          
          currentExperience = {
            company: locationMatch ? locationMatch[1].trim() : companyPart,
            title: titlePart,
            dates: "",
            location: locationMatch ? locationMatch[2].trim() : undefined,
            description: []
          }
          continue
        }

        let dateMatch = line.match(/(\w+\s+\d{4}|[A-Z][a-z]+\s+\d{4})\s*[—–-]\s*(Present|\w+\s+\d{4}|[A-Z][a-z]+\s+\d{4})/i)
        if (!dateMatch) {
          dateMatch = line.match(/(\w+\s+\d{4})\s*-\s*(Present|\w+\s+\d{4})/i)
        }
        if (dateMatch && currentExperience) {
          currentExperience.dates = `${dateMatch[1]} – ${dateMatch[2]}`
          continue
        }

        if (line.match(/^[A-Z][^—]+[—–-]/) || upperLine.includes("SKILLS") || upperLine.includes("EDUCATION") || upperLine.includes("LANGUAGES")) {
          continue
        }

        const isBulletPoint = line.match(/^[•\-\*●◦]\s*/) || line.match(/^\d+\.\s+/) || line.match(/^[a-z]\)\s+/)
        const isLikelyDescription = currentExperience && 
                                    currentExperience.dates && 
                                    line.length > 15 && 
                                    !line.match(/^[A-Z][a-z]+,\s+[A-Z]/) &&
                                    !line.match(/^\w+\s+\d{4}/) &&
                                    !upperLine.includes("EXPERIENCE") &&
                                    !upperLine.includes("SKILLS") &&
                                    !upperLine.includes("EDUCATION") &&
                                    !upperLine.includes("LANGUAGES") &&
                                    !line.match(/^[A-Z][^a-z]*$/)
        
        if (isBulletPoint || isLikelyDescription) {
          const description = line
            .replace(/^[•\-\*●◦]\s*/, "")
            .replace(/^\d+\.\s+/, "")
            .replace(/^[a-z]\)\s+/, "")
            .trim()
          if (description && currentExperience && description.length > 10) {
            currentExperience.description.push(description)
          }
        }
      }

      // Parse skills section
      if (currentSection === "skills") {
        if (upperLine.includes("SKILLS") || upperLine.includes("LANGUAGES") || upperLine.includes("EDUCATION") || upperLine.includes("EXPERIENCE")) {
          continue
        }

        let skillLine = line
        const categoryMatch = line.match(/^[^:]+:\s*(.+)$/)
        if (categoryMatch) {
          skillLine = categoryMatch[1]
        }

        const skills = skillLine
          .split(",")
          .map(s => s.trim())
          .filter(s => s.length > 0 && s.length < 100 && !upperLine.includes("SKILLS") && !upperLine.includes("LANGUAGES"))
        
        if (skills.length > 0) {
          data.skills.push(...skills)
        }
      }

      // Parse education section
      if (currentSection === "education") {
        if (line.toLowerCase().includes("degree") || line.toLowerCase().includes("associate") || 
            line.toLowerCase().includes("bachelor") || line.toLowerCase().includes("master") ||
            line.toLowerCase().includes("diploma") || line.toLowerCase().includes("certificate")) {
          if (currentEducation && (currentEducation.institution || currentEducation.degree)) {
            data.education.push(currentEducation)
          }
          currentEducation = { degree: line }
          continue
        }

        if (line.length > 0 && currentEducation && !currentEducation.institution) {
          if (!line.match(/^\d{4}/) && !line.match(/[—–-]/) && 
              !upperLine.includes("EDUCATION") && !upperLine.includes("EXPERIENCE") &&
              !upperLine.includes("SKILLS") && !upperLine.includes("LANGUAGES")) {
            currentEducation.institution = line
          }
        }

        const eduDateMatch = line.match(/(\d{4})/g)
        if (eduDateMatch && currentEducation && eduDateMatch.length <= 2) {
          currentEducation.dates = eduDateMatch.join(" – ")
        }
      }

      // Parse languages section
      if (currentSection === "languages") {
        const languages = line.split(",").map(l => l.trim()).filter(l => l.length > 0)
        data.languages = [...(data.languages || []), ...languages]
      }

      // Parse contact information
      if (i < 15) {
        const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
        if (emailMatch) {
          if (!data.contact) data.contact = {}
          data.contact.email = emailMatch[1]
        }

        const phoneMatch = line.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/)
        if (phoneMatch) {
          if (!data.contact) data.contact = {}
          data.contact.phone = phoneMatch[1]
        }

        const urlMatch = line.match(/(https?:\/\/[^\s]+)/)
        if (urlMatch) {
          if (!data.contact) data.contact = {}
          data.contact.portfolio = urlMatch[1]
        }
      }
    }

    if (currentExperience && (currentExperience.description.length > 0 || currentExperience.dates || currentExperience.title)) {
      data.experience.push(currentExperience)
    }
    if (currentEducation && (currentEducation.institution || currentEducation.degree)) {
      data.education.push(currentEducation)
    }

    data.skills = [...new Set(data.skills.filter(s => s.length > 0))]

    return data
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
          file.name.endsWith(".docx")) {
        parseResume(file)
      } else {
        setError("Please upload a .docx file")
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSaveField = async (field: string, value: any) => {
    try {
      await updateResumeData({ [field]: value })
      setEditingField(null)
    } catch (err) {
      console.error("Error saving field:", err)
      setError("Failed to save changes")
    }
  }

  const handleAddExperience = async () => {
    const newExp: Experience = {
      company: "",
      title: "",
      dates: "",
      description: []
    }
    const updated = [...(resumeData?.experience || []), newExp]
    await updateResumeData({ experience: updated })
  }

  const handleUpdateExperience = async (index: number, updates: Partial<Experience>) => {
    if (!resumeData) return
    const updated = [...resumeData.experience]
    updated[index] = { ...updated[index], ...updates }
    await updateResumeData({ experience: updated })
  }

  const handleDeleteExperience = async (index: number) => {
    if (!resumeData) return
    const updated = resumeData.experience.filter((_, i) => i !== index)
    await updateResumeData({ experience: updated })
  }

  const handleAddSkill = async () => {
    const newSkill = ""
    setEditingField(`skill-new`)
    setTempValues({ [`skill-new`]: newSkill })
  }

  const handleSaveSkill = async (index: number | "new", value: string) => {
    if (!resumeData) return
    const updated = [...resumeData.skills]
    if (index === "new") {
      if (value.trim()) {
        updated.push(value.trim())
      }
    } else {
      if (value.trim()) {
        updated[index] = value.trim()
      } else {
        updated.splice(index, 1)
      }
    }
    await updateResumeData({ skills: updated.filter(s => s.trim().length > 0) })
    setEditingField(null)
  }

  const handleSaveMultipleSkills = async (skills: string[]) => {
    if (!resumeData) return
    const updated = [...resumeData.skills, ...skills]
    // Remove duplicates
    const unique = [...new Set(updated.filter(s => s.trim().length > 0))]
    await updateResumeData({ skills: unique })
    setEditingField(null)
  }

  const handleAddEducation = async () => {
    const newEdu = { degree: "", institution: "" }
    const updated = [...(resumeData?.education || []), newEdu]
    await updateResumeData({ education: updated })
  }

  const handleUpdateEducation = async (index: number, updates: Partial<{ degree?: string; institution?: string; dates?: string }>) => {
    if (!resumeData) return
    const updated = [...resumeData.education]
    updated[index] = { ...updated[index], ...updates }
    await updateResumeData({ education: updated })
  }

  const handleDeleteEducation = async (index: number) => {
    if (!resumeData) return
    const updated = resumeData.education.filter((_, i) => i !== index)
    await updateResumeData({ education: updated })
  }

  const handleAddLanguage = async () => {
    const updated = [...(resumeData?.languages || []), ""]
    await updateResumeData({ languages: updated })
  }

  const handleUpdateLanguage = async (index: number, value: string) => {
    if (!resumeData) return
    const updated = [...(resumeData.languages || [])]
    if (value.trim()) {
      updated[index] = value.trim()
    } else {
      updated.splice(index, 1)
    }
    await updateResumeData({ languages: updated.filter(l => l.trim().length > 0) })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">About</h2>

        {!resumeData && !isLoading && (
          <Card className="p-8 border-dashed border-2">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <Label htmlFor="resume-upload" className="text-lg font-medium cursor-pointer">
                  Upload Your Resume
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a .docx file to display your professional experience
                </p>
              </div>
              <Input
                ref={fileInputRef}
                id="resume-upload"
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button onClick={handleUploadClick} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {resumeData && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              {editingField === "name" && isAuthorized ? (
                <div className="mb-4">
                  <Input
                    value={tempValues.name || resumeData.name || ""}
                    onChange={(e) => setTempValues({ ...tempValues, name: e.target.value })}
                    className="text-4xl font-bold text-center"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-center mt-2">
                    <Button size="sm" onClick={() => handleSaveField("name", tempValues.name)}>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  {resumeData.name && (
                    <h1 className="text-4xl font-bold mb-2">{resumeData.name}</h1>
                  )}
                  {isAuthorized && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setEditingField("name")
                        setTempValues({ ...tempValues, name: resumeData.name || "" })
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {editingField === "title" && isAuthorized ? (
                <div className="mb-4">
                  <Input
                    value={tempValues.title || resumeData.title || ""}
                    onChange={(e) => setTempValues({ ...tempValues, title: e.target.value })}
                    className="text-xl text-center"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-center mt-2">
                    <Button size="sm" onClick={() => handleSaveField("title", tempValues.title)}>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                resumeData.title && (
                  <div className="relative group">
                    <p className="text-xl text-muted-foreground">{resumeData.title}</p>
                    {isAuthorized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setEditingField("title")
                          setTempValues({ ...tempValues, title: resumeData.title || "" })
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              )}

              {resumeData.contact && (
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                  {resumeData.contact.email && (
                    <a href={`mailto:${resumeData.contact.email}`} className="hover:text-foreground">
                      {resumeData.contact.email}
                    </a>
                  )}
                  {resumeData.contact.phone && <span>{resumeData.contact.phone}</span>}
                  {resumeData.contact.portfolio && (
                    <a 
                      href={resumeData.contact.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-foreground"
                    >
                      {resumeData.contact.portfolio}
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content - Experience */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <Briefcase className="h-6 w-6" />
                    Experience
                  </h3>
                  {isAuthorized && (
                    <Button size="sm" variant="outline" onClick={handleAddExperience}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  )}
                </div>
                <div className="space-y-6">
                  {resumeData.experience.map((exp, idx) => (
                    <EditableExperienceCard
                      key={idx}
                      experience={exp}
                      isAuthorized={isAuthorized}
                      onUpdate={(updates) => handleUpdateExperience(idx, updates)}
                      onDelete={() => handleDeleteExperience(idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Sidebar - Skills, Education, Languages */}
              <div className="space-y-6">
                {/* Skills */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Skills
                  </h3>
                  {isAuthorized && (
                    <Button size="sm" variant="outline" onClick={handleAddSkill}>
                      <Plus className="h-4 w-4 mr-1" />
                    </Button>
                  )}
                </div>
                <Card className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, idx) => (
                      <EditableSkillTag
                        key={idx}
                        skill={skill}
                        isAuthorized={isAuthorized}
                        onSave={(value) => handleSaveSkill(idx, value)}
                        onSaveMultiple={handleSaveMultipleSkills}
                      />
                    ))}
                    {editingField === "skill-new" && isAuthorized && (
                      <EditableSkillTag
                        skill=""
                        isAuthorized={true}
                        onSave={(value) => handleSaveSkill("new", value)}
                        onSaveMultiple={handleSaveMultipleSkills}
                        onCancel={() => setEditingField(null)}
                      />
                    )}
                  </div>
                  {isAuthorized && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        💡 Tip: Paste a comma-separated list (e.g., "React, TypeScript, Node.js") to add multiple skills at once
                      </p>
                    </div>
                  )}
                </Card>

                {/* Education */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </h3>
                  {isAuthorized && (
                    <Button size="sm" variant="outline" onClick={handleAddEducation}>
                      <Plus className="h-4 w-4 mr-1" />
                    </Button>
                  )}
                </div>
                <Card className="p-6">
                  <div className="space-y-3">
                    {resumeData.education.map((edu, idx) => (
                      <EditableEducationItem
                        key={idx}
                        education={edu}
                        isAuthorized={isAuthorized}
                        onUpdate={(updates) => handleUpdateEducation(idx, updates)}
                        onDelete={() => handleDeleteEducation(idx)}
                      />
                    ))}
                  </div>
                </Card>

                {/* Languages */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold mb-4">Languages</h3>
                  {isAuthorized && (
                    <Button size="sm" variant="outline" onClick={handleAddLanguage}>
                      <Plus className="h-4 w-4 mr-1" />
                    </Button>
                  )}
                </div>
                <Card className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {resumeData.languages?.map((lang, idx) => (
                      <EditableLanguageTag
                        key={idx}
                        language={lang}
                        isAuthorized={isAuthorized}
                        onSave={(value) => handleUpdateLanguage(idx, value)}
                      />
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Upload New Resume Button */}
            {isAuthorized && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={handleUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Different Resume
                </Button>
              </div>
            )}
          </div>
        )}
        
        <Input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
  )
}

// Editable Experience Card Component
function EditableExperienceCard({ 
  experience, 
  isAuthorized, 
  onUpdate, 
  onDelete 
}: { 
  experience: Experience
  isAuthorized: boolean
  onUpdate: (updates: Partial<Experience>) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<Partial<Experience>>({})
  const [editingDescIdx, setEditingDescIdx] = useState<number | null>(null)

  const handleAddDescription = async () => {
    const updated = [...experience.description, ""]
    await onUpdate({ description: updated })
    setEditingDescIdx(updated.length - 1)
  }

  const handleUpdateDescription = async (index: number, value: string) => {
    const updated = [...experience.description]
    if (value.trim()) {
      updated[index] = value.trim()
    } else {
      updated.splice(index, 1)
    }
    await onUpdate({ description: updated })
    setEditingDescIdx(null)
  }

  return (
    <Card className="p-6">
      <div className="mb-3">
        {editing === "title" && isAuthorized ? (
          <Input
            value={tempValues.title ?? experience.title}
            onChange={(e) => setTempValues({ ...tempValues, title: e.target.value })}
            onBlur={async () => {
              await onUpdate({ title: tempValues.title })
              setEditing(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdate({ title: tempValues.title }).then(() => setEditing(null))
              }
            }}
            autoFocus
            className="font-semibold text-lg mb-2"
          />
        ) : (
          <div className="relative group">
            <h4 className="font-semibold text-lg">{experience.title || "Untitled"}</h4>
            {isAuthorized && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setEditing("title")
                  setTempValues({ title: experience.title })
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {editing === "company" && isAuthorized ? (
            <Input
              value={tempValues.company ?? experience.company}
              onChange={(e) => setTempValues({ ...tempValues, company: e.target.value })}
              onBlur={async () => {
                await onUpdate({ company: tempValues.company })
                setEditing(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdate({ company: tempValues.company }).then(() => setEditing(null))
                }
              }}
              autoFocus
              className="text-sm"
            />
          ) : (
            <div className="relative group">
              <span className="font-medium">{experience.company || "Company"}</span>
              {isAuthorized && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                  onClick={() => {
                    setEditing("company")
                    setTempValues({ company: experience.company })
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          
          {experience.location && (
            <>
              <span>•</span>
              {editing === "location" && isAuthorized ? (
                <Input
                  value={tempValues.location ?? experience.location}
                  onChange={(e) => setTempValues({ ...tempValues, location: e.target.value })}
                  onBlur={async () => {
                    await onUpdate({ location: tempValues.location })
                    setEditing(null)
                  }}
                  autoFocus
                  className="text-sm w-24"
                />
              ) : (
                <span>{experience.location}</span>
              )}
            </>
          )}
          
          {experience.dates && (
            <>
              <span>•</span>
              {editing === "dates" && isAuthorized ? (
                <Input
                  value={tempValues.dates ?? experience.dates}
                  onChange={(e) => setTempValues({ ...tempValues, dates: e.target.value })}
                  onBlur={async () => {
                    await onUpdate({ dates: tempValues.dates })
                    setEditing(null)
                  }}
                  autoFocus
                  className="text-sm w-32"
                />
              ) : (
                <span>{experience.dates}</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Description</span>
          {isAuthorized && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddDescription}
              className="h-6 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          )}
        </div>
        
        {experience.description.length > 0 ? (
          <ul className="space-y-2">
            {experience.description.map((desc, descIdx) => (
              <li key={descIdx} className="flex items-start gap-2 group">
                <span className="text-primary mt-1.5">•</span>
                {editingDescIdx === descIdx && isAuthorized ? (
                  <Textarea
                    value={desc}
                    onChange={(e) => {
                      const updated = [...experience.description]
                      updated[descIdx] = e.target.value
                      onUpdate({ description: updated })
                    }}
                    onBlur={() => {
                      if (desc.trim()) {
                        handleUpdateDescription(descIdx, desc)
                      } else {
                        handleUpdateDescription(descIdx, "")
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleUpdateDescription(descIdx, desc)
                      } else if (e.key === "Escape") {
                        setEditingDescIdx(null)
                      }
                    }}
                    autoFocus
                    className="text-sm flex-1 min-h-[60px]"
                    rows={2}
                  />
                ) : (
                  <div className="flex-1 relative group/desc">
                    <span className="text-sm">{desc || "Empty description"}</span>
                    {isAuthorized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 opacity-0 group-hover/desc:opacity-100 transition-opacity h-4 w-4 p-0"
                        onClick={() => setEditingDescIdx(descIdx)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
                {isAuthorized && editingDescIdx !== descIdx && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await handleUpdateDescription(descIdx, "")
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-4 w-4 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          isAuthorized && (
            <p className="text-sm text-muted-foreground italic">No description yet. Click "Add" to add one.</p>
          )
        )}
      </div>

      {isAuthorized && (
        <div className="flex justify-end mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  )
}

// Editable Skill Tag Component
function EditableSkillTag({ 
  skill, 
  isAuthorized, 
  onSave, 
  onCancel,
  onSaveMultiple
}: { 
  skill: string
  isAuthorized: boolean
  onSave: (value: string) => void
  onCancel?: () => void
  onSaveMultiple?: (values: string[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(skill)

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    
    // Check if the pasted text contains commas (likely a comma-separated list)
    if (pastedText.includes(',')) {
      const skills = pastedText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      if (skills.length > 1 && onSaveMultiple) {
        // If multiple skills detected, save them all
        onSaveMultiple(skills)
        setEditing(false)
        return
      } else if (skills.length === 1) {
        // Single skill after splitting
        setValue(skills[0])
        return
      }
    }
    
    // If no commas or single value, just paste normally
    const newValue = value + pastedText
    setValue(newValue)
  }

  if (editing && isAuthorized) {
    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPaste={handlePaste}
        onBlur={() => {
          // Check if value contains commas
          if (value.includes(',') && onSaveMultiple) {
            const skills = value
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0)
            if (skills.length > 1) {
              onSaveMultiple(skills)
            } else if (skills.length === 1) {
              onSave(skills[0])
            }
          } else {
            onSave(value)
          }
          setEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // Check if value contains commas
            if (value.includes(',') && onSaveMultiple) {
              const skills = value
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)
              if (skills.length > 1) {
                onSaveMultiple(skills)
                setEditing(false)
                return
              }
            }
            onSave(value)
            setEditing(false)
          } else if (e.key === "Escape") {
            setValue(skill)
            setEditing(false)
            onCancel?.()
          }
        }}
        autoFocus
        className="text-xs px-3 py-1.5 h-auto"
        placeholder="Enter skill(s) or paste comma-separated list"
      />
    )
  }

  return (
    <div className="relative group">
      <span className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-foreground border border-primary/20">
        {skill || "New skill"}
      </span>
      {isAuthorized && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0"
          onClick={() => setEditing(true)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// Editable Education Item Component
function EditableEducationItem({ 
  education, 
  isAuthorized, 
  onUpdate, 
  onDelete 
}: { 
  education: { degree?: string; institution?: string; dates?: string }
  isAuthorized: boolean
  onUpdate: (updates: Partial<{ degree?: string; institution?: string; dates?: string }>) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<Partial<{ degree?: string; institution?: string; dates?: string }>>({})

  return (
    <div className="space-y-1">
      {editing === "degree" && isAuthorized ? (
        <Input
          value={tempValues.degree ?? education.degree ?? ""}
          onChange={(e) => setTempValues({ ...tempValues, degree: e.target.value })}
          onBlur={async () => {
            await onUpdate({ degree: tempValues.degree })
            setEditing(null)
          }}
          autoFocus
          className="font-medium text-sm"
        />
      ) : (
        education.degree && (
          <div className="relative group">
            <p className="font-medium text-sm">{education.degree}</p>
            {isAuthorized && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setEditing("degree")
                  setTempValues({ degree: education.degree })
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )
      )}
      
      {editing === "institution" && isAuthorized ? (
        <Input
          value={tempValues.institution ?? education.institution ?? ""}
          onChange={(e) => setTempValues({ ...tempValues, institution: e.target.value })}
          onBlur={async () => {
            await onUpdate({ institution: tempValues.institution })
            setEditing(null)
          }}
          autoFocus
          className="text-sm"
        />
      ) : (
        education.institution && (
          <div className="relative group">
            <p className="text-sm text-muted-foreground">{education.institution}</p>
            {isAuthorized && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setEditing("institution")
                  setTempValues({ institution: education.institution })
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )
      )}
      
      {education.dates && (
        <p className="text-xs text-muted-foreground">{education.dates}</p>
      )}

      {isAuthorized && (
        <div className="flex justify-end mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

// Editable Language Tag Component
function EditableLanguageTag({ 
  language, 
  isAuthorized, 
  onSave 
}: { 
  language: string
  isAuthorized: boolean
  onSave: (value: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(language)

  if (editing && isAuthorized) {
    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          onSave(value)
          setEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSave(value)
            setEditing(false)
          } else if (e.key === "Escape") {
            setValue(language)
            setEditing(false)
          }
        }}
        autoFocus
        className="text-sm px-3 py-1.5 h-auto"
      />
    )
  }

  return (
    <div className="relative group">
      <span className="text-sm px-3 py-1.5 rounded-md bg-muted text-muted-foreground">
        {language}
      </span>
      {isAuthorized && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0"
          onClick={() => setEditing(true)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
