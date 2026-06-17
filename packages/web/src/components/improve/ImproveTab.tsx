import type { HoldingValuation, Holding } from '@wealthdeck/shared';
import { PortfolioStats } from './PortfolioStats';

interface ImproveTabProps {
  rows: Array<{ h: Holding } & HoldingValuation>;
  total: number;
}

export function ImproveTab({ rows, total }: ImproveTabProps) {
  return (
    <>
      <PortfolioStats rows={rows} total={total} />
    </>
  );
}
