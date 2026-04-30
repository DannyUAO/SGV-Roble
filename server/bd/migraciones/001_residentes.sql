-- ============================================================
--  Migración 001: tabla residentes
--  Ejecutar sobre una BD existente de SGV-Roble
-- ============================================================

CREATE TABLE IF NOT EXISTS residentes (
    id              SERIAL PRIMARY KEY,
    apartamento     VARCHAR(20)  NOT NULL UNIQUE,
    nombre          VARCHAR(100) NOT NULL,
    correo          VARCHAR(150) NOT NULL,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_residentes_apartamento ON residentes(apartamento);

CREATE TRIGGER trg_residentes_updated
    BEFORE UPDATE ON residentes
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
