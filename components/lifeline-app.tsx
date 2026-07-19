"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Copy, Eye, EyeOff, Fingerprint, HeartHandshake, Home, Link2, LockKeyhole, LogOut, Menu, Plus, RefreshCcw, ShieldCheck, Sparkles, Users, Vote, WalletCards, X } from "lucide-react";
import { toast } from "sonner";
import { createInitialState } from "@/lib/demo-data";
import { createDemoProof, LOCAL_DEMO_NETWORK } from "@/lib/proof";
import { loadState, resetState, saveState } from "@/lib/store";
import { CircleState, Need } from "@/lib/types";
import { connectMidnightWallet, type WalletConnection } from "@/lib/midnight-wallet";
import { commitmentFor, lifelineBrowserManager } from "@/lib/lifeline-browser-manager";
import type { LifelineChainState, LifelineMidnightAPI } from "@/lib/lifeline-midnight-api";
import { createPrivateInvite, readPrivateInvite } from "@/lib/private-invite";
import { formatMoney, localizeCircleState, useLocale, type Locale } from "@/lib/i18n";

type View = "overview" | "needs" | "vote" | "result" | "privacy";

function walletDisplayLabel(wallet: WalletConnection, t: (key: string) => string): string {
  if (wallet.mode === "disconnected") return t("wallet.connect");
  if (wallet.mode === "demo") return t("wallet.localDemo");
  return wallet.label || t("wallet.laceConnected");
}

function proofNetworkLabel(network: string, t: (key: string) => string): string {
  return network === LOCAL_DEMO_NETWORK ? t("proof.localReceipt") : network;
}

export function LifelineApp() {
  const { t, locale, setLocale, messages } = useLocale();
  const [state, setState] = useState<CircleState>(() => createInitialState(locale));
  const [view, setView] = useState<View>("overview");
  const [ready, setReady] = useState(false);
  const [wallet, setWallet] = useState<WalletConnection>({ mode: "disconnected", label: "", network: "" });
  const [privacy, setPrivacy] = useState(true);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<"need" | "contribute" | "proof" | null>(null);
  const [proof, setProof] = useState<{ transactionId: string; commitment: string; network: string } | null>(null);
  const [liveApi, setLiveApi] = useState<LifelineMidnightAPI | null>(null);
  const [chainState, setChainState] = useState<LifelineChainState | null>(null);
  const [contractAddress, setContractAddress] = useState("");
  const [chainBusy, setChainBusy] = useState(false);
  const [chainStatus, setChainStatus] = useState("");

  const displayState = useMemo(() => localizeCircleState(state, messages), [state, messages]);

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
          toast.success(t("toast.inviteOpened"));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("toast.inviteInvalid"));
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

  const totalVotes = displayState.needs.reduce((sum, need) => sum + need.votes, 0);
  const leading = useMemo(() => [...displayState.needs].sort((a, b) => b.votes - a.votes)[0], [displayState.needs]);

  function attachLiveApi(api: LifelineMidnightAPI) {
    setLiveApi(api);
    setContractAddress(api.deployedContractAddress);
    api.state$.subscribe({
      next: setChainState,
      error: (error) => console.error("Failed to follow Lifeline ledger", error),
    });
  }

  async function connectWallet() {
    if (wallet.mode !== "disconnected") {
      lifelineBrowserManager.clearSession();
      setLiveApi(null);
      setChainState(null);
      setContractAddress("");
      setWallet({ mode: "disconnected", label: "", network: "" });
      toast.success(t("toast.walletDisconnected"));
      return;
    }
    try {
      const connection = await connectMidnightWallet();
      setWallet(connection);
      if (connection.mode === "lace") {
        toast.success(t("toast.laceConnectedTo", { network: connection.network }));
        const existingAddress = lifelineBrowserManager.getStoredContractAddress();
        if (existingAddress) {
          setChainStatus(t("chain.connectingContract"));
          const api = await lifelineBrowserManager.join(existingAddress);
          attachLiveApi(api);
          setChainStatus("");
        }
      } else {
        toast.info(t("toast.laceNotFound"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.connectLaceFailed"));
    }
  }

  async function activateMidnight() {
    if (wallet.mode !== "lace") {
      toast.error(t("toast.connectLaceFirst"));
      return;
    }
    setChainBusy(true);
    try {
      let api = liveApi;
      if (!api) {
        setChainStatus(t("chain.publishing"));
        api = await lifelineBrowserManager.deploy();
        attachLiveApi(api);
        toast.success(t("toast.contractPublished"));
      }

      if (!chainState?.cycleOpen) {
        setChainStatus(t("chain.creatingCycle"));
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
        setChainStatus(t("chain.registeringCommitment", { current: index + 1, total: state.needs.length }));
        const commitment = await commitmentFor("lifeline:need", need.id);
        try {
          await api.registerNeed(commitment);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (!message.toLowerCase().includes("already registered")) throw error;
        }
      }

      setChainStatus("");
      toast.success(t("toast.cycleRegistered"));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("toast.activateFailed"));
    } finally {
      setChainBusy(false);
    }
  }

  function switchRole() {
    setState((s) => ({ ...s, userRole: s.userRole === "beneficiary" ? "supporter" : "beneficiary" }));
    setView("overview");
    toast.success(state.userRole === "beneficiary" ? t("toast.supporterMode") : t("toast.beneficiaryMode"));
  }

  async function copyPrivateInvite() {
    try {
      const invite = await createPrivateInvite(state, contractAddress, window.location.href);
      await navigator.clipboard.writeText(invite);
      toast.success(t("toast.inviteCopied"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.inviteCreateFailed"));
    }
  }

  async function vote(id: string) {
    if (wallet.mode === "disconnected") { toast.error(t("toast.connectOrDemo")); return; }
    if (state.votedNeedId) { toast.error(t("toast.credentialUsed")); return; }
    const weight = Math.min(state.creditBalance, 100);
    if (wallet.mode === "lace" && liveApi) {
      setChainBusy(true);
      setChainStatus(t("chain.generatingVoteProof"));
      try {
        const commitment = await commitmentFor("lifeline:need", id);
        const receipt = await liveApi.castPrivateVote(commitment, weight);
        setState((s) => ({ ...s, votedNeedId: id, needs: s.needs.map((n) => n.id === id ? { ...n, votes: n.votes + weight } : n) }));
        setProof({ transactionId: receipt.transactionId, commitment: id, network: `Midnight Preprod · ${receipt.contractAddress}` });
        toast.success(t("toast.privateVoteConfirmed", { weight }));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("toast.privateVoteFailed"));
      } finally {
        setChainBusy(false);
        setChainStatus("");
      }
      return;
    }
    setState((s) => ({ ...s, votedNeedId: id, needs: s.needs.map((n) => n.id === id ? { ...n, votes: n.votes + weight } : n) }));
    await createDemoProof({ action: "private-vote", needCommitment: id, weight, nullifier: crypto.randomUUID() });
    toast.success(t("toast.demoVoteRecorded", { weight }));
  }

  async function closeCycle() {
    let result: { transactionId: string; commitment: string; network: string };
    if (wallet.mode === "lace" && liveApi) {
      setChainBusy(true);
      setChainStatus(t("chain.generatingCloseProof"));
      try {
        const commitment = await commitmentFor("lifeline:need", leading.id);
        const receipt = await liveApi.closeCycle(commitment);
        result = { transactionId: receipt.transactionId, commitment: leading.id, network: `Midnight Preprod · ${receipt.contractAddress}` };
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("toast.closeCycleFailed"));
        return;
      } finally {
        setChainBusy(false);
        setChainStatus("");
      }
    } else {
      result = await createDemoProof({ action: "close-cycle", winner: leading.id, total: totalVotes });
    }
    setProof(result);
    setState((s) => ({ ...s, needs: s.needs.map((n) => ({ ...n, status: n.id === leading.id ? "selected" : "voting" })) }));
    setView("result");
    toast.success(t("toast.cycleClosed"));
  }

  function restart() {
    resetState();
    setState(createInitialState(locale));
    setView("overview");
    setProof(null);
    setWallet({ mode: "disconnected", label: "", network: "" });
    toast.success(t("toast.demoRestarted"));
  }

  async function addNeed(need: Need) {
    if (liveApi) {
      setChainBusy(true);
      setChainStatus(t("chain.registeringNeed"));
      try {
        await liveApi.registerNeed(await commitmentFor("lifeline:need", need.id));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("toast.registerNeedFailed"));
        setChainBusy(false);
        setChainStatus("");
        return;
      }
      setChainBusy(false);
      setChainStatus("");
    }
    setState((s) => ({ ...s, needs: [...s.needs, need] }));
    setModal(null);
    toast.success(liveApi ? t("toast.commitmentRegistered") : t("toast.needProtected"));
  }

  const navigation: { id: View; label: string; icon: typeof Home }[] = [
    { id: "overview", label: t("nav.overview"), icon: Home },
    { id: "needs", label: t("nav.needs"), icon: WalletCards },
    { id: "vote", label: t("nav.vote"), icon: Vote },
    { id: "result", label: t("nav.result"), icon: CheckCircle2 },
    { id: "privacy", label: t("nav.privacy"), icon: ShieldCheck },
  ];

  return <div className="shell">
    <aside className={`sidebar ${menu ? "open" : ""}`}>
      <div className="brand"><div className="brandmark"><HeartHandshake size={24}/></div><div><strong>Lifeline</strong><span>{t("brand.tagline")}</span></div></div>
      <button className="close-mobile" onClick={() => setMenu(false)} aria-label={t("nav.closeMenu")}><X/></button>
      <div className="circle-card"><span>{t("sidebar.yourCircle")}</span><strong>{displayState.circleName}</strong><small><i/> {t("sidebar.activeCycle", { cycle: displayState.cycle })}</small></div>
      <nav>{navigation.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setMenu(false); }}><item.icon size={19}/>{item.label}{item.id === "vote" && <em>1</em>}</button>)}</nav>
      <div className="side-bottom">
        <div className="locale-toggle" role="group" aria-label={t("sidebar.language")}>
          {(["en", "pt"] as Locale[]).map((code) => (
            <button key={code} type="button" className={locale === code ? "active" : ""} onClick={() => setLocale(code)} aria-pressed={locale === code}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <button onClick={copyPrivateInvite}><Link2 size={17}/>{t("sidebar.copyInvite")}</button>
        <button onClick={switchRole}><RefreshCcw size={17}/>{state.userRole === "beneficiary" ? t("sidebar.viewAsSupporter") : t("sidebar.viewAsBeneficiary")}</button>
        <button onClick={restart}><LogOut size={17}/>{t("sidebar.restartDemo")}</button>
        <div className="identity"><div>AG</div><span><strong>André Gomes</strong><small>{state.userRole === "beneficiary" ? t("sidebar.beneficiary") : t("sidebar.supporter")}</small></span><ChevronRight size={16}/></div>
      </div>
    </aside>
    <main>
      <header>
        <button className="menu-btn" onClick={() => setMenu(true)}><Menu/></button>
        <div className="mobile-logo">Lifeline</div>
        <div className="header-actions">
          <button className="privacy-toggle" onClick={() => setPrivacy(!privacy)}>
            {privacy ? <EyeOff size={17}/> : <Eye size={17}/>}
            {privacy ? t("privacyToggle.hidden") : t("privacyToggle.visible")}
          </button>
          <button className={`wallet ${wallet.mode !== "disconnected" ? "connected" : ""}`} onClick={connectWallet}>
            <span/><span>{walletDisplayLabel(wallet, t)}</span>
          </button>
        </div>
      </header>
      <section className="content">
        <div className={`network-strip ${wallet.mode === "lace" ? "lace" : "demo"}`}>
          <span/>
          <strong>{wallet.mode === "lace" ? t("wallet.laceConnectedNetwork", { network: wallet.network }) : t("wallet.hackathonDemo")}</strong>
          <small>
            {contractAddress
              ? t("wallet.contractShort", { short: `${contractAddress.slice(0, 8)}…${contractAddress.slice(-6)}` })
              : t("wallet.noBankPayments")}
          </small>
          {wallet.mode === "lace" && (
            <button className="network-action" disabled={chainBusy} onClick={activateMidnight}>
              {contractAddress ? t("wallet.syncCycle") : t("wallet.publishPreprod")}
            </button>
          )}
        </div>
        {chainStatus && <div className="chain-progress"><RefreshCcw/><span>{chainStatus}</span></div>}
        {chainState && (
          <div className="chain-proof">
            <ShieldCheck/>
            <span>
              {t("chain.stateVerified", {
                cycle: chainState.cycleNumber,
                commitments: chainState.registeredNeeds.length,
                weight: chainState.totalVotingWeight,
              })}
            </span>
          </div>
        )}
        {view === "overview" && <Overview state={displayState} privacy={privacy} totalVotes={totalVotes} leading={leading} onView={() => setView("vote")} onNeed={() => setModal("need")} onContribute={() => setModal("contribute")} />}
        {view === "needs" && <Needs state={displayState} privacy={privacy} onNew={() => setModal("need")}/>}
        {view === "vote" && <Voting state={displayState} privacy={privacy} totalVotes={totalVotes} busy={chainBusy} onVote={vote} onClose={closeCycle}/>}
        {view === "result" && <Result state={displayState} leading={leading} proof={proof} onClose={closeCycle}/>}
        {view === "privacy" && <Privacy/>}
      </section>
    </main>
    {modal === "need" && <NeedModal onClose={() => setModal(null)} onAdd={addNeed}/>}
    {modal === "contribute" && (
      <ContributeModal
        onClose={() => setModal(null)}
        onAdd={(amount) => {
          setState((s) => ({ ...s, totalContributed: s.totalContributed + amount, supporters: s.supporters + 1 }));
          setModal(null);
          toast.success(t("toast.creditsAdded", { amount }));
        }}
      />
    )}
  </div>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-title"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

const percentage = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

function Overview({ state, privacy, totalVotes, leading, onView, onNeed, onContribute }: { state: CircleState; privacy: boolean; totalVotes: number; leading: Need; onView: () => void; onNeed: () => void; onContribute: () => void }) {
  const { t, locale, messages } = useLocale();
  const money = (v: number, hidden = false) => formatMoney(messages, locale, v, hidden);
  const isBeneficiary = state.userRole === "beneficiary";
  return <>
    <PageTitle
      eyebrow={isBeneficiary ? t("overview.eyebrowBeneficiary") : t("overview.eyebrowSupporter")}
      title={isBeneficiary ? t("overview.titleBeneficiary") : t("overview.titleSupporter")}
      description={isBeneficiary ? t("overview.descBeneficiary") : t("overview.descSupporter")}
      action={
        <button className="primary" onClick={isBeneficiary ? onNeed : onContribute}>
          {isBeneficiary ? <Plus/> : <HeartHandshake/>}
          {isBeneficiary ? t("overview.newNeed") : t("overview.contribute")}
        </button>
      }
    />
    <div className="metrics">
      <Metric icon={CircleDollarSign} label={t("overview.metricSupport")} value={money(state.totalContributed, privacy)} note={t("overview.metricSupportNote")} tone="sage"/>
      <Metric icon={Users} label={t("overview.metricSupporters")} value={String(state.supporters)} note={t("overview.metricSupportersNote")} tone="blue"/>
      <Metric icon={Vote} label={t("overview.metricParticipation")} value={`${totalVotes} cr.`} note={t("overview.metricParticipationNote")} tone="gold"/>
      <Metric icon={Clock3} label={t("overview.metricCloses")} value={t("overview.metricClosesValue")} note={t("overview.metricClosesNote")} tone="rose"/>
    </div>
    <div className="grid-main">
      <article className="panel vote-summary">
        <div className="panel-head">
          <div><span className="eyebrow">{t("overview.votingEyebrow")}</span><h2>{t("overview.votingTitle")}</h2></div>
          <span className="live"><i/>{t("overview.live")}</span>
        </div>
        <p>{t("overview.votingDesc")}</p>
        <div className="leading">
          <div className="need-icon">{leading.title.slice(0, 1)}</div>
          <div>
            <small>{t("overview.leading")}</small>
            <strong>{leading.title}</strong>
            <span>{leading.category} · {money(leading.amount, privacy)}</span>
          </div>
          <b>{percentage(leading.votes, totalVotes)}%</b>
        </div>
        <div className="progress"><i style={{ width: `${percentage(leading.votes, totalVotes)}%` }}/></div>
        <div className="vote-foot">
          <span>{t("overview.creditsParticipating", { total: totalVotes })}</span>
          <button onClick={onView}>{t("overview.viewVoting")} <ArrowRight size={16}/></button>
        </div>
      </article>
      <article className="panel privacy-panel">
        <div className="shield"><ShieldCheck/></div>
        <h2>{t("overview.privacyTitle")}</h2>
        <p>{t("overview.privacyDesc")}</p>
        <ul>
          <li><Check/>{t("overview.privacyLocal")}</li>
          <li><Check/>{t("overview.privacyVotes")}</li>
          <li><Check/>{t("overview.privacyProfile")}</li>
        </ul>
        <span className="midnight-badge"><Fingerprint/>Secured by Midnight</span>
      </article>
    </div>
    <div className="section-head">
      <div><span>{t("overview.sectionEyebrow")}</span><h2>{t("overview.sectionTitle")}</h2></div>
      <button onClick={onView}>{t("overview.viewAll")} <ArrowRight/></button>
    </div>
    <div className="need-grid">{state.needs.slice(0, 3).map((n) => <NeedCard key={n.id} need={n} privacy={privacy} total={totalVotes}/>)}</div>
  </>;
}

function Metric({ icon: Icon, label, value, note, tone }: { icon: typeof Home; label: string; value: string; note: string; tone: string }) {
  return <article className="metric"><div className={`metric-icon ${tone}`}><Icon/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function NeedCard({ need, privacy, total }: { need: Need; privacy: boolean; total: number }) {
  const { t, locale, messages } = useLocale();
  return (
    <article className="need-card">
      <div className="need-top"><span>{need.category}</span><LockKeyhole/></div>
      <h3>{need.title}</h3>
      <strong>{formatMoney(messages, locale, need.amount, privacy)}</strong>
      <p>{need.impact}</p>
      <div className="need-meta">
        <span><Clock3/>{t("needs.due", { date: need.dueDate })}</span>
        <b>{t("needs.voteShare", { pct: percentage(need.votes, total) })}</b>
      </div>
    </article>
  );
}

function Needs({ state, privacy, onNew }: { state: CircleState; privacy: boolean; onNew: () => void }) {
  const { t } = useLocale();
  const total = state.needs.reduce((s, x) => s + x.votes, 0);
  return <>
    <PageTitle
      eyebrow={t("needs.eyebrow")}
      title={t("needs.title")}
      description={t("needs.description")}
      action={<button className="primary" onClick={onNew}><Plus/>{t("needs.add")}</button>}
    />
    <div className="need-grid large">{state.needs.map((n) => <NeedCard key={n.id} need={n} privacy={privacy} total={total}/>)}</div>
  </>;
}

function Voting({ state, privacy, totalVotes, busy, onVote, onClose }: { state: CircleState; privacy: boolean; totalVotes: number; busy: boolean; onVote: (id: string) => void; onClose: () => void }) {
  const { t, locale, messages } = useLocale();
  return <>
    <PageTitle
      eyebrow={t("voting.eyebrow")}
      title={t("voting.title")}
      description={t("voting.description")}
      action={state.userRole === "beneficiary" ? <button className="secondary" disabled={busy} onClick={onClose}>{t("voting.closeCycle")}</button> : undefined}
    />
    <div className="info-strip">
      <ShieldCheck/>
      <div>
        <strong>{t("voting.howPrivacy")}</strong>
        <span>{t("voting.howPrivacyDesc")}</span>
      </div>
    </div>
    <div className="voting-list">
      {state.needs.map((n) => (
        <article key={n.id} className={`vote-item ${state.votedNeedId === n.id ? "chosen" : ""}`}>
          <div className="vote-letter">{n.title[0]}</div>
          <div className="vote-copy">
            <span>{n.category}</span>
            <h3>{n.title}</h3>
            <p>{n.impact}</p>
            <small><Clock3/>{t("needs.due", { date: n.dueDate })}</small>
          </div>
          <div className="vote-number">
            <strong>{formatMoney(messages, locale, n.amount, privacy)}</strong>
            <span>{t("voting.credits", { votes: n.votes })}</span>
            <div className="mini-progress"><i style={{ width: `${percentage(n.votes, totalVotes)}%` }}/></div>
            {state.userRole === "supporter" && (
              <button disabled={busy || !!state.votedNeedId} onClick={() => onVote(n.id)}>
                {state.votedNeedId === n.id ? <><Check/>{t("voting.yourVote")}</> : t("voting.prioritize")}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  </>;
}

function Result({ leading, proof, onClose }: { state: CircleState; leading: Need; proof: { transactionId: string; commitment: string; network: string } | null; onClose: () => void }) {
  const { t, locale, messages } = useLocale();
  return <>
    <PageTitle eyebrow={t("result.eyebrow")} title={t("result.title")} description={t("result.description")}/>
    {!proof ? (
      <div className="empty-result">
        <Vote/>
        <h2>{t("result.stillOpen")}</h2>
        <p>{t("result.stillOpenDesc")}</p>
        <button className="primary" onClick={onClose}>{t("result.closeDemo")}</button>
      </div>
    ) : (
      <div className="result-card">
        <div className="result-check"><CheckCircle2/></div>
        <span>{t("result.prioritized")}</span>
        <h2>{leading.title}</h2>
        <strong>{formatMoney(messages, locale, leading.amount)}</strong>
        <p>{t("result.approved", { votes: leading.votes })}</p>
        <div className="proof-box">
          <div>
            <Fingerprint/>
            <span><small>{t("result.transaction")}</small><code>{proof.transactionId}</code></span>
            <button onClick={() => { navigator.clipboard.writeText(proof.transactionId); toast.success(t("toast.idCopied")); }}><Copy/></button>
          </div>
          <div>
            <ShieldCheck/>
            <span><small>{t("result.network")}</small><b>{proofNetworkLabel(proof.network, t)}</b></span>
          </div>
        </div>
        <button className="primary" onClick={() => toast.success(t("toast.executionRecorded"))}>{t("result.recordExecution")}</button>
        <small className="disclaimer">{t("result.disclaimer")}</small>
      </div>
    )}
  </>;
}

function Privacy() {
  const { t, messages } = useLocale();
  return <>
    <PageTitle eyebrow={t("privacy.eyebrow")} title={t("privacy.title")} description={t("privacy.description")}/>
    <div className="privacy-grid">
      <PrivacyCard icon={LockKeyhole} title={t("privacy.staysPrivate")} items={[...messages.privacy.privateItems]}/>
      <PrivacyCard icon={Fingerprint} title={t("privacy.proven")} items={[...messages.privacy.provenItems]}/>
      <PrivacyCard icon={ShieldCheck} title={t("privacy.verifiable")} items={[...messages.privacy.verifiableItems]}/>
    </div>
    <div className="manifesto">
      <Sparkles/>
      <div>
        <h2>{t("privacy.manifestoTitle")}</h2>
        <p>{t("privacy.manifestoDesc")}</p>
      </div>
    </div>
  </>;
}

function PrivacyCard({ icon: Icon, title, items }: { icon: typeof Home; title: string; items: string[] }) {
  return <article className="privacy-card"><Icon/><h3>{title}</h3><ul>{items.map((x) => <li key={x}><Check/>{x}</li>)}</ul></article>;
}

function ModalShell({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: React.ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X/></button>
        <span>{t("modal.protected")}</span>
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
      </div>
    </div>
  );
}

function NeedModal({ onClose, onAdd }: { onClose: () => void; onAdd: (n: Need) => void }) {
  const { t, messages } = useLocale();
  const categoryOptions = [
    messages.categories.essential,
    messages.categories.highInterest,
    messages.categories.work,
    messages.categories.longTerm,
  ];
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  return (
    <ModalShell title={t("modal.needTitle")} description={t("modal.needDesc")} onClose={onClose}>
      <label>
        {t("modal.description")}
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("modal.descriptionPlaceholder")}/>
      </label>
      <div className="form-row">
        <label>
          {t("modal.amount")}
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t("modal.amountPlaceholder")}/>
        </label>
        <label>
          {t("modal.category")}
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categoryOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <button
        className="primary full"
        disabled={!title || !amount}
        onClick={() => onAdd({
          id: crypto.randomUUID(),
          title,
          amount: Number(amount),
          category,
          dueDate: t("modal.needDue"),
          impact: t("modal.needImpact"),
          votes: 0,
          status: "voting",
        })}
      >
        <LockKeyhole/>{t("modal.protectAdd")}
      </button>
    </ModalShell>
  );
}

function ContributeModal({ onClose, onAdd }: { onClose: () => void; onAdd: (n: number) => void }) {
  const { t } = useLocale();
  const [amount, setAmount] = useState(50);
  const weight = Math.min(amount, 100);
  return (
    <ModalShell title={t("modal.contributeTitle")} description={t("modal.contributeDesc")} onClose={onClose}>
      <div className="amounts">
        {[10, 50, 100, 500].map((x) => (
          <button key={x} className={amount === x ? "active" : ""} onClick={() => setAmount(x)}>{x} cr.</button>
        ))}
      </div>
      <div className="weight-note">
        <Vote/>
        <span>
          {t("modal.weightPrefix")} <strong>{t("modal.weightStrong", { weight })}</strong>. {t("modal.weightSuffix")}
        </span>
      </div>
      <button className="primary full" onClick={() => onAdd(amount)}>
        <HeartHandshake/>{t("modal.confirmSupport")}
      </button>
    </ModalShell>
  );
}
