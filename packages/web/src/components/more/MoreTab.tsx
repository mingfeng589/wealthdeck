import type { Policy } from '@wealthdeck/shared';
import { InsuranceSection } from './InsuranceSection';
import { TaxLens } from './TaxLens';
import { IdentityLens } from './IdentityLens';

interface MoreTabProps {
  onAddPolicy: () => void;
  onEditPolicy: (p: Policy) => void;
  onDeletePolicy: (id: string) => void;
}

export function MoreTab({ onAddPolicy, onEditPolicy, onDeletePolicy }: MoreTabProps) {
  return (
    <>
      <InsuranceSection
        onAddPolicy={onAddPolicy}
        onEditPolicy={onEditPolicy}
        onDeletePolicy={onDeletePolicy}
      />
      <TaxLens />
      <IdentityLens />
      <div className="warn">
        ⚠️ 本页税务、身份与保险内容为一般性信息整理（知识截至 2025 年中，政策随时调整），不构成税务、法律、移民、保险或投资建议。重大决策前请咨询持牌专业人士，并以官方最新公布为准。
      </div>
    </>
  );
}
