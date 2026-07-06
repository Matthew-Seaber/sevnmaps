function PerkRow({
  label,
  value,
  included,
}: {
  label: string;
  value: string;
  included: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 flex-1">
        <div>
            <p className="text-sm">{label}</p>
        </div>
      </div>
      {value && <p className="text-right">{value}</p>}
    </div>
  );
}

export default PerkRow;
