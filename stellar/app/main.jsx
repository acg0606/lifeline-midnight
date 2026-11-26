import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import sample from './ballot.json';
import '../app/style.css';

const rounds = Object.values(import.meta.glob('../evidence/*.json', { eager:true, import:'default' }));
const round = rounds.find(item => String(item.cycle) === sample.signals[3]);
const actions = {valid:'Voto aceito', invalid:'Prova inválida rejeitada', repeat:'Voto repetido bloqueado'};
const choices = ['Conta de luz', 'Transporte'];
const short = value => value.slice(0, 7) + '…' + value.slice(-6);

function Console() {
  const [choice, setChoice] = useState(0);
  const [status, setStatus] = useState('ready');
  async function verify() {
    setStatus('checking');
    try {
      const { groth16 } = await import('snarkjs');
      const signals = [...sample.signals];
      signals[4] = sample.needs[choice];
      setStatus(await groth16.verify(sample.vk, signals, sample.proof) ? 'valid' : 'invalid');
    } catch {
      setStatus('error');
    }
  }
  return <><header><div className="frame brand">Lifeline <span>Stellar Testnet</span></div></header>
    <main className="frame"><h1>Círculo de apoio</h1>
      <p className="lead">Uma rodada de demonstração para decidir qual despesa priorizar. Os votos usam créditos fictícios.</p>
      <div className="columns">
        <section><h2>Conferir um voto</h2><p>A prova desta rodada foi gerada para a conta de luz. Escolha a despesa e confira o que a mesma prova valida no seu dispositivo.</p>
          <fieldset disabled={status === 'checking'}><legend>Despesa informada</legend>{choices.map((label, i) => <label key={label} className={choice === i ? 'option active' : 'option'}>
            <input type="radio" name="need" checked={choice === i} onChange={()=>{setChoice(i); setStatus('ready');}}/>{label}
          </label>)}</fieldset>
          <button disabled={status === 'checking'} onClick={verify}>{status === 'checking' ? 'Verificando…' : 'Verificar prova localmente'}</button>
          <p className={'status ' + status} aria-live="polite">{({
            valid:'Prova válida para a conta de luz.',
            invalid:'Prova inválida para transporte. O destino faz parte do voto.',
            error:'A verificação falhou ao carregar. Tente novamente.',
            checking:'Calculando a verificação Groth16…'
          })[status]}</p>
        </section>
        <section><h2>Registros da testnet</h2>
          {round ? <><p>O contrato encerrou a rodada com o seguinte placar.</p>
            <div className="totals">{choices.map((label, i) => <div key={label}><strong>{round.tally[i]}</strong>{label}</div>)}</div>
            <ul>{round.receipts.filter(r => actions[r.label]).map(r => <li key={r.hash}>
              <a href={'https://stellar.expert/explorer/testnet/tx/' + r.hash} target="_blank" rel="noreferrer">{actions[r.label]} ↗</a>
              <small>Ledger {r.ledger}</small></li>)}</ul>
            <small>Contrato <a href={'https://stellar.expert/explorer/testnet/contract/' + round.contractId} target="_blank" rel="noreferrer">{short(round.contractId)}</a></small>
          </> : <p>Esta amostra ainda não tem recibos de transações confirmadas.</p>}
        </section></div>
      <footer>O credor, o valor da dívida e o segredo do apoiador ficam fora do registro público. A rede exibe a conta remetente, a escolha codificada e o peso do voto.</footer>
    </main></>;
}
createRoot(document.getElementById('root')).render(<Console/>);
