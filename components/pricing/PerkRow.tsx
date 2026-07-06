import { Check, X } from "lucide-react";

function PerkRow({
  label,
  value,
  included,
}: {
  label: string;
  value: string | null;
  included: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-7 sm:gap-9 md:gap-11 lg:gap-13 xl:gap-15">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex gap-2 items-center">
          <div
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${included ? "bg-primary" : "bg-slate-200"}`}
          >
            {included ? (
              <Check
                strokeWidth={3}
                className="w-3 h-3 text-white"
              />
            ) : (
              <X strokeWidth={3} className="w-3 h-3 text-white" />
            )}
          </div>
          <p className="text-sm font-semibold">{label}</p>
        </div>
      </div>
      {value && <p className="text-right text-sm text-nowrap font-semibold">{value}</p>}
    </div>
  );
}

export default PerkRow;
