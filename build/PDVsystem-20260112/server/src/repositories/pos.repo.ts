import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export function finalizeSale(saleData: any) {
  const now = Date.now();
  const saleId = uuidv4();
  const { operatorId, cashSessionId, items, payments, subtotal, discountTotal, total, clientId } = saleData;
  const tx = db.transaction(() => {
    // 1. Grava venda
    db.prepare(`INSERT INTO sales (id, timestamp, operator_id, cash_session_id, subtotal, discount_total, total, status, created_at, client_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`)
      .run(saleId, now, operatorId, cashSessionId, subtotal, discountTotal, total, now, clientId || null);
    // 2. Grava itens
    for (const item of items) {
      // Garante que o código interno e o EAN nunca sejam nulos ou vazios (especialmente para serviços)
      const internalCode = item.productInternalCode && item.productInternalCode !== '' ? item.productInternalCode : '-';
      const ean = item.productEan && item.productEan !== '' ? item.productEan : '-';
      db.prepare(`INSERT INTO sale_items (id, sale_id, product_id, product_name_snapshot, product_internal_code_snapshot, product_ean_snapshot, unit_snapshot, quantity, unit_price_at_sale, auto_discount_applied, manual_discount_applied, final_unit_price, line_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(uuidv4(), saleId, item.productId, item.productName, internalCode, ean, item.unit, item.quantity, item.unitPrice, item.autoDiscountApplied, item.manualDiscountApplied, item.finalUnitPrice, item.lineTotal);
      // 3. Atualiza estoque
      db.prepare('UPDATE products SET stock_on_hand = stock_on_hand - ? WHERE id = ?')
        .run(item.quantity, item.productId);
      // 4. Grava movimento de estoque
      db.prepare(`INSERT INTO stock_movements (id, product_id, type, quantity, reason, reference_type, reference_id, timestamp)
        VALUES (?, ?, 'sale_out', ?, 'Venda', 'sale', ?, ?)`)
        .run(uuidv4(), item.productId, item.quantity, saleId, now);
    }
    // 5. Grava pagamentos
    for (const pay of payments) {
      db.prepare(`INSERT INTO payments (id, sale_id, method, amount, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`)
        .run(uuidv4(), saleId, pay.method, pay.amount, pay.metadataJson || null, now);
    }

    // 6. Grava movimento de caixa
    let cashMovementRegistered = false;
    for (const pay of payments) {
      if (pay.method === 'cash' && pay.metadataJson) {
        const meta = JSON.parse(pay.metadataJson);
        const cashReceivedCents = meta.cashReceivedCents;
        // Entrada: valor recebido
        db.prepare(`INSERT INTO cash_movements (id, cash_session_id, type, direction, amount, description, timestamp, reference_type, reference_id, metadata_json, created_at)
          VALUES (?, ?, 'sale_inflow', 'in', ?, 'Venda (dinheiro recebido)', ?, 'sale', ?, ?, ?)`)
          .run(uuidv4(), cashSessionId, cashReceivedCents, now, saleId, pay.metadataJson, now);
        cashMovementRegistered = true;
      }
    }
    // Se não registrou cash custom, registra entrada padrão (Pix/Cartão ou cash sem metadata)
    if (!cashMovementRegistered) {
      db.prepare(`INSERT INTO cash_movements (id, cash_session_id, type, direction, amount, description, timestamp, reference_type, reference_id, metadata_json, created_at)
        VALUES (?, ?, 'sale_inflow', 'in', ?, 'Venda', ?, 'sale', ?, NULL, ?)`)
        .run(uuidv4(), cashSessionId, total, now, saleId, now);
    }
    return saleId;
  });
  return tx();
}
