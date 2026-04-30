-- ============================================================
--  SGV-Roble · Sistema de Gestión de Visitantes
--  Esquema PostgreSQL
--  Universidad Autónoma de Occidente · 2026
-- ============================================================

-- Extensión para UUIDs (opcional, se usa SERIAL por defecto)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  TABLA: usuarios  (Vigilantes y Administradores del sistema)
-- ============================================================
CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100)        NOT NULL,
    documento       VARCHAR(20)         NOT NULL UNIQUE,   -- cédula o documento de identidad
    contrasena_hash VARCHAR(255)        NOT NULL,           -- bcrypt hash
    rol             VARCHAR(20)         NOT NULL DEFAULT 'vigilante'
                        CHECK (rol IN ('vigilante', 'administrador')),
    turno           VARCHAR(20)                            -- 'dia', 'noche', NULL para admins
                        CHECK (turno IN ('dia', 'noche') OR turno IS NULL),
    correo          VARCHAR(150),
    activo          BOOLEAN             NOT NULL DEFAULT TRUE,
    intentos_fallidos INT              NOT NULL DEFAULT 0,
    bloqueado_hasta TIMESTAMPTZ,                           -- bloqueo temporal (RF-06)
    creado_en       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLA: visitantes  (personas externas que visitan el edificio)
-- ============================================================
CREATE TABLE visitantes (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100)        NOT NULL,
    documento       VARCHAR(20)         NOT NULL UNIQUE,   -- número de documento
    correo          VARCHAR(150),                          -- para notificaciones
    telefono        VARCHAR(20),
    frecuente       BOOLEAN             NOT NULL DEFAULT FALSE,
    visitas_totales INT                 NOT NULL DEFAULT 0,
    creado_en       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLA: visitas  (cada registro de ingreso/salida)
-- ============================================================
CREATE TABLE visitas (
    id                  SERIAL PRIMARY KEY,
    visitante_id        INT             NOT NULL REFERENCES visitantes(id) ON DELETE RESTRICT,
    apartamento         VARCHAR(20)     NOT NULL,          -- apto a visitar, ej: "301"
    residente_responsable VARCHAR(100)  NOT NULL,          -- nombre del residente que autoriza
    hora_ingreso        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    hora_salida         TIMESTAMPTZ,                       -- NULL = aún dentro del edificio
    usuario_ingreso_id  INT             NOT NULL REFERENCES usuarios(id),  -- vigilante que registró entrada
    usuario_salida_id   INT             REFERENCES usuarios(id),           -- vigilante que registró salida
    observaciones       TEXT,
    estado              VARCHAR(20)     NOT NULL DEFAULT 'dentro'
                            CHECK (estado IN ('dentro', 'salio')),
    creado_en           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLA: residentes  (propietarios/arrendatarios de cada apartamento)
-- ============================================================
CREATE TABLE residentes (
    id              SERIAL PRIMARY KEY,
    apartamento     VARCHAR(20)  NOT NULL UNIQUE,
    nombre          VARCHAR(100) NOT NULL,
    correo          VARCHAR(150) NOT NULL,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
--  ÍNDICES  (mejoran rendimiento en búsquedas frecuentes)
-- ============================================================

-- Búsqueda de visitantes por documento (login rápido y autocompletado)
CREATE INDEX idx_visitantes_documento ON visitantes(documento);

-- Filtrar visitas del día actual
CREATE INDEX idx_visitas_hora_ingreso ON visitas(hora_ingreso);

-- Visitas activas (personas dentro ahora)
CREATE INDEX idx_visitas_estado ON visitas(estado);

-- Historial por apartamento
CREATE INDEX idx_visitas_apartamento ON visitas(apartamento);

-- Historial por visitante
CREATE INDEX idx_visitas_visitante_id ON visitas(visitante_id);

-- Búsqueda de usuarios por documento (para login)
CREATE INDEX idx_usuarios_documento ON usuarios(documento);

-- Buscar residente por apartamento (para notificaciones)
CREATE INDEX idx_residentes_apartamento ON residentes(apartamento);

-- ============================================================
--  FUNCIÓN: actualizar campo updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar automáticamente actualizado_en
CREATE TRIGGER trg_usuarios_updated
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_visitantes_updated
    BEFORE UPDATE ON visitantes
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_visitas_updated
    BEFORE UPDATE ON visitas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_residentes_updated
    BEFORE UPDATE ON residentes
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
--  FUNCIÓN: incrementar contador de visitas del visitante
-- ============================================================
CREATE OR REPLACE FUNCTION fn_incrementar_visitas()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE visitantes
    SET visitas_totales = visitas_totales + 1
    WHERE id = NEW.visitante_id;

    -- Si supera 3 visitas, marcar como frecuente automáticamente
    UPDATE visitantes
    SET frecuente = TRUE
    WHERE id = NEW.visitante_id
      AND visitas_totales >= 3;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contar_visita
    AFTER INSERT ON visitas
    FOR EACH ROW EXECUTE FUNCTION fn_incrementar_visitas();

-- ============================================================
--  DATOS INICIALES (seed)
-- ============================================================

-- Usuario administrador por defecto
-- Contraseña: Admin2026! (hash bcrypt con 10 rounds — reemplazar en producción)
INSERT INTO usuarios (nombre, documento, contrasena_hash, rol, correo)
VALUES (
    'Administrador SGV',
    '0000000000',
    '$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_HASH',
    'administrador',
    'admin@sgv-roble.com'
);

-- Vigilante de ejemplo
INSERT INTO usuarios (nombre, documento, contrasena_hash, rol, turno, correo)
VALUES (
    'Jorge Castaño',
    '1094382811',
    '$2b$10$PLACEHOLDER_REPLACE_WITH_REAL_HASH',
    'vigilante',
    'dia',
    'jorge.castano@sgv-roble.com'
);

-- ============================================================
--  VISTAS ÚTILES
-- ============================================================

-- Personas actualmente dentro del edificio
CREATE VIEW v_dentro_ahora AS
SELECT
    vi.id AS visita_id,
    vt.nombre AS visitante,
    vt.documento,
    vi.apartamento,
    vi.residente_responsable,
    vi.hora_ingreso,
    u.nombre AS registrado_por
FROM visitas vi
JOIN visitantes vt ON vt.id = vi.visitante_id
JOIN usuarios u    ON u.id  = vi.usuario_ingreso_id
WHERE vi.estado = 'dentro';

-- Historial completo con nombres
CREATE VIEW v_historial AS
SELECT
    vi.id AS visita_id,
    vt.nombre AS visitante,
    vt.documento,
    vi.apartamento,
    vi.residente_responsable,
    vi.hora_ingreso,
    vi.hora_salida,
    vi.estado,
    ui.nombre AS vigilante_ingreso,
    us.nombre AS vigilante_salida,
    vi.observaciones,
    EXTRACT(EPOCH FROM (COALESCE(vi.hora_salida, NOW()) - vi.hora_ingreso)) / 60 AS duracion_minutos
FROM visitas vi
JOIN visitantes vt       ON vt.id = vi.visitante_id
JOIN usuarios ui         ON ui.id = vi.usuario_ingreso_id
LEFT JOIN usuarios us    ON us.id = vi.usuario_salida_id;

-- Visitantes frecuentes con última visita
CREATE VIEW v_frecuentes AS
SELECT
    vt.id,
    vt.nombre,
    vt.documento,
    vt.correo,
    vt.visitas_totales,
    MAX(vi.hora_ingreso) AS ultima_visita,
    MAX(vi.apartamento)  AS ultimo_apartamento
FROM visitantes vt
LEFT JOIN visitas vi ON vi.visitante_id = vt.id
WHERE vt.frecuente = TRUE
GROUP BY vt.id;