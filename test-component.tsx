import React from 'react';

interface TestComponentProps {
  title: string;
  onClick?: () => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ title, onClick }) => {
  return (
    <div className="test-component">
      <h1>{title}</h1>
      <button onClick={onClick} data-testid="test-button">
        Click me
      </button>
    </div>
  );
};

export default TestComponent;