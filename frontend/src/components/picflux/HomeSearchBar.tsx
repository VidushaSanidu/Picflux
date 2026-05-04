"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";

export function HomeSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch() {
    const q = query.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  }

  return (
    <div className="glass-panel mt-8 flex max-w-2xl items-center gap-3 rounded-full p-2">
      <Search className="ml-4 size-5 text-muted-foreground" />
      <input
        className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        placeholder="Search birds, wild cats, pets, marine life..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <Button variant="hero" onClick={handleSearch}>Search</Button>
    </div>
  );
}
