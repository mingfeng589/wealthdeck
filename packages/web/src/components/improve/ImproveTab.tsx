import type { HoldingValuation, Holding } from '@wealthdeck/shared';
import { PortfolioStats } from './PortfolioStats';
import { PortfolioScore } from './PortfolioScore';
import { CorrelationMatrix } from './CorrelationMatrix';

interface ImproveTabProps {
  rows: Array<{ h: Holding } & HoldingValuation>;
  total: number;
}

export function ImproveTab({ rows, total }: ImproveTabProps) {
  return (
    <>
      <PortfolioStats rows={rows} total={total} />
      <PortfolioScore rows={rows} total={total} />
      <CorrelationMatrix rows={rows} />
    </>
  );
}
