export const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const getInitials = (firstName, lastName) => `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
export const classNames = (...classes) => classes.filter(Boolean).join(' ');