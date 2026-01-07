export async function updateUser(id, user) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Erro ao atualizar usuário');
  return res.json();
}
// services/user.ts
export async function createUser(user) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Erro ao criar usuário');
  return res.json();
}

export async function listUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Erro ao buscar usuários');
  return res.json();
}
