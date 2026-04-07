interface SearchBarProps {
  defaultValue?: string;
  compact?: boolean;
}

export function SearchBar({ defaultValue, compact = false }: SearchBarProps) {
  return (
    <form action="/products" className={`search-bar ${compact ? "compact" : ""}`}>
      <input
        aria-label="Buscar produtos"
        defaultValue={defaultValue}
        name="query"
        placeholder="Buscar por nome do produto"
        type="search"
      />
      <button className="primary-button" type="submit">
        Buscar
      </button>
    </form>
  );
}
