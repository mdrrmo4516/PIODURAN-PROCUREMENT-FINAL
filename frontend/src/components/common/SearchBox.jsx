import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

export const SearchBox = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="flex items-center bg-foreground/10 rounded-lg px-4 py-2">
      <Search className="w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 ml-2 w-48"
      />
    </div>
  );
};
