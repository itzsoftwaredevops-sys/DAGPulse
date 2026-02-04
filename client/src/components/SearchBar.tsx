import { useState } from "react";
import { Search, X } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search validator address or block number..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        if (query.startsWith("0x") || query.length === 42) {
          setLocation(`/miners/${query.trim()}`);
        } else if (!isNaN(Number(query))) {
          setLocation(`/blocks/${query.trim()}`);
        }
      }
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <Card
      className={`relative mx-auto w-full max-w-2xl overflow-hidden transition-all ${
        isFocused ? "ring-2 ring-primary/50" : ""
      }`}
      data-testid="card-search"
    >
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="pointer-events-none absolute left-4 flex h-12 items-center">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="h-12 w-full bg-transparent pl-12 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          data-testid="input-search"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 flex h-12 items-center hover-elevate active-elevate-2"
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-2 flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          data-testid="button-search"
        >
          Search
        </button>
      </form>

      {isFocused && !query && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        </div>
      )}
    </Card>
  );
}
