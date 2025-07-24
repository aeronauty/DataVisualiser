import React, { useState, useRef, useEffect } from 'react'

interface MultiSelectProps {
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  label?: string
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select fields...",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedValues.includes(option)
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOptionClick = (option: string) => {
    onChange([...selectedValues, option])
    setSearchTerm('')
  }

  const handleRemoveSelected = (option: string) => {
    onChange(selectedValues.filter(val => val !== option))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleOptionClick(filteredOptions[0])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  return (
    <div className="multi-select" ref={containerRef}>
      {label && <label className="multi-select-label">{label}</label>}
      
      <div className="multi-select-container">
        <div className="multi-select-selected">
          {selectedValues.map(value => (
            <span key={value} className="multi-select-tag">
              {value}
              <button
                type="button"
                onClick={() => handleRemoveSelected(value)}
                className="multi-select-tag-remove"
              >
                ×
              </button>
            </span>
          ))}
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedValues.length === 0 ? placeholder : ''}
            className="multi-select-input"
          />
        </div>

        {isOpen && (
          <div className="multi-select-dropdown">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option}
                  className="multi-select-option"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="multi-select-no-options">
                {searchTerm ? 'No matching options' : 'All options selected'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MultiSelect
