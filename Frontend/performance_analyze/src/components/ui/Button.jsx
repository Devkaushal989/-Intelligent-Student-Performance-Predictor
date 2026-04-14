function Button({ children, variant = 'primary', className = '', ...props }) {
  const variantClass =
    variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'danger'
        ? 'btn-danger'
        : 'btn-primary';

  return (
    <button type="button" className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default Button;
