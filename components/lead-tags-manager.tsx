"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Tags, Plus, X, Loader2 } from "lucide-react"
import {
  assignTagToLead,
  createLeadTag,
  getLeadTags,
  removeTagFromLead,
  type LeadTag,
} from "@/lib/lead-tags"

interface LeadTagsManagerProps {
  leadId: number
  empresaId: number
  selectedTags: LeadTag[]
  onTagsChange: (tags: LeadTag[]) => void
}

export function LeadTagsManager({ leadId, empresaId, selectedTags, onTagsChange }: LeadTagsManagerProps) {
  const [availableTags, setAvailableTags] = useState<LeadTag[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [creating, setCreating] = useState(false)
  const [newTagName, setNewTagName] = useState("")

  useEffect(() => {
    void loadTags()
  }, [empresaId])

  const loadTags = async () => {
    setLoading(true)
    const tags = await getLeadTags(empresaId)
    setAvailableTags(tags)
    setLoading(false)
  }

  const filteredTags = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return availableTags

    return availableTags.filter((tag) => tag.nome.toLowerCase().includes(query))
  }, [availableTags, search])

  const selectedTagIds = new Set(selectedTags.map((tag) => tag.id))

  const handleToggleTag = async (tag: LeadTag) => {
    const exists = selectedTagIds.has(tag.id)
    setLoading(true)

    const success = exists ? await removeTagFromLead(leadId, tag) : await assignTagToLead(leadId, tag)

    if (success) {
      const nextTags = exists ? selectedTags.filter((item) => item.id !== tag.id) : [...selectedTags, tag]
      onTagsChange(nextTags.sort((a, b) => a.nome.localeCompare(b.nome)))
    }

    setLoading(false)
  }

  const handleCreateTag = async () => {
    const createdTag = await createLeadTag(empresaId, newTagName)
    if (!createdTag) return

    setNewTagName("")
    setCreating(false)
    await loadTags()

    if (!selectedTagIds.has(createdTag.id)) {
      const assigned = await assignTagToLead(leadId, createdTag)
      if (assigned) {
        onTagsChange([...selectedTags, createdTag].sort((a, b) => a.nome.localeCompare(b.nome)))
      }
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-green-800">
            <Tags className="h-4 w-4" />
            <span className="text-sm font-semibold">Etiquetas</span>
          </div>
          <p className="mt-1 text-xs text-gray-600">Vincule etiquetas ao lead ou crie uma nova na hora.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="border-green-500 text-green-800 hover:bg-green-100">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar etiqueta
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="border-b p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar etiqueta..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="p-2">
              {creating ? (
                <div className="space-y-2 p-2">
                  <Input
                    value={newTagName}
                    onChange={(event) => setNewTagName(event.target.value)}
                    placeholder="Digite o nome da etiqueta"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        void handleCreateTag()
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => void handleCreateTag()}
                      disabled={!newTagName.trim()}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      Criar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setCreating(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <DropdownMenuItem onClick={() => setCreating(true)} className="cursor-pointer font-medium text-green-700">
                  <Plus className="h-4 w-4" />
                  + Criar nova etiqueta
                </DropdownMenuItem>
              )}
            </div>

            <DropdownMenuSeparator />

            <ScrollArea className={`${availableTags.length > 5 ? "h-64" : "h-auto"} max-h-64`}>
              <div className="p-2">
                {loading ? (
                  <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando etiquetas...
                  </div>
                ) : filteredTags.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500">Nenhuma etiqueta encontrada.</div>
                ) : (
                  filteredTags.map((tag) => {
                    const isSelected = selectedTagIds.has(tag.id)

                    return (
                      <DropdownMenuItem
                        key={tag.id}
                        onClick={() => void handleToggleTag(tag)}
                        className="flex cursor-pointer items-center justify-between gap-3 py-2"
                      >
                        <span className="truncate">{tag.nome}</span>
                        <Badge className={isSelected ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}>
                          {isSelected ? "Selecionada" : "Adicionar"}
                        </Badge>
                      </DropdownMenuItem>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedTags.length === 0 ? (
          <span className="text-sm italic text-gray-500">Nenhuma etiqueta vinculada a este lead.</span>
        ) : (
          selectedTags.map((tag) => (
            <Badge key={tag.id} className="flex items-center gap-1 bg-green-600 text-white">
              {tag.nome}
              <button type="button" onClick={() => void handleToggleTag(tag)} aria-label={`Remover ${tag.nome}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  )
}
