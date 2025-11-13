import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="chocolate-icon">🍫</div>
      </div>
      <p className="loading-text">Carregando...</p>
    </div>
  );
};

export default LoadingSpinner;

