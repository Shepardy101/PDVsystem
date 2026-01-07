export async function deleteClient(id) {
  const res = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar cliente');
  return res.json();
}
export async function createClient(client) {
  const res = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client)
  });
  if (!res.ok) throw new Error('Erro ao criar cliente');
  return res.json();
}

export async function updateClient(id, client) {
  const res = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client)
  });
  if (!res.ok) throw new Error('Erro ao atualizar cliente');
  return res.json();
}

export async function listClients() {
  const res = await fetch('/api/clients');
  if (!res.ok) throw new Error('Erro ao buscar clientes');
  return res.json();
}
