function FormSlider({ label, value, onChange }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-blue-600">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Not interested</span>
        <span>Very interested</span>
      </div>
    </div>
  );
}

export default FormSlider;