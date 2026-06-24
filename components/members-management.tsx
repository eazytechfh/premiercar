"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  type User,
  STATUS_LABELS,
  CARGO_LABELS,
  updateMemberStatus,
  updateMemberCargo,
  updateMemberDetails,
  deleteMember,
  canManageMembers,
} from "@/lib/auth"
import {
  Trash2,
  Pencil,
  Loader2,
  Shield,
  Clock,
  XCircle,
  Briefcase,
  Users,
  TrendingUp,
  Lock,
  UserCheck,
  ShieldCheck,
} from "lucide-react"

interface MembersManagementProps {
  members: User[]
  currentUser: User
  onMembersUpdate: () => void
}

export function MembersManagement({ members, currentUser, onMembersUpdate }: MembersManagementProps) {
  const [loading, setLoading] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null)
  const [editingMember, setEditingMember] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    nome_usuario: "",
    email: "",
    telefone: "",
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [error, setError] = useState("")

  const canManage = canManageMembers(currentUser)

  const openEditMember = (member: User) => {
    setEditingMember(member)
    setEditForm({
      nome_usuario: member.nome_usuario,
      email: member.email,
      telefone: member.telefone || "",
    })
    setError("")
  }

  const closeEditMember = () => {
    setEditingMember(null)
    setEditForm({
      nome_usuario: "",
      email: "",
      telefone: "",
    })
    setSavingEdit(false)
  }

  const handleEditFormChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveMemberDetails = async () => {
    if (!editingMember) return

    if (!canManage) {
      setError("Voce nao tem permissao para editar membros.")
      return
    }

    setSavingEdit(true)
    setError("")

    try {
      const result = await updateMemberDetails(editingMember.id, editForm, currentUser)

      if (result.success) {
        onMembersUpdate()
        closeEditMember()
      } else {
        setError(result.error || "Erro ao atualizar dados do vendedor.")
      }
    } catch (err) {
      setError("Erro ao atualizar dados. Tente novamente.")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleStatusChange = async (memberId: number, newStatus: "ativo" | "pendente" | "inativo") => {
    if (!canManage) {
      setError("Você não tem permissão para alterar status de membros.")
      return
    }

    setLoading(memberId)
    setError("")

    try {
      const result = await updateMemberStatus(memberId, newStatus, currentUser)

      if (result.success) {
        onMembersUpdate()
      } else {
        setError(result.error || "Erro ao atualizar status do membro.")
      }
    } catch (err) {
      setError("Erro ao atualizar status. Tente novamente.")
    } finally {
      setLoading(null)
    }
  }

  const handleCargoChange = async (
    memberId: number,
    newCargo: "administrador" | "convidado" | "sdr" | "gestor" | "vendedor",
  ) => {
    if (!canManage) {
      setError("Você não tem permissão para alterar cargos.")
      return
    }

    setLoading(memberId)
    setError("")

    try {
      const result = await updateMemberCargo(memberId, newCargo, currentUser)

      if (result.success) {
        onMembersUpdate()
      } else {
        setError(result.error || "Erro ao atualizar cargo do membro.")
      }
    } catch (err) {
      setError("Erro ao atualizar cargo. Tente novamente.")
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteMember = async (member: User) => {
    if (!canManage) {
      setError("Você não tem permissão para excluir membros.")
      return
    }

    setLoading(member.id)
    setError("")

    try {
      const result = await deleteMember(member.id, currentUser)

      if (result.success) {
        onMembersUpdate()
        setDeleteConfirm(null)
      } else {
        setError(result.error || "Erro ao excluir membro.")
      }
    } catch (err) {
      setError("Erro ao excluir membro. Tente novamente.")
    } finally {
      setLoading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativo":
        return <Shield className="h-3 w-3" />
      case "pendente":
        return <Clock className="h-3 w-3" />
      case "inativo":
        return <XCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const getCargoIcon = (cargo: string) => {
    switch (cargo) {
      case "administrador":
        return <ShieldCheck className="h-3 w-3" />
      case "gestor":
        return <Briefcase className="h-3 w-3" />
      case "sdr":
        return <UserCheck className="h-3 w-3" />
      case "vendedor":
        return <TrendingUp className="h-3 w-3" />
      case "convidado":
        return <Users className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="border-red-500 bg-black">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {!canManage && (
        <Alert className="border-yellow-500 bg-black">
          <Lock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            Apenas gestores podem gerenciar membros da equipe.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-[#1F2937] bg-black">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium truncate">{member.nome_usuario}</p>
                {member.id === currentUser.id && (
                  <Badge variant="outline" className="text-xs">
                    Você
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{member.email}</p>
              {member.telefone && <p className="text-xs text-gray-500">{member.telefone}</p>}
              <p className="text-xs text-gray-400">
                Criado em: {new Date(member.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <div className="flex flex-col gap-2 ml-2">
              {/* Cargo */}
              <Select
                value={member.cargo}
                onValueChange={(value) =>
                  handleCargoChange(member.id, value as "administrador" | "convidado" | "sdr" | "gestor" | "vendedor")
                }
                disabled={loading === member.id || !canManage || member.id === currentUser.id}
              >
                <SelectTrigger className="w-auto min-w-[120px] bg-transparent border-none hover:bg-transparent">
                  <div className="flex items-center gap-2">
                    {getCargoIcon(member.cargo)}
                    <span className="text-xs font-semibold text-white">
                      {CARGO_LABELS[member.cargo as keyof typeof CARGO_LABELS]}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black border-[#22C55E] text-white">
                  {Object.entries(CARGO_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        {getCargoIcon(key)}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <div className="flex items-center gap-2">
                <Select
                  value={member.status}
                  onValueChange={(value) => handleStatusChange(member.id, value as "ativo" | "pendente" | "inativo")}
                  disabled={loading === member.id || !canManage}
                >
                  <SelectTrigger className="w-auto min-w-[100px] bg-transparent border-none hover:bg-transparent">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(member.status)}
                      <span className="text-xs font-semibold text-white">
                        {STATUS_LABELS[member.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-black border-[#22C55E] text-white">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(key)}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {member.cargo === "vendedor" && canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditMember(member)}
                    disabled={loading === member.id}
                    className="h-8 w-8 p-0 text-white hover:text-white hover:bg-[#16A34A]"
                    title="Editar vendedor"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {member.id !== currentUser.id && canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(member)}
                    disabled={loading === member.id}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-[#2a0808]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>Nenhum membro encontrado.</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o membro <strong>{deleteConfirm?.nome_usuario}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteMember(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editingMember} onOpenChange={(open) => !open && closeEditMember()}>
        <DialogContent className="max-w-md border-[#22C55E] bg-black text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar vendedor
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nome-vendedor">Nome</Label>
              <Input
                id="edit-nome-vendedor"
                value={editForm.nome_usuario}
                onChange={(event) => handleEditFormChange("nome_usuario", event.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label htmlFor="edit-email-vendedor">E-mail</Label>
              <Input
                id="edit-email-vendedor"
                type="email"
                value={editForm.email}
                onChange={(event) => handleEditFormChange("email", event.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="edit-telefone-vendedor">Telefone</Label>
              <Input
                id="edit-telefone-vendedor"
                value={editForm.telefone}
                onChange={(event) => handleEditFormChange("telefone", event.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            {error && (
              <Alert className="border-red-500 bg-black">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSaveMemberDetails} disabled={savingEdit}>
                {savingEdit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={closeEditMember} disabled={savingEdit}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
