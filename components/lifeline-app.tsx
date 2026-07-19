"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Copy, Eye, EyeOff, Fingerprint, HeartHandshake, Home, Link2, LockKeyhole, LogOut, Menu, Plus, RefreshCcw, ShieldCheck, Sparkles, Users, Vote, WalletCards, X } from "lucide-react";
import { toast } from "sonner";
import { initialState } from "@/lib/demo-data";
import { createDemoProof } from "@/lib/proof";
import { loadState, resetState, saveState } from "@/lib/store";
import { CircleState, Need } from "@/lib/types";
import { connectMidnightWallet, type WalletConnection } from "@/lib/midnight-wallet";
import { commitmentFor, lifelineBrowserManager } from "@/lib/lifeline-browser-manager";
import type { LifelineChainState, LifelineMidnightAPI } from "@/lib/lifeline-midnight-api";
import { createPrivateInvite, readPrivateInvite } from "@/lib/private-invite";

type View = "overview" | "needs" | "vote" | "result" | "privacy";

export function LifelineApp() {
  const [state, setState] = useState<CircleState>(initialState);
  const [view, setView] = useState<View>("overview");
  const [ready, setReady] = useState(false);
  const [wallet, setWallet] = useState<WalletConnection>({ mode:"disconnected", label:"Conectar carteira", network:"" });
  const [privacy, setPrivacy] = useState(true);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<"need" | "contribute" | "proof" | null>(null);
  const [proof, setProof] = useState<{transactionId:string; commitment:string; network:string} | null>(null);
  const [liveApi, setLiveApi] = useState<LifelineMidnightAPI | null>(null);
  const [chainState, setChainState] = useState<LifelineChainState | null>(null);
  const [contractAddress, setContractAddress] = useState("");
  const [chainBusy, setChainBusy] = useState(false);
  const [chainStatus, setChainStatus] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      let nextState = loadState();
      try {
        const invite = await readPrivateInvite(window.location.hash);
        if (invite) {
          nextState = { ...invite.state, userRole: "supporter", votedNeedId: undefined };
          if (invite.contractAddress) {
            lifelineBrowserManager.rememberContractAddress(invite.contractAddress);
            setContractAddress(invite.contractAddress);
          }
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
          toast.success("Convite privado aberto. Conecte a Lace para apoiar este círculo.");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Convite privado inválido");
      }
      if (active) {
        setState(nextState);
        setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => { if (ready) saveState(state); }, [state, ready]);
  useEffect(() => {
    if (!chainState) return;
    let active = true;
    void Promise.all(state.needs.map((need) => commitmentFor("lifeline:need", need.id))).then((commitments) => {
      if (!active) return;
      setState((current) => ({
        ...current,
        needs: current.needs.map((need, index) => ({
          ...need,
          votes: chainState.voteTotalFor(commitments[index]),
        })),
      }));
    });
    return () => { active = false; };
  }, [chainState]);

  const totalVotes = state.needs.reduce((sum, need) => sum + need.votes, 0);
  const leading = useMemo(() => [...state.needs].sort((a,b) => b.votes-a.votes)[0], [state.needs]);

  function attachLiveApi(api: LifelineMidnightAPI) {
    setLiveApi(api);
    setContractAddress(api.deployedContractAddress);
    api.state$.subscribe({
      next: setChainState,
      error: (error) => console.error("Falha ao acompanhar o ledger Lifeline", error),
    });
  }

  async function connectWallet() {
    if (wallet.mode !== "disconnected") {
      lifelineBrowserManager.clearSession();
      setLiveApi(null);
      setChainState(null);
      setContractAddress("");
      setWallet({ mode:"disconnected", label:"Conectar carteira", network:"" });
      toast.success("Carteira desconectada desta sessão");
      return;
    }
    try {
      const connection = await connectMidnightWallet();
      setWallet(connection);
      if (connection.mode === "lace") {
        toast.success(`Lace conectada à rede ${connection.network}`);
        const existingAddress = lifelineBrowserManager.getStoredContractAddress();
        if (existingAddress) {
          setChainStatus("Conectando ao contrato existente…");
          const api = await lifelineBrowserManager.join(existingAddress);
          attachLiveApi(api);
          setChainStatus("");
        }
      }
      else toast.info("Lace não encontrada. Modo demonstração local ativado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível conectar à Lace");
    }
  }

  async function activateMidnight() {
    if (wallet.mode !== "lace") {
      toast.error("Conecte a Lace em Preprod primeiro");
      return;
    }
    setChainBusy(true);
    try {
      let api = liveApi;
      if (!api) {
        setChainStatus("Publicando o contrato na Midnight Preprod…");
        api = await lifelineBrowserManager.deploy();
        attachLiveApi(api);
        toast.success("Contrato Lifeline publicado na Midnight");
      }

      if (!chainState?.cycleOpen) {
        setChainStatus("Criando o ciclo privado on-chain…");
        const cycleCommitment = await commitmentFor("lifeline:cycle", state.cycle);
        try {
          await api.createCycle(cycleCommitment);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (!message.toLowerCase().includes("already open")) throw error;
        }
      }

      for (let index = 0; index < state.needs.length; index++) {
        const need = state.needs[index];
        setChainStatus(`Registrando compromisso ${index + 1}/${state.needs.length}…`);
        const commitment = await commitmentFor("lifeline:need", need.id);
        try {
          await api.registerNeed(commitment);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (!message.toLowerCase().includes("already registered")) throw error;
        }
      }

      setChainStatus("");
      toast.success("Ciclo e necessidades registrados com privacidade");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Falha ao ativar o contrato Midnight");
    } finally {
      setChainBusy(false);
    }
  }

  function switchRole() {
    setState(s => ({...s, userRole: s.userRole === "beneficiary" ? "supporter" : "beneficiary"}));
    setView("overview");
    toast.success(state.userRole === "beneficiary" ? "Modo apoiador ativado" : "Modo beneficiário ativado");
  }

  async function copyPrivateInvite() {
    try {
      const invite = await createPrivateInvite(state, contractAddress, window.location.href);
      await navigator.clipboard.writeText(invite);
      toast.success("Convite privado criptografado e copiado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o convite");
    }
  }

  async function vote(id: string) {
    if (wallet.mode === "disconnected") { toast.error("Conecte a Lace ou ative o modo demonstração primeiro"); return; }
    if (state.votedNeedId) { toast.error("Sua credencial já foi usada neste ciclo"); return; }
    const weight = Math.min(state.creditBalance, 100);
    if (wallet.mode === "lace" && liveApi) {
      setChainBusy(true);
      setChainStatus("Gerando a prova privada do voto…");
      try {
        const commitment = await commitmentFor("lifeline:need", id);
        const receipt = await liveApi.castPrivateVote(commitment, weight);
        setState(s => ({...s, votedNeedId: id, needs: s.needs.map(n => n.id === id ? {...n, votes:n.votes+weight} : n)}));
        setProof({ transactionId: receipt.transactionId, commitment: id, network: `Midnight Preprod · ${receipt.contractAddress}` });
        toast.success(`Voto privado confirmado com peso ${weight}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao submeter o voto privado");
      } finally {
        setChainBusy(false);
        setChainStatus("");
      }
      return;
    }
    setState(s => ({...s, votedNeedId: id, needs: s.needs.map(n => n.id === id ? {...n, votes:n.votes+weight} : n)}));
    await createDemoProof({ action:"private-vote", needCommitment:id, weight, nullifier:crypto.randomUUID() });
    toast.success(`Voto demonstrativo registrado com peso ${weight}`);
  }

  async function closeCycle() {
    let result: { transactionId: string; commitment: string; network: string };
    if (wallet.mode === "lace" && liveApi) {
      setChainBusy(true);
      setChainStatus("Gerando a prova de encerramento…");
      try {
        const commitment = await commitmentFor("lifeline:need", leading.id);
        const receipt = await liveApi.closeCycle(commitment);
        result = { transactionId: receipt.transactionId, commitment: leading.id, network: `Midnight Preprod · ${receipt.contractAddress}` };
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao encerrar o ciclo on-chain");
        return;
      } finally {
        setChainBusy(false);
        setChainStatus("");
      }
    } else {
      result = await createDemoProof({ action:"close-cycle", winner:leading.id, total:totalVotes });
    }
    setProof(result);
    setState(s => ({...s, needs:s.needs.map(n => ({...n, status:n.id===leading.id?"selected":"voting"}))}));
    setView("result");
    toast.success("Ciclo encerrado e comprovante gerado");
  }

  function restart() {
    resetState(); setState(initialState); setView("overview"); setProof(null); setWallet({ mode:"disconnected", label:"Conectar carteira", network:"" });
    toast.success("Demonstração reiniciada");
  }

  async function addNeed(need: Need) {
    if (liveApi) {
      setChainBusy(true);
      setChainStatus("Registrando compromisso da necessidade…");
      try {
        await liveApi.registerNeed(await commitmentFor("lifeline:need", need.id));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao registrar a necessidade na Midnight");
        setChainBusy(false);
        setChainStatus("");
        return;
      }
      setChainBusy(false);
      setChainStatus("");
    }
    setState(s => ({...s,needs:[...s.needs,need]}));
    setModal(null);
    toast.success(liveApi ? "Compromisso registrado; detalhes permaneceram locais" : "Necessidade protegida e adicionada");
  }

  const navigation: {id:View; label:string; icon:typeof Home}[] = [
    {id:"overview", label:"Visão geral", icon:Home}, {id:"needs", label:"Necessidades", icon:WalletCards},
    {id:"vote", label:"Votação", icon:Vote}, {id:"result", label:"Resultados", icon:CheckCircle2}, {id:"privacy", label:"Privacidade", icon:ShieldCheck}
  ];

  return <div className="shell">
    <aside className={`sidebar ${menu?"open":""}`}>
      <div className="brand"><div className="brandmark"><HeartHandshake size={24}/></div><div><strong>Lifeline</strong><span>Private recovery network</span></div></div>
      <button className="close-mobile" onClick={()=>setMenu(false)} aria-label="Fechar menu"><X/></button>
      <div className="circle-card"><span>Seu círculo</span><strong>{state.circleName}</strong><small><i/> Ciclo ativo · {state.cycle}</small></div>
      <nav>{navigation.map(item=><button key={item.id} className={view===item.id?"active":""} onClick={()=>{setView(item.id);setMenu(false)}}><item.icon size={19}/>{item.label}{item.id==="vote"&&<em>1</em>}</button>)}</nav>
      <div className="side-bottom">
        <button onClick={copyPrivateInvite}><Link2 size={17}/>Copiar convite privado</button>
        <button onClick={switchRole}><RefreshCcw size={17}/>Ver como {state.userRole==="beneficiary"?"apoiador":"beneficiário"}</button>
        <button onClick={restart}><LogOut size={17}/>Reiniciar demo</button>
        <div className="identity"><div>AG</div><span><strong>André Gomes</strong><small>{state.userRole==="beneficiary"?"Beneficiário":"Apoiador"}</small></span><ChevronRight size={16}/></div>
      </div>
    </aside>
    <main>
      <header><button className="menu-btn" onClick={()=>setMenu(true)}><Menu/></button><div className="mobile-logo">Lifeline</div><div className="header-actions"><button className="privacy-toggle" onClick={()=>setPrivacy(!privacy)}>{privacy?<EyeOff size={17}/>:<Eye size={17}/>} {privacy?"Valores protegidos":"Valores visíveis"}</button><button className={`wallet ${wallet.mode!=="disconnected"?"connected":""}`} onClick={connectWallet}><span/><span>{wallet.label}</span></button></div></header>
      <section className="content">
        <div className={`network-strip ${wallet.mode === "lace" ? "lace" : "demo"}`}>
          <span/>
          <strong>{wallet.mode === "lace" ? `Lace conectada · ${wallet.network}` : "Hackathon demo · dados locais"}</strong>
          <small>{contractAddress ? `Contrato ${contractAddress.slice(0, 8)}…${contractAddress.slice(-6)}` : "Sem pagamentos bancários reais"}</small>
          {wallet.mode === "lace" && <button className="network-action" disabled={chainBusy} onClick={activateMidnight}>{contractAddress ? "Sincronizar ciclo" : "Publicar na Preprod"}</button>}
        </div>
        {chainStatus && <div className="chain-progress"><RefreshCcw/><span>{chainStatus}</span></div>}
        {chainState && <div className="chain-proof"><ShieldCheck/><span><strong>Estado Midnight verificado</strong> · ciclo {chainState.cycleNumber} · {chainState.registeredNeeds.length} compromissos · {chainState.totalVotingWeight} créditos agregados</span></div>}
        {view==="overview"&&<Overview state={state} privacy={privacy} totalVotes={totalVotes} leading={leading} onView={()=>setView("vote")} onNeed={()=>setModal("need")} onContribute={()=>setModal("contribute")} />}
        {view==="needs"&&<Needs state={state} privacy={privacy} onNew={()=>setModal("need")}/>} 
        {view==="vote"&&<Voting state={state} privacy={privacy} totalVotes={totalVotes} busy={chainBusy} onVote={vote} onClose={closeCycle}/>} 
        {view==="result"&&<Result state={state} leading={leading} proof={proof} onClose={closeCycle}/>} 
        {view==="privacy"&&<Privacy/>}
      </section>
    </main>
    {modal==="need"&&<NeedModal onClose={()=>setModal(null)} onAdd={addNeed}/>} 
    {modal==="contribute"&&<ContributeModal onClose={()=>setModal(null)} onAdd={(amount)=>{setState(s=>({...s,totalContributed:s.totalContributed+amount,supporters:s.supporters+1}));setModal(null);toast.success(`${amount} créditos adicionados ao círculo`)}}/>}
  </div>;
}

function PageTitle({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:React.ReactNode}) { return <div className="page-title"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div> }
const money=(v:number, hidden=false)=>hidden?"R$ •••••":"R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2});
const percentage=(value:number,total:number)=>total > 0 ? Math.round(value/total*100) : 0;

function Overview({state,privacy,totalVotes,leading,onView,onNeed,onContribute}:{state:CircleState;privacy:boolean;totalVotes:number;leading:Need;onView:()=>void;onNeed:()=>void;onContribute:()=>void}) {
  return <><PageTitle eyebrow={state.userRole==="beneficiary"?"Boa noite, André":"Círculo de André"} title={state.userRole==="beneficiary"?"Seu caminho para recomeçar":"Sua ajuda faz diferença"} description={state.userRole==="beneficiary"?"Acompanhe o ciclo, organize prioridades e receba apoio sem abrir mão da sua privacidade.":"Contribua e ajude a decidir qual necessidade deve ser priorizada neste ciclo."} action={<button className="primary" onClick={state.userRole==="beneficiary"?onNeed:onContribute}>{state.userRole==="beneficiary"?<Plus/>:<HeartHandshake/>}{state.userRole==="beneficiary"?"Nova necessidade":"Contribuir"}</button>}/>
  <div className="metrics"><Metric icon={CircleDollarSign} label="Apoio disponível" value={money(state.totalContributed,privacy)} note="Créditos de demonstração" tone="sage"/><Metric icon={Users} label="Apoiadores" value={String(state.supporters)} note="Identidades protegidas" tone="blue"/><Metric icon={Vote} label="Participação" value={`${totalVotes} cr.`} note="4 opções neste ciclo" tone="gold"/><Metric icon={Clock3} label="Encerramento" value="1 dia" note="18 jul · 23:59" tone="rose"/></div>
  <div className="grid-main"><article className="panel vote-summary"><div className="panel-head"><div><span className="eyebrow">VOTAÇÃO EM ANDAMENTO</span><h2>Qual necessidade priorizar?</h2></div><span className="live"><i/>Ao vivo</span></div><p>Os apoiadores votam de forma privada. Apenas o resultado agregado fica visível.</p><div className="leading"><div className="need-icon">{leading.title.slice(0,1)}</div><div><small>Liderando no momento</small><strong>{leading.title}</strong><span>{leading.category} · {money(leading.amount,privacy)}</span></div><b>{percentage(leading.votes,totalVotes)}%</b></div><div className="progress"><i style={{width:`${percentage(leading.votes,totalVotes)}%`}}/></div><div className="vote-foot"><span>{totalVotes} créditos participando</span><button onClick={onView}>Ver votação <ArrowRight size={16}/></button></div></article>
  <article className="panel privacy-panel"><div className="shield"><ShieldCheck/></div><h2>Sua privacidade está ativa</h2><p>Dívidas, contribuições e identidades permanecem protegidas. A Midnight verifica as regras sem expor seus dados.</p><ul><li><Check/>Dados financeiros locais</li><li><Check/>Votos privados e verificáveis</li><li><Check/>Sem perfil financeiro público</li></ul><span className="midnight-badge"><Fingerprint/>Secured by Midnight</span></article></div>
  <div className="section-head"><div><span>NECESSIDADES DESTE CICLO</span><h2>Prioridades compartilhadas</h2></div><button onClick={onView}>Ver todas <ArrowRight/></button></div><div className="need-grid">{state.needs.slice(0,3).map(n=><NeedCard key={n.id} need={n} privacy={privacy} total={totalVotes}/>)}</div></>;
}

function Metric({icon:Icon,label,value,note,tone}:{icon:typeof Home;label:string;value:string;note:string;tone:string}) {return <article className="metric"><div className={`metric-icon ${tone}`}><Icon/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>}
function NeedCard({need,privacy,total}:{need:Need;privacy:boolean;total:number}) {return <article className="need-card"><div className="need-top"><span>{need.category}</span><LockKeyhole/></div><h3>{need.title}</h3><strong>{money(need.amount,privacy)}</strong><p>{need.impact}</p><div className="need-meta"><span><Clock3/>Vence {need.dueDate}</span><b>{percentage(need.votes,total)}% dos votos</b></div></article>}

function Needs({state,privacy,onNew}:{state:CircleState;privacy:boolean;onNew:()=>void}) {return <><PageTitle eyebrow="PLANEJAMENTO PRIVADO" title="Necessidades do ciclo" description="Organize as contas que precisam de apoio. Os detalhes só são revelados às pessoas autorizadas." action={<button className="primary" onClick={onNew}><Plus/>Adicionar necessidade</button>}/><div className="need-grid large">{state.needs.map(n=><NeedCard key={n.id} need={n} privacy={privacy} total={state.needs.reduce((s,x)=>s+x.votes,0)}/>)}</div></>}

function Voting({state,privacy,totalVotes,busy,onVote,onClose}:{state:CircleState;privacy:boolean;totalVotes:number;busy:boolean;onVote:(id:string)=>void;onClose:()=>void}) {return <><PageTitle eyebrow="DECISÃO COLETIVA" title="Votação privada" description="Seu voto é protegido. O peso máximo por apoiador é 100 créditos para manter a decisão equilibrada." action={state.userRole==="beneficiary"?<button className="secondary" disabled={busy} onClick={onClose}>Encerrar ciclo</button>:undefined}/><div className="info-strip"><ShieldCheck/><div><strong>Como sua privacidade funciona</strong><span>O contrato confirma que a necessidade foi registrada, que o limite foi respeitado e que a credencial local ainda não votou neste ciclo — sem revelar o segredo da credencial.</span></div></div><div className="voting-list">{state.needs.map(n=><article key={n.id} className={`vote-item ${state.votedNeedId===n.id?"chosen":""}`}><div className="vote-letter">{n.title[0]}</div><div className="vote-copy"><span>{n.category}</span><h3>{n.title}</h3><p>{n.impact}</p><small><Clock3/>Vence {n.dueDate}</small></div><div className="vote-number"><strong>{money(n.amount,privacy)}</strong><span>{n.votes} créditos</span><div className="mini-progress"><i style={{width:`${percentage(n.votes,totalVotes)}%`}}/></div>{state.userRole==="supporter"&&<button disabled={busy||!!state.votedNeedId} onClick={()=>onVote(n.id)}>{state.votedNeedId===n.id?<><Check/>Seu voto</>:"Priorizar"}</button>}</div></article>)}</div></>}

function Result({state,leading,proof,onClose}:{state:CircleState;leading:Need;proof:{transactionId:string;commitment:string;network:string}|null;onClose:()=>void}) {return <><PageTitle eyebrow="RESULTADO VERIFICÁVEL" title="Decisão do círculo" description="O resultado agregado pode ser verificado sem revelar contribuições, votos ou identidades."/>{!proof?<div className="empty-result"><Vote/><h2>O ciclo ainda está aberto</h2><p>Encerre a votação para gerar o comprovante privado de decisão.</p><button className="primary" onClick={onClose}>Encerrar votação demo</button></div>:<div className="result-card"><div className="result-check"><CheckCircle2/></div><span>NECESSIDADE PRIORIZADA</span><h2>{leading.title}</h2><strong>{money(leading.amount)}</strong><p>A escolha foi aprovada pelo círculo com {leading.votes} créditos de voto.</p><div className="proof-box"><div><Fingerprint/><span><small>TRANSAÇÃO</small><code>{proof.transactionId}</code></span><button onClick={()=>{navigator.clipboard.writeText(proof.transactionId);toast.success("ID copiado")}}><Copy/></button></div><div><ShieldCheck/><span><small>REDE</small><b>{proof.network}</b></span></div></div><button className="primary" onClick={()=>toast.success("Execução simulada registrada")}>Registrar execução simulada</button><small className="disclaimer">Créditos sem valor econômico. Nenhum pagamento bancário foi realizado.</small></div>}</>}

function Privacy(){return <><PageTitle eyebrow="PRIVACIDADE PROGRAMÁVEL" title="Você escolhe o que revelar" description="O Lifeline mantém sua vida financeira fora de bancos de dados públicos e centralizados."/><div className="privacy-grid"><PrivacyCard icon={LockKeyhole} title="Permanece privado" items={["Nome e valor das dívidas","Identidade dos apoiadores","Segredo da credencial local","Dados no convite criptografado","Documentos e códigos de boleto"]}/><PrivacyCard icon={Fingerprint} title="É provado sem revelar" items={["Necessidade previamente registrada","Credencial não reutilizada no ciclo","Peso positivo","Limite de 100 créditos","Transição correta do contrato"]}/><PrivacyCard icon={ShieldCheck} title="Fica verificável" items={["Compromissos das necessidades","Estado e número do ciclo","Totais agregados por opção","Opção vencedora","Nullificador do ciclo"]}/></div><div className="manifesto"><Sparkles/><div><h2>Não colocamos dificuldades financeiras on-chain.</h2><p>Colocamos a prova de que o apoio foi justo.</p></div></div></>}
function PrivacyCard({icon:Icon,title,items}:{icon:typeof Home;title:string;items:string[]}){return <article className="privacy-card"><Icon/><h3>{title}</h3><ul>{items.map(x=><li key={x}><Check/>{x}</li>)}</ul></article>}

function ModalShell({title,description,onClose,children}:{title:string;description:string;onClose:()=>void;children:React.ReactNode}){return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}><X/></button><span>PROTEGIDO POR PADRÃO</span><h2>{title}</h2><p>{description}</p>{children}</div></div>}
function NeedModal({onClose,onAdd}:{onClose:()=>void;onAdd:(n:Need)=>void}){const [title,setTitle]=useState("");const [amount,setAmount]=useState("");const [category,setCategory]=useState("Essencial");return <ModalShell title="Nova necessidade" description="Os detalhes serão guardados somente neste dispositivo." onClose={onClose}><label>Descrição<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Conta de energia"/></label><div className="form-row"><label>Valor<input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0,00"/></label><label>Categoria<select value={category} onChange={e=>setCategory(e.target.value)}><option>Essencial</option><option>Juros altos</option><option>Trabalho</option><option>Longo prazo</option></select></label></div><button className="primary full" disabled={!title||!amount} onClick={()=>onAdd({id:crypto.randomUUID(),title,amount:Number(amount),category,dueDate:"31 jul",impact:"Necessidade registrada pelo beneficiário.",votes:0,status:"voting"})}><LockKeyhole/>Proteger e adicionar</button></ModalShell>}
function ContributeModal({onClose,onAdd}:{onClose:()=>void;onAdd:(n:number)=>void}){const [amount,setAmount]=useState(50);return <ModalShell title="Apoiar este ciclo" description="Use créditos de demonstração para experimentar a decisão coletiva." onClose={onClose}><div className="amounts">{[10,50,100,500].map(x=><button key={x} className={amount===x?"active":""} onClick={()=>setAmount(x)}>{x} cr.</button>)}</div><div className="weight-note"><Vote/><span>Seu peso de voto será <strong>{Math.min(amount,100)} créditos</strong>. O limite evita concentração de poder.</span></div><button className="primary full" onClick={()=>onAdd(amount)}><HeartHandshake/>Confirmar apoio demo</button></ModalShell>}
