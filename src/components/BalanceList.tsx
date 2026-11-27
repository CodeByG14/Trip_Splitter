import type { Member } from "../types";
import { formatRupees } from "../logic/money";

type BalanceListProps = {
  members: Member[];
  balances: Record<string, number>;
};

export function BalanceList({ members, balances }: BalanceListProps) {
  return (
    <div className="balance-list">
      {members.map((member) => {
        const balance = balances[member.id] || 0;
        const absBalance = Math.abs(balance);

        let text: string;
        let className = "balance-item";

        if (balance > 0) {
          text = `${member.name} gets back ${formatRupees(absBalance)}`;
          className += " balance-gets-back";
        } else if (balance < 0) {
          text = `${member.name} owes ${formatRupees(absBalance)}`;
          className += " balance-owes";
        } else {
          text = `${member.name} is settled up`;
        }

        return (
          <div key={member.id} className={className}>
            {text}
          </div>
        );
      })}
    </div>
  );
}
