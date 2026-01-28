import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIES } from '../db/seeds/categories.seeds';
import { PRODUCTS } from '../db/seeds/products.seeds';

/**
 * Seeder Service
 * Generates 30 days of realistic mock data for PDVsystem demonstration.
 */
export async function seedDemoData() {
    console.log('[Seeder] Starting demo seeding...');

    try {
        // 1. Clear existing dynamic data (keep settings and IPS)
        db.prepare('PRAGMA foreign_keys = OFF').run();
        const tablesToClear = [
            'sales', 'sale_items', 'payments', 'stock_movements',
            'cash_sessions', 'cash_movements', 'products', 'categories', 'logs'
        ];
        for (const table of tablesToClear) {
            db.prepare(`DELETE FROM "${table}"`).run();
            try { db.prepare(`DELETE FROM sqlite_sequence WHERE name=?`).run(table); } catch { }
        }
        db.prepare('PRAGMA foreign_keys = ON').run();

        // 2. Ensure Users (Operators)
        const operators = [
            { id: 'op_joao', name: 'João Silva', email: 'joao@loja.com', role: 'operator', pass: '123' },
            { id: 'op_maria', name: 'Maria Souza', email: 'maria@loja.com', role: 'operator', pass: '123' }
        ];

        for (const op of operators) {
            const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(op.id);
            if (!exists) {
                db.prepare(`INSERT INTO users (id, name, email, role, status, password) VALUES (?, ?, ?, ?, 'active', ?)`)
                    .run(op.id, op.name, op.email, op.role, op.pass);
            }
        }

        // 3. Insert Categories
        const insertCat = db.prepare('INSERT INTO categories (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)');
        const now = Date.now();
        for (const cat of CATEGORIES) {
            insertCat.run(cat.id, cat.name, now, now);
        }

        // 4. Insert Products
        const insertProd = db.prepare(`
      INSERT INTO products (
        id, name, ean, internal_code, unit, cost_price, sale_price, 
        auto_discount_enabled, auto_discount_value, category_id, 
        status, stock_on_hand, created_at, updated_at, type, min_stock
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'active', ?, ?, ?, 'product', ?)
    `);

        const productIds: string[] = [];
        for (const p of PRODUCTS) {
            const id = uuidv4();
            productIds.push(id);
            insertProd.run(
                id, p.name, p.ean, p.code, p.unit, p.cost, p.sale,
                p.categoryId, 1000, now, now, 10
            );
        }

        // 5. Generate 30 Days of History (January 2026)
        const startDate = new Date(2026, 0, 1, 8, 0, 0); // Jan 1st, 2026 08:00

        // Prepared Statements for performance
        const stmtSession = db.prepare(`INSERT INTO cash_sessions (id, operator_id, opened_at, initial_balance, is_open, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)`);
        const stmtCloseSession = db.prepare(`UPDATE cash_sessions SET closed_at = ?, is_open = 0, physical_count_at_close = ?, difference_at_close = ?, updated_at = ? WHERE id = ?`);
        const stmtSale = db.prepare(`INSERT INTO sales (id, timestamp, operator_id, cash_session_id, subtotal, discount_total, total, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)`);
        const stmtItem = db.prepare(`INSERT INTO sale_items (id, sale_id, product_id, product_name_snapshot, product_internal_code_snapshot, product_ean_snapshot, unit_snapshot, quantity, unit_price_at_sale, auto_discount_applied, manual_discount_applied, final_unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`);
        const stmtPay = db.prepare(`INSERT INTO payments (id, sale_id, method, amount, created_at) VALUES (?, ?, ?, ?, ?)`);
        const stmtStock = db.prepare(`INSERT INTO stock_movements (id, product_id, type, quantity, reason, reference_type, reference_id, timestamp) VALUES (?, ?, 'sale_out', ?, 'Venda PDV', 'sale', ?, ?)`);
        const stmtCashMov = db.prepare(`INSERT INTO cash_movements (id, cash_session_id, type, direction, amount, description, timestamp, reference_type, reference_id, created_at) VALUES (?, ?, 'sale_inflow', 'in', ?, 'Venda PDV', ?, 'sale', ?, ?)`);

        for (let day = 0; day < 30; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + day);

            const sessionId = uuidv4();
            const operator = operators[day % 2]; // Alternate operators
            const openTime = currentDate.getTime();
            const initialBalance = 10000; // 100.00 base

            stmtSession.run(sessionId, operator.id, openTime, initialBalance, openTime, openTime);

            // Generate 20-40 sales per day
            const salesCount = 20 + Math.floor(Math.random() * 20);
            let dayTotal = 0;

            for (let s = 0; s < salesCount; s++) {
                const saleId = uuidv4();
                const saleTime = openTime + (s * 15 * 60 * 1000) + Math.floor(Math.random() * 600000); // roughly every 15-20 mins

                const saleItems = [];
                let subtotal = 0;
                const itemCount = 1 + Math.floor(Math.random() * 8);

                for (let i = 0; i < itemCount; i++) {
                    const productIndex = Math.floor(Math.random() * productIds.length);
                    const productId = productIds[productIndex];
                    const product = PRODUCTS[productIndex];
                    const qty = 1 + Math.floor(Math.random() * 3);
                    const lineTotal = qty * product.sale;

                    subtotal += lineTotal;
                    saleItems.push({ productId, product, qty, lineTotal });
                }

                // Insert Sale FIRST to satisfy Foreign Key constraints
                stmtSale.run(saleId, saleTime, operator.id, sessionId, subtotal, 0, subtotal, saleTime);

                for (const item of saleItems) {
                    stmtItem.run(
                        uuidv4(), saleId, item.productId, item.product.name, item.product.code, item.product.ean,
                        item.product.unit, item.qty, item.product.sale, item.product.sale, item.lineTotal
                    );

                    // Stock movement
                    stmtStock.run(uuidv4(), item.productId, item.qty, saleId, saleTime);
                }

                // Payments (mixed)
                const methods: ('cash' | 'pix' | 'card')[] = ['cash', 'pix', 'card'];
                const method = methods[Math.floor(Math.random() * methods.length)];
                stmtPay.run(uuidv4(), saleId, method, subtotal, saleTime);

                // Cash flow (only for cash payments)
                if (method === 'cash') {
                    dayTotal += subtotal;
                    stmtCashMov.run(uuidv4(), sessionId, subtotal, saleTime, saleId, saleTime);
                }
            }

            // Close session at end of day (8 hours later)
            const closeTime = openTime + (8 * 3600 * 1000);
            let physicalCount = initialBalance + dayTotal;
            let difference = 0;

            // Add discrepancies on Specific days (e.g., day 10 and 20)
            if (day === 10) {
                difference = -500; // Missing 5.00
                physicalCount += difference;
            } else if (day === 20) {
                difference = 250; // Extra 2.50
                physicalCount += difference;
            }

            stmtCloseSession.run(closeTime, physicalCount, difference, closeTime, sessionId);
        }

        console.log('[Seeder] Demo seeding completed successfully.');
        return { success: true, message: 'Dados de demonstração populados com sucesso!' };
    } catch (error: any) {
        console.error('[Seeder] Error seeding demo data:', error);
        throw error;
    }
}
