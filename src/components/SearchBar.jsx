import React from 'react';

// Controlled SearchBar. Parent should pass value/setValue and type/setType
export default function SearchBar({ value, onChange, type, onTypeChange, placeholder = 'Search books' }) {
  return (
    <form className="search-bar" onSubmit={(e) => e.preventDefault()} aria-label="search-form">
      <div className="search-controls">
        <select value={type} onChange={(e) => onTypeChange && onTypeChange(e.target.value)} aria-label="search-type">
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="subject">Subject</option>
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="search-input"
        />
        <button type="button" onClick={() => onChange && onChange('')}>Clear</button>
      </div>
    </form>
  );
}
