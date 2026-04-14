function Badge({ children, variant = 'neutral', className = '' }) {
  const classes =
    variant === 'high'
      ? 'risk-badge risk-high'
      : variant === 'medium'
        ? 'risk-badge risk-medium'
        : variant === 'low'
          ? 'risk-badge risk-low'
          : 'risk-badge';

  return <span className={`${classes} ${className}`.trim()}>{children}</span>;
}

export default Badge;
