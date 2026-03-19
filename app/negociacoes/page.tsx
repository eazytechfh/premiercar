"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { getCurrentUser } from "@/lib/auth"
import { SidebarNav } from "@/components/sidebar-nav"
import { KanbanBoard } from "@/components/kanban-board"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Negociacoes() {
  const router = useRouter()

  const [empresaId, setEmpresaId] = useState<number | null>(null)
  const [abrirNovoLead, setAbrirNovoLead] = useState(false)
  const [vendedores, setVendedores] = useState<any[]>([])
  const [salvando, setSalvando] = useState(false)
  const [reloadKanbanKey, setReloadKanbanKey] = useState(0)

  const [novoLead, setNovoLead] = useState({
    nome_lead: "",
    telefone: "",
    email: "",
    origem: "",
    vendedor: "",
    veiculo_interesse: "",
    observacao_vendedor: "",
    cpf: "",
    data_nascimento: "",
    resumo_qualificacao: "",
    bot_ativo: false,
  })

  useEffect(() => {
    const user = getCurrentUser()

    if (!user) {
      router.push("/")
      return
    }

    setEmpresaId(user.id_empresa)
    carregarVendedores()
  }, [router])

  async function carregarVendedores() {
    const { data, error } = await supabase
      .from("VENDEDORES")
      .select("ID_VENDEDOR, NOME")
      .eq("CARGO", "Vendedor")
      .eq("ATIVO", true)
      .order("NOME", { ascending: true })

    if (error) {
      console.log("Erro ao carregar vendedores:", error)
      return
    }

    setVendedores(data || [])
  }

  function atualizarCampo(campo: string, valor: any) {
    setNovoLead((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  function limparFormulario() {
    setNovoLead({
      nome_lead: "",
      telefone: "",
      email: "",
      origem: "",
      vendedor: "",
      veiculo_interesse: "",
      observacao_vendedor: "",
      cpf: "",
      data_nascimento: "",
      resumo_qualificacao: "",
      bot_ativo: false,
    })
  }

  async function salvarLead() {
    try {
      if (!empresaId) {
        alert("Empresa não identificada.")
        return
      }

      if (!novoLead.nome_lead.trim()) {
        alert("Preencha o nome do lead.")
        return
      }

      setSalvando(true)

      const payload = {
        id_empresa: empresaId,
        nome_lead: novoLead.nome_lead.trim() || null,
        telefone: novoLead.telefone.trim() || null,
        email: novoLead.email.trim() || null,
        origem: novoLead.origem.trim() || null,
        vendedor: novoLead.vendedor.trim() || null,
        veiculo_interesse: novoLead.veiculo_interesse.trim() || null,
        resumo_qualificacao: novoLead.resumo_qualificacao.trim() || null,
        observacao_vendedor: novoLead.observacao_vendedor.trim() || null,
        estagio_lead: "oportunidade",
        bot_ativo: novoLead.bot_ativo ? "true" : "false",
        valor: 0,
      }

      const { error } = await supabase.from("BASE_DE_LEADS").insert([payload])

      if (error) {
        console.log("Erro real do Supabase:", error)
        alert(`Erro ao salvar lead: ${error.message}`)
        return
      }

      setAbrirNovoLead(false)
      limparFormulario()
      setReloadKanbanKey((prev) => prev + 1)
      alert("Lead criado com sucesso")
    } catch (error) {
      console.log("Erro inesperado:", error)
      alert("Erro inesperado ao salvar lead")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="flex h-screen bg-black">
      <SidebarNav />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <style>{`
          .bg-white,
          .bg-background,
          .bg-card,
          .bg-popover,
          .bg-muted,
          .bg-gray-50,
          .bg-gray-100,
          .bg-gray-200,
          .bg-accent,
          .card,
          main,
          section,
          .container,
          .kanban-column,
          .kanban-card,
          .shadow-sm,
          .rounded-lg,
          [class*="bg-white"],
          [class*="bg-gray-"],
          [class*="card"],
          [class*="popover"],
          [class*="surface"],
          [class*="muted"],
          .border,
          .flex-1 {
            background-color: #000 !important;
          }

          h1, h2, h3, h4, h5, h6,
          p, span, label, div,
          .text-gray-600,
          .text-gray-900,
          .text-muted-foreground {
            color: #FFFFFF !important;
          }

          input,
          select,
          textarea {
            background-color: #000 !important;
            color: #FFF !important;
            border: 1px solid #22C55E !important;
          }

          input::placeholder,
          textarea::placeholder {
            color: #999 !important;
          }

          .kanban-info,
          .bg-blue-50 {
            background-color: #000000 !important;
            border: 1px solid #22C55E !important;
            color: #FFFFFF !important;
          }

          .kanban-info p,
          .kanban-info span,
          .kanban-info strong,
          .kanban-info div {
            background-color: transparent !important;
            color: #FFFFFF !important;
          }

          .view-toggle-btn-active {
            background-color: #22C55E !important;
            color: #000000 !important;
            border: 1px solid #22C55E !important;
          }

          .view-toggle-btn-active svg {
            color: #000000 !important;
            stroke: #000000 !important;
          }

          .view-toggle-btn-outline {
            background-color: transparent !important;
            color: #22C55E !important;
            border: 1px solid #22C55E !important;
          }

          .view-toggle-btn-outline svg {
            color: #22C55E !important;
            stroke: #22C55E !important;
          }

          [class*="CardHeader"] button,
          [class*="card-header"] button {
            display: inline-flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        `}</style>

        <main className="flex-1 overflow-y-auto bg-black">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Negociações</h1>
                <p className="text-gray-400">
                  Gerencie seus leads através do funil de vendas
                </p>
              </div>

              <Button
                onClick={() => setAbrirNovoLead(true)}
                className="bg-[#22C55E] text-black hover:bg-[#16A34A]"
              >
                Novo Lead
              </Button>
            </div>

            <Dialog open={abrirNovoLead} onOpenChange={setAbrirNovoLead}>
              <DialogContent className="max-w-4xl bg-black border border-[#22C55E] text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white text-2xl">
                    Criar novo lead
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Nome do lead"
                    value={novoLead.nome_lead}
                    onChange={(e) => atualizarCampo("nome_lead", e.target.value)}
                  />

                  <Input
                    placeholder="Telefone"
                    value={novoLead.telefone}
                    onChange={(e) => atualizarCampo("telefone", e.target.value)}
                  />

                  <Input
                    placeholder="Email"
                    value={novoLead.email}
                    onChange={(e) => atualizarCampo("email", e.target.value)}
                  />

                  <Input
                    placeholder="Origem"
                    value={novoLead.origem}
                    onChange={(e) => atualizarCampo("origem", e.target.value)}
                  />

                  <select
                    className="h-10 rounded-md px-3"
                    value={novoLead.vendedor}
                    onChange={(e) => atualizarCampo("vendedor", e.target.value)}
                  >
                    <option value="">Selecione um vendedor</option>
                    {vendedores.map((v) => (
                      <option key={v.ID_VENDEDOR} value={v.NOME}>
                        {v.NOME}
                      </option>
                    ))}
                  </select>

                  <Input
                    placeholder="Veículo interesse"
                    value={novoLead.veiculo_interesse}
                    onChange={(e) =>
                      atualizarCampo("veiculo_interesse", e.target.value)
                    }
                  />

                  <Input
                    placeholder="CPF (não será salvo ainda)"
                    value={novoLead.cpf}
                    onChange={(e) => atualizarCampo("cpf", e.target.value)}
                  />

                  <Input
                    type="date"
                    value={novoLead.data_nascimento}
                    onChange={(e) => atualizarCampo("data_nascimento", e.target.value)}
                  />

                  <Textarea
                    placeholder="Observação vendedor"
                    className="col-span-1 min-h-[90px] md:col-span-2"
                    value={novoLead.observacao_vendedor}
                    onChange={(e) =>
                      atualizarCampo("observacao_vendedor", e.target.value)
                    }
                  />

                  <Textarea
                    placeholder="Resumo qualificação"
                    className="col-span-1 min-h-[90px] md:col-span-2"
                    value={novoLead.resumo_qualificacao}
                    onChange={(e) =>
                      atualizarCampo("resumo_qualificacao", e.target.value)
                    }
                  />

                  <div className="col-span-1 flex items-center justify-between rounded-lg border border-[#22C55E] p-4 md:col-span-2">
                    <span className="text-white">Ativar IA</span>

                    <Button
                      type="button"
                      onClick={() => atualizarCampo("bot_ativo", !novoLead.bot_ativo)}
                      className="bg-[#22C55E] text-black hover:bg-[#16A34A]"
                    >
                      {novoLead.bot_ativo ? "IA Ativada" : "IA Desativada"}
                    </Button>
                  </div>

                  <div className="col-span-1 flex justify-end gap-3 md:col-span-2">
                    <Button
                      variant="outline"
                      onClick={() => setAbrirNovoLead(false)}
                      className="border-[#22C55E] text-[#22C55E] bg-transparent hover:bg-[#22C55E] hover:text-black"
                    >
                      Cancelar
                    </Button>

                    <Button
                      onClick={salvarLead}
                      disabled={salvando}
                      className="bg-[#22C55E] text-black hover:bg-[#16A34A]"
                    >
                      {salvando ? "Salvando..." : "Salvar Lead"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {empresaId && (
              <KanbanBoard key={reloadKanbanKey} empresaId={empresaId} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}