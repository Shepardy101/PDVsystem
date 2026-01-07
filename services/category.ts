export async function listCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Erro ao buscar categorias');
  return res.json();
}
