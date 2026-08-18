import { Check, Hourglass, X } from "lucide-react";

function PerkRow({
  label,
  value,
  included,
  soon,
}: {
  label: string;
  value: string | null;
  included: boolean;
  soon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-7 sm:gap-9 md:gap-11 lg:gap-13 xl:gap-15">
      <div
        title={soon ? "Coming soon!" : undefined}
        className="flex items-center gap-3 flex-1"
      >
        <div className="flex gap-2 items-center">
          <div
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${included ? "bg-primary" : "bg-slate-200"}`}
          >
            {included ? (
              <Check strokeWidth={3} className="size-3 text-white" />
            ) : !soon ? (
              <X strokeWidth={3} className="size-3 text-white" />
            ) : (
              <Hourglass strokeWidth={3} className="size-2.5 text-white" />
            )}
          </div>
          <p className="text-sm font-semibold">{label}</p>
        </div>
      </div>
      {value && (
        <p className="text-right text-sm text-nowrap font-semibold">{value}</p>
      )}
    </div>
  );
}

export default PerkRow;
