"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  createLeadTag,
  deleteLeadTag,
  getLeadTagColorMeta,
  getLeadTagDisplayStyle,
  getLeadTags,
  LEAD_TAG_COLOR_OPTIONS,
  updateLeadTag,
  type LeadTag,
  type LeadTagColor,
} from "@/lib/lead-tags"
import { Pencil, Tags, Trash2 } from "lucide-react"

interface LeadTagsSettingsCardProps {
  empresaId: number
}

export function LeadTagsSettingsCard({ empresaId }: LeadTagsSettingsCardProps) {
  const [tags, setTags] = useState<LeadTag[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [editingTagId, setEditingTagId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [newTagColor, setNewTagColor] = useState<LeadTagColor>("verde")
  const [editingColor, setEditingColor] = useState<LeadTagColor>("verde")
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
    const created = await createLeadTag(empresaId, newTagName, newTagColor)
    if (!created) return

    setNewTagName("")
    setNewTagColor("verde")
    await loadTags()
  }

  const handleSaveEdit = async (tagId: number) => {
    const success = await updateLeadTag(tagId, empresaId, editingValue, editingColor)
    if (!success) return

    setEditingTagId(null)
    setEditingValue("")
    setEditingColor("verde")
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
        <div className="space-y-3">
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

          <div className="flex flex-wrap gap-2">
            {LEAD_TAG_COLOR_OPTIONS.map((colorOption) => {
              const isSelected = newTagColor === colorOption.value

              return (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setNewTagColor(colorOption.value)}
                  title={colorOption.label}
                  aria-label={colorOption.label}
                  style={colorOption.buttonStyle}
                  className={`flex min-w-8 items-center justify-center rounded-full px-1 py-1 text-base font-semibold transition ${isSelected ? "scale-110 ring-2 ring-green-500 ring-offset-1 ring-offset-black" : "opacity-90 hover:opacity-100"}`}
                >
                  {colorOption.icon}
                </button>
              )
            })}
          </div>
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
                      <div className="flex flex-1 flex-col gap-2">
                        <Input value={editingValue} onChange={(event) => setEditingValue(event.target.value)} />
                        <div className="flex flex-wrap gap-2">
                          {LEAD_TAG_COLOR_OPTIONS.map((colorOption) => {
                            const isSelected = editingColor === colorOption.value

                            return (
                              <button
                                key={colorOption.value}
                                type="button"
                                onClick={() => setEditingColor(colorOption.value)}
                                title={colorOption.label}
                                aria-label={colorOption.label}
                                style={colorOption.buttonStyle}
                                className={`flex min-w-8 items-center justify-center rounded-full px-1 py-1 text-base font-semibold transition ${isSelected ? "scale-110 ring-2 ring-green-500 ring-offset-1 ring-offset-black" : "opacity-90 hover:opacity-100"}`}
                              >
                                {colorOption.icon}
                              </button>
                            )
                          })}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => void handleSaveEdit(tag.id)} disabled={!editingValue.trim()}>
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTagId(null)
                              setEditingValue("")
                              setEditingColor("verde")
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span
                          className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={tag.cor === "branco" ? getLeadTagDisplayStyle(tag.cor) : { ...getLeadTagDisplayStyle(tag.cor), color: "#ffffff" }}
                        >
                          {tag.nome}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTagId(tag.id)
                              setEditingValue(tag.nome)
                              setEditingColor((tag.cor as LeadTagColor) || "verde")
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
