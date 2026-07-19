export type NeedStatus = "voting" | "selected" | "resolved";

export type Need = {
  id: string;
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  impact: string;
  votes: number;
  status: NeedStatus;
};

export type CircleState = {
  circleName: string;
  cycle: string;
  creditBalance: number;
  supporters: number;
  totalContributed: number;
  userRole: "beneficiary" | "supporter";
  votedNeedId?: string;
  needs: Need[];
};
