-- Datos de la cuenta desde la que transfiere el comprador (para verificar el pago)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS acct_origin text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS acct_holder text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS acct_number text;