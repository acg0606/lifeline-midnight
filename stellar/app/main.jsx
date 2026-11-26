import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BusFront, Check, ChevronDown, CircleAlert,
  CircleCheck, CircleX, ExternalLink, Fingerprint, Globe2, Lightbulb,
  Link2, LoaderCircle, LockKeyhole, Network, Repeat2, ShieldCheck,
} from 'lucide-react';
import sample from './ballot.json';
import circleWide from './assets/circle-wide.webp';
import circleSmall from './assets/circle-small.webp';
import './style.css';

const rounds = Object.values(import.meta.glob('../evidence/*.json', { eager: true, import: 'default' }));
const round = rounds.find(item => String(item.cycle) === sample.signals[3]);
const options = [{ name: 'Conta de luz', Icon: Lightbulb }, { name: 'Transporte', Icon: BusFront }];
const explorer = 'https://stellar.expert/explorer/testnet';
const outcomes = {
  valid: { label: 'Voto aceito', Icon: CircleCheck, tone: 'accepted' },
  invalid: { label: 'Prova inválida rejeitada', Icon: CircleX, tone: 'rejected' },
  repeat: { label: 'Voto repetido bloqueado', Icon: Repeat2, tone: 'replayed' },
};
const feedback = {
  valid: { text: 'Prova válida para a conta de luz.', Icon: CircleCheck },
  invalid: { text: 'Prova inválida para transporte. O destino faz parte do voto.', Icon: CircleX },
  error: { text: 'Falha ao verificar a prova. Tente novamente.', Icon: CircleAlert },
};

function Header() {
  return <header className="site-header"><div className="frame masthead">
    <a className="brand" href="#inicio" aria-label="Lifeline, início"><span className="brand-icon" aria-hidden="true"><Link2/></span>Lifeline</a>
    <nav aria-label="Navegação da rodada"><a href="#verificacao">Verificação</a><a href="#recibos">Recibos</a></nav>
    <span className="network"><Network size={15} aria-hidden="true"/> Stellar Testnet</span>
  </div></header>;
}

function Intro() {
  return <section className="hero" aria-labelledby="titulo">
    <picture className="hero-art"><source media="(max-width: 600px)" srcSet={circleSmall}/><img src={circleWide} width="1100" height="733" alt="" fetchPriority="high"/></picture>
    <div className="hero-copy"><p className="eyebrow"><span aria-hidden="true"/>Rodada de demonstração</p>
      <h1 id="titulo">Círculo de apoio</h1>
      <p className="hero-description">Qual despesa o círculo decidiu priorizar? Confira a prova do voto e o resultado registrado na rede.</p>
      <a className="hero-action" href="#verificacao">Conferir um voto <ArrowDown size={16} aria-hidden="true"/></a>
    </div>
  </section>;
}

function ProofPanel() {
  const [choice, setChoice] = useState(0);
  const [status, setStatus] = useState('ready');
  const message = feedback[status];
  const busy = status === 'checking';
  async function verify(event) {
    event.preventDefault();
    if (busy) return;
    setStatus('checking');
    try {
      const { groth16 } = await import('snarkjs');
      const signals = [...sample.signals];
      signals[4] = sample.needs[choice];
      const accepted = await groth16.verify(sample.vk, signals, sample.proof);
      setStatus(accepted ? 'valid' : 'invalid');
    } catch { setStatus('error'); }
  }
  return <section id="verificacao" tabIndex="-1" className="panel proof" aria-labelledby="proof-heading">
    <div className="section-label"><Fingerprint size={16} aria-hidden="true"/> No seu dispositivo</div>
    <h2 id="proof-heading">Verificar a prova</h2>
    <p className="summary">A prova foi gerada para a conta de luz. Escolha uma despesa para conferir se ela corresponde ao voto.</p>
    <form onSubmit={verify}><fieldset disabled={busy}><legend>Despesa informada</legend>
      <div className="choices">{options.map(({ name, Icon }, i) =>
        <label key={name} className="choice">
          <input type="radio" name="despesa" checked={choice === i} onChange={() => { setChoice(i); setStatus('ready'); }}/>
          <span className="choice-content"><Icon size={20} aria-hidden="true"/><span>{name}</span>
            <span className="choice-mark" aria-hidden="true">{choice === i && <Check size={11} strokeWidth={3}/>}</span>
          </span>
        </label>
      )}</div>
    </fieldset>
      <button className="verify" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spinner" size={18}/> : <ShieldCheck size={18}/>}
        {busy ? 'Verificando…' : 'Verificar prova localmente'}</button>
    </form>
    <div role="status" aria-live="polite" aria-atomic="true">
      {message && <div className={'feedback ' + status}><message.Icon size={18} aria-hidden="true"/>{message.text}</div>}
    </div>
  </section>;
}

function ResultPanel() {
  const [first, second] = round?.tally ?? [0, 0];
  const total = first + second;
  const share = total ? first / total * 100 : 0;
  return <section className="panel result" aria-labelledby="result-heading">
    <div className="section-label"><Network size={16} aria-hidden="true"/> Resultado na rede</div>
    <h2 id="result-heading">Decisão do círculo</h2>
    {round ? <>
      <div className="result-meta"><span className="closed"><span/>Rodada encerrada</span><span>Créditos fictícios</span></div>
      <div className="scores">{options.map(({ name, Icon }, i) => <div className={'score score-' + i} key={name}>
        <span className="score-number">{round.tally[i]}</span><span className="score-name"><Icon size={15} aria-hidden="true"/>{name}</span>
      </div>)}</div>
      <div className="share-track" aria-hidden="true"><span style={{width: share + '%'}}/></div>
      <a className="text-link" href="#recibos">Ver recibos da rodada <ArrowRight size={16} aria-hidden="true"/></a>
    </> : <p className="summary">Esta amostra ainda não tem recibos de transações confirmadas.</p>}
  </section>;
}

function ReceiptSection() {
  const receipts = round?.receipts.filter(item => outcomes[item.label]) ?? [];
  return <section className="receipts" id="recibos" tabIndex="-1" aria-labelledby="receipts-heading">
    <div className="receipt-intro"><div className="section-label"><Link2 size={16} aria-hidden="true"/> Stellar Testnet</div>
      <h2 id="receipts-heading">Recibos da rodada</h2>
      <p className="summary">Abra cada transação para conferir o que o contrato registrou.</p>
      {round && <a className="contract-link" href={explorer + '/contract/' + round.contractId} target="_blank" rel="noreferrer">
        Ver contrato <ArrowUpRight size={14} aria-hidden="true"/></a>}
    </div>
    {receipts.length ? <ul className="ledger">{receipts.map(receipt => {
      const { label, Icon, tone } = outcomes[receipt.label];
      return <li key={receipt.hash}><a href={explorer + '/tx/' + receipt.hash} target="_blank" rel="noreferrer">
        <span className={'receipt-icon ' + tone}><Icon size={19} aria-hidden="true"/></span>
        <span className="receipt-name">{label}</span>
        <small>Ledger {receipt.ledger}</small><ExternalLink className="external" size={15} aria-hidden="true"/>
      </a></li>;
    })}</ul> : <p className="summary">Nenhum recibo disponível para esta amostra.</p>}
  </section>;
}

function Privacy() {
  return <details className="privacy"><summary><LockKeyhole size={17} aria-hidden="true"/>O que fica privado?<ChevronDown size={17} aria-hidden="true"/></summary>
    <div className="privacy-grid"><div><LockKeyhole size={18}/><h3>No dispositivo</h3><p>O nome do credor, o valor da dívida e o segredo do apoiador ficam fora do registro público.</p></div>
      <div><Globe2 size={18}/><h3>Na rede</h3><p>A conta remetente, a escolha codificada e o peso do voto podem ser consultados na Stellar Testnet.</p></div></div>
  </details>;
}

function App() {
  return <><a className="skip" href="#verificacao">Ir para a verificação</a><Header/>
    <main className="frame" id="inicio"><Intro/><div className="workspace"><ProofPanel/><ResultPanel/></div>
      <ReceiptSection/><Privacy/>
    </main></>;
}
createRoot(document.getElementById('root')).render(<App/>);
