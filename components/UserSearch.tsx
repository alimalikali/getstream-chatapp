'use client';

import { useState, useEffect } from "react";

export function UserSearch({ onSelect }: { onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // ⏳ Debounce: wait 400ms after typing stops
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      clearTimeout(handler); // cleanup old timer
    };
  }, [query]);

  // 🔍 Run search when debouncedQuery updates
  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(`/api/users/search?q=${debouncedQuery}`);
        const data = await res.json();
        setResults(data.users ?? []);
        console.log(results[0],"test");
         // API returns { users: [] }
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
    };

    fetchUsers();
  }, [debouncedQuery]);

  return (
    <div className="p-2 border-b bg-gray-50">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)} // no API call here
        placeholder="Search users..."
        className="w-full p-2 border rounded"
      />
      {results.length > 0 && (
        <ul className="mt-2 bg-white border rounded shadow">
          {results.map((u) => (
            <li
              key={u.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect(u.id)}
            >
              {u.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
