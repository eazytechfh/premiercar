"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createLeadTag, deleteLeadTag, getLeadTags, updateLeadTag, type LeadTag } from "@/lib/lead-tags"
import { Pencil, Tags, Trash2 } from "lucide-react"

interface LeadTagsSettingsCardProps {
  empresaId: number
}

export function LeadTagsSettingsCard({ empresaId }: LeadTagsSettingsCardProps) {
  const [tags, setTags] = useState<LeadTag[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [editingTagId, setEditingTagId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void loadTags()
  }, [empresaId])

  const loadTags = async () => {
    setLoading(true)
    setTags(await getLeadTags(empresaId))
    setLoading(false)
  }

  const handleCreate = async () => {
    const created = await createLeadTag(empresaId, newTagName)
    if (!created) return

    setNewTagName("")
    await loadTags()
  }

  const handleSaveEdit = async (tagId: number) => {
    const success = await updateLeadTag(tagId, empresaId, editingValue)
    if (!success) return

    setEditingTagId(null)
    setEditingValue("")
    await loadTags()
  }

  const handleDelete = async (tagId: number) => {
    const success = await deleteLeadTag(tagId, empresaId)
    if (!success) return
    await loadTags()
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Etiquetas dos Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            value={newTagName}
            onChange={(event) => setNewTagName(event.target.value)}
            placeholder="Criar nova etiqueta"
          />
          <Button onClick={() => void handleCreate()} disabled={!newTagName.trim()}>
            Criar etiqueta
          </Button>
        </div>

        <div className="rounded-lg border border-[#22C55E] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">Etiquetas salvas</span>
            <Badge>{tags.length}</Badge>
          </div>

          <ScrollArea className={`${tags.length > 5 ? "h-64" : "h-auto"} max-h-64 pr-3`}>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-400">Carregando etiquetas...</p>
              ) : tags.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma etiqueta criada ainda.</p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-800 bg-black/40 p-3 md:flex-row md:items-center md:justify-between"
                  >
                    {editingTagId === tag.id ? (
                      <div className="flex flex-1 gap-2">
                        <Input value={editingValue} onChange={(event) => setEditingValue(event.target.value)} />
                        <Button size="sm" onClick={() => void handleSaveEdit(tag.id)} disabled={!editingValue.trim()}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingTagId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Badge className="w-fit bg-green-600 text-white">{tag.nome}</Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTagId(tag.id)
                              setEditingValue(tag.nome)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => void handleDelete(tag.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
