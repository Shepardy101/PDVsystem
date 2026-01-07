export async function createSupplier(supplier) {
  const res = await fetch('/api/suppliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier)
  });
  if (!res.ok) throw new Error('Erro ao criar fornecedor');
  return res.json();
}

export async function updateSupplier(id, supplier) {
  const res = await fetch(`/api/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier)
  });
  if (!res.ok) throw new Error('Erro ao atualizar fornecedor');
  return res.json();
}

export async function deleteSupplier(id) {
  const res = await fetch(`/api/suppliers/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar fornecedor');
  return res.json();
}

export async function listSuppliers() {
  const res = await fetch('/api/suppliers');
  if (!res.ok) throw new Error('Erro ao buscar fornecedores');
  return res.json();
}
