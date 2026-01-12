-- Adiciona a coluna client_id na tabela sales para vincular vendas a clientes
ALTER TABLE sales ADD COLUMN client_id TEXT REFERENCES clients(id);
