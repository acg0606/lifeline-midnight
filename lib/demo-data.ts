import { CircleState } from "./types";

export const initialState: CircleState = {
  circleName: "Círculo Recomeço",
  cycle: "Julho 2026",
  creditBalance: 100,
  supporters: 4,
  totalContributed: 390,
  userRole: "beneficiary",
  needs: [
    { id: "energy", title: "Energia elétrica", category: "Essencial", amount: 240, dueDate: "22 jul", impact: "Evitar interrupção de um serviço essencial para a família.", votes: 100, status: "voting" },
    { id: "card", title: "Cartão de crédito", category: "Juros altos", amount: 780, dueDate: "25 jul", impact: "Reduzir a dívida com maior crescimento mensal.", votes: 190, status: "voting" },
    { id: "internet", title: "Internet residencial", category: "Trabalho", amount: 130, dueDate: "20 jul", impact: "Manter conectividade para entrevistas e trabalho remoto.", votes: 50, status: "voting" },
    { id: "loan", title: "Empréstimo pessoal", category: "Longo prazo", amount: 1200, dueDate: "30 jul", impact: "Amortizar o saldo de uma obrigação de longo prazo.", votes: 50, status: "voting" }
  ]
};
