export default function SearchBar({ value, onChange, onClear, placeholder = 'Pesquisar...' }) {
  return (
    <div className="section-actions">
      <label className="search">
        <span className="sr-only">Pesquisar</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </label>
      {value && (
        <button type="button" className="btn-secondary" onClick={onClear}>
          Limpar
        </button>
      )}
    </div>
  );
}
