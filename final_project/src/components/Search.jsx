import { useState } from "react";

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value); 
  };

  return (
    <input
      type="text"
      value={query}
      onChange={handleChange}
      placeholder="Search incidents..."
      className="border rounded-md"
    />
  );
};

export default Search;