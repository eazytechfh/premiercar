import { createClient } from "@/utils/supabase/client"

export interface LeadTag {
  id: number
  id_empresa: number
  nome: string
  created_at: string
  updated_at: string
}

interface LeadTagAssignment {
  id: number
  lead_id: number
  tag_id: number
  id_empresa: number
  created_at: string
}

type LeadTagsMap = Record<number, LeadTag[]>

function getTagStorageKey(idEmpresa: number) {
  return `premiercar:lead-tags:${idEmpresa}`
}

function getAssignmentStorageKey(idEmpresa: number) {
  return `premiercar:lead-tag-assignments:${idEmpresa}`
}

function readLocalTags(idEmpresa: number): LeadTag[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(getTagStorageKey(idEmpresa))
    return stored ? (JSON.parse(stored) as LeadTag[]) : []
  } catch (error) {
    console.error("Erro ao ler etiquetas locais:", error)
    return []
  }
}

function writeLocalTags(idEmpresa: number, tags: LeadTag[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(getTagStorageKey(idEmpresa), JSON.stringify(tags))
}

function readLocalAssignments(idEmpresa: number): LeadTagAssignment[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(getAssignmentStorageKey(idEmpresa))
    return stored ? (JSON.parse(stored) as LeadTagAssignment[]) : []
  } catch (error) {
    console.error("Erro ao ler associações de etiquetas locais:", error)
    return []
  }
}

function writeLocalAssignments(idEmpresa: number, assignments: LeadTagAssignment[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(getAssignmentStorageKey(idEmpresa), JSON.stringify(assignments))
}

function shouldUseLocalFallback(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  return message.includes("does not exist") || message.includes("relation") || message.includes("schema cache")
}

function normalizeTagName(nome: string) {
  return nome.trim().replace(/\s+/g, " ")
}

function buildLeadTagsMap(tags: LeadTag[], assignments: LeadTagAssignment[]): LeadTagsMap {
  const tagById = new Map<number, LeadTag>(tags.map((tag) => [tag.id, tag]))

  return assignments.reduce<LeadTagsMap>((acc, assignment) => {
    const tag = tagById.get(assignment.tag_id)
    if (!tag) return acc

    acc[assignment.lead_id] = [...(acc[assignment.lead_id] || []), tag]
    return acc
  }, {})
}

async function getRemoteTags(idEmpresa: number): Promise<LeadTag[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("lead_tags")
    .select("*")
    .eq("id_empresa", idEmpresa)
    .order("nome", { ascending: true })

  if (error) {
    throw error
  }

  return (data as LeadTag[]) || []
}

async function getRemoteAssignments(idEmpresa: number): Promise<LeadTagAssignment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("lead_tag_assignments")
    .select("*")
    .eq("id_empresa", idEmpresa)

  if (error) {
    throw error
  }

  return (data as LeadTagAssignment[]) || []
}

export async function getLeadTags(idEmpresa: number): Promise<LeadTag[]> {
  try {
    return await getRemoteTags(idEmpresa)
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      console.error("Erro ao buscar etiquetas:", error)
    }
    return readLocalTags(idEmpresa)
  }
}

export async function getLeadTagsMap(idEmpresa: number): Promise<LeadTagsMap> {
  try {
    const [tags, assignments] = await Promise.all([getRemoteTags(idEmpresa), getRemoteAssignments(idEmpresa)])
    return buildLeadTagsMap(tags, assignments)
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      console.error("Erro ao buscar mapa de etiquetas:", error)
    }

    return buildLeadTagsMap(readLocalTags(idEmpresa), readLocalAssignments(idEmpresa))
  }
}

export async function createLeadTag(idEmpresa: number, nome: string): Promise<LeadTag | null> {
  const normalizedName = normalizeTagName(nome)
  if (!normalizedName) return null

  try {
    const existing = await getLeadTags(idEmpresa)
    if (existing.some((tag) => tag.nome.toLowerCase() === normalizedName.toLowerCase())) {
      return existing.find((tag) => tag.nome.toLowerCase() === normalizedName.toLowerCase()) || null
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from("lead_tags")
      .insert({
        id_empresa: idEmpresa,
        nome: normalizedName,
      })
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data as LeadTag
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      console.error("Erro ao criar etiqueta:", error)
    }

    const currentTags = readLocalTags(idEmpresa)
    const duplicatedTag = currentTags.find((tag) => tag.nome.toLowerCase() === normalizedName.toLowerCase())
    if (duplicatedTag) return duplicatedTag

    const now = new Date().toISOString()
    const tag: LeadTag = {
      id: Date.now(),
      id_empresa: idEmpresa,
      nome: normalizedName,
      created_at: now,
      updated_at: now,
    }

    writeLocalTags(idEmpresa, [...currentTags, tag].sort((a, b) => a.nome.localeCompare(b.nome)))
    return tag
  }
}

export async function updateLeadTag(tagId: number, idEmpresa: number, nome: string): Promise<boolean> {
  const normalizedName = normalizeTagName(nome)
  if (!normalizedName) return false

  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("lead_tags")
      .update({
        nome: normalizedName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tagId)
      .eq("id_empresa", idEmpresa)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      console.error("Erro ao editar etiqueta:", error)
    }

    const tags = readLocalTags(idEmpresa).map((tag) =>
      tag.id === tagId ? { ...tag, nome: normalizedName, updated_at: new Date().toISOString() } : tag,
    )
    writeLocalTags(idEmpresa, tags.sort((a, b) => a.nome.localeCompare(b.nome)))
    return true
  }
}

export async function deleteLeadTag(tagId: number, idEmpresa: number): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error: assignmentError } = await supabase
      .from("lead_tag_assignments")
      .delete()
      .eq("tag_id", tagId)
      .eq("id_empresa", idEmpresa)

    if (assignmentError) {
      throw assignmentError
    }

    const { error } = await supabase.from("lead_tags").delete().eq("id", tagId).eq("id_empresa", idEmpresa)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      console.error("Erro ao excluir etiqueta:", error)
    }

    writeLocalTags(
      idEmpresa,
      readLocalTags(idEmpresa).filter((tag) => tag.id !== tagId),
    )
    writeLocalAssignments(
      idEmpresa,
      readLocalAssignments(idEmpresa).filter((assignment) => assignment.tag_id !== tagId),
    )
    return true
  }
}

export async function assignTagToLead(leadId: number, tag: LeadTag): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: existing, error: existingError } = await supabase
      .from("lead_tag_assignments")
      .select("id")
      .eq("lead_id", leadId)
      .eq("tag_id", tag.id)
      .eq("id_empresa", tag.id_empresa)
      .maybeSingle()

    if (existingError) {
      throw existingError
    }

    if (existing) return true

    const { error } = await supabase.from("lead_tag_assignments").insert({
      lead_id: leadId,
      tag_id: tag.id,
      id_empresa: tag.id_empresa,
    })

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      console.error("Erro ao vincular etiqueta ao lead:", error)
    }

    const assignments = readLocalAssignments(tag.id_empresa)
    const exists = assignments.some((assignment) => assignment.lead_id === leadId && assignment.tag_id === tag.id)
    if (exists) return true

    writeLocalAssignments(tag.id_empresa, [
      ...assignments,
      {
        id: Date.now(),
        lead_id: leadId,
        tag_id: tag.id,
        id_empresa: tag.id_empresa,
        created_at: new Date().toISOString(),
      },
    ])
    return true
  }
}

export async function removeTagFromLead(leadId: number, tag: LeadTag): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("lead_tag_assignments")
      .delete()
      .eq("lead_id", leadId)
      .eq("tag_id", tag.id)
      .eq("id_empresa", tag.id_empresa)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      console.error("Erro ao remover etiqueta do lead:", error)
    }

    writeLocalAssignments(
      tag.id_empresa,
      readLocalAssignments(tag.id_empresa).filter(
        (assignment) => !(assignment.lead_id === leadId && assignment.tag_id === tag.id),
      ),
    )
    return true
  }
}
