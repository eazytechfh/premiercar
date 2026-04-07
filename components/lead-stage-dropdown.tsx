"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Loader2, MoveHorizontal } from "lucide-react"
import { ESTAGIO_COLORS, ESTAGIO_LABELS, VALID_ESTAGIOS } from "@/lib/leads"

interface LeadStageDropdownProps {
  currentStage: string
  onStageChange: (newStage: string) => Promise<void> | void
  loading?: boolean
}

const HIDDEN_STAGES = ["pesquisa_atendimento"]
const AVAILABLE_STAGES = VALID_ESTAGIOS.filter((stage) => !HIDDEN_STAGES.includes(stage))

export function LeadStageDropdown({ currentStage, onStageChange, loading = false }: LeadStageDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2 border-green-600/40 text-white hover:bg-green-950"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveHorizontal className="h-4 w-4" />}
          Mover etapa
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {AVAILABLE_STAGES.map((stage) => (
          <DropdownMenuItem
            key={stage}
            disabled={loading || stage === currentStage}
            onClick={() => onStageChange(stage)}
            className="flex items-center justify-between gap-3 py-2"
          >
            <span>{ESTAGIO_LABELS[stage as keyof typeof ESTAGIO_LABELS] ?? stage}</span>
            <Badge className={ESTAGIO_COLORS[stage as keyof typeof ESTAGIO_COLORS]}>
              {stage === currentStage ? "Atual" : "Mover"}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
