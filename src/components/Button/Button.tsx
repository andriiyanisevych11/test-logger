import "./Button.css";

const Button = ({ children, onClick, className }) => {
  return (
    <button className={`button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
