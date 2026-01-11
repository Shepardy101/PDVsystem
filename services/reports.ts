// Serviço para buscar dados do mix de produtos (quadrantes)
export async function fetchProductMix(from: number, to: number) {
  const url = `/api/reports/product-mix?from=${from}&to=${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar dados do mix de produtos');
  const data = await res.json();
  // Normalizar campos
  return (Array.isArray(data) ? data : data.products || []).map((p: any) => ({
    ...p,
    frequency: Number(p.frequency),
    total_quantity: Number(p.total_quantity),
    total_value: Number(p.total_value),
    cost_price: Number(p.cost_price || 0),
    sale_price: Number(p.sale_price || 0),
  }));
}
