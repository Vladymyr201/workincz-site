import React, { useState } from 'react';

const TestComponent = ({ title, onSave }) => {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(value);
      setValue('');
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="test-component">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter some text"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default TestComponent; 