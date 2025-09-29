import { useState } from "react";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const SearchBar = ({ placeholder = "Search...", onSearch, className }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className={cn("relative", className)}>
      <ApperIcon 
        name="Search" 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" 
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleSearch}
        className="pl-10 pr-4"
      />
    </div>
  );
};

export default SearchBar;