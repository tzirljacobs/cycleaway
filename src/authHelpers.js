// This function will be expanded later based on Supabase auth roles
export function getUserRole(user) {
  if (!user) return null;

  // Placeholder logic – will change later
  return user.email === 'admin@cycleaway.com' ? 'employee' : 'customer';
}
