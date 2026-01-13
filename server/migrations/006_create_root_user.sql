-- Migration para criar o usuário root
INSERT INTO users (username, password, role, created_at)
VALUES ('root', 'root', 'admin', CURRENT_TIMESTAMP);
