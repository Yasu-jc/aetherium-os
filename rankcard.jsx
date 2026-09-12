import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Misma fórmula que en tu bot para calcular el rango de xp de un nivel
const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;

function xpRange(level, multiplier = 2) {
  if (level < 0) level = 0;
  level = Math.floor(level);
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(level + 1, growth) * multiplier);
  return { min, max, xp: max - min };
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);

    // ---- Parámetros de entrada ----
    const name = searchParams.get('name') || 'Usuario';
    const level = num(searchParams.get('level'), 0);
    const exp = num(searchParams.get('exp'), 0);
    const rank = searchParams.get('rank') || '?';
    const commands = num(searchParams.get('commands'), 0);
    const multiplier = num(searchParams.get('multiplier'), 2);
    const avatar =
      searchParams.get('avatar') ||
      'https://ui-avatars.com/api/?background=random&name=' + encodeURIComponent(name);

    // ---- Cálculo de progreso (misma lógica del comando) ----
    const { min, xp } = xpRange(level, multiplier);
    const progresoActual = Math.max(0, exp - min);
    const porcentaje = xp > 0 ? Math.min(100, Math.floor((progresoActual / xp) * 100)) : 0;

    return new ImageResponse(
      (
        <div
          style={{
            width: '900px',
            height: '300px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '40px',
            background: 'linear-gradient(135deg, #1e1b2e 0%, #2d1b3d 50%, #1a1a2e 100%)',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Decoración: círculos de fondo */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '260px',
              height: '260px',
              borderRadius: '9999px',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-80px',
              right: '120px',
              width: '200px',
              height: '200px',
              borderRadius: '9999px',
              background: 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
            }}
          />

          {/* Avatar */}
          <div
            style={{
              display: 'flex',
              width: '200px',
              height: '200px',
              borderRadius: '9999px',
              padding: '6px',
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              marginRight: '40px',
            }}
          >
            <img
              src={avatar}
              width={188}
              height={188}
              style={{
                borderRadius: '9999px',
                objectFit: 'cover',
                border: '4px solid #1a1a2e',
              }}
            />
          </div>

          {/* Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              zIndex: 1,
            }}
          >
            {/* Nombre + rank */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 42,
                  fontWeight: 700,
                  color: '#ffffff',
                  maxWidth: '480px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 22px',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#facc15',
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                #{rank}
              </div>
            </div>

            {/* Nivel y exp */}
            <div
              style={{
                display: 'flex',
                gap: '28px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', color: '#c4b5fd', fontSize: 26, fontWeight: 600 }}>
                Nivel {level}
              </div>
              <div style={{ display: 'flex', color: '#93c5fd', fontSize: 26, fontWeight: 600 }}>
                {exp.toLocaleString()} EXP
              </div>
              <div style={{ display: 'flex', color: '#9ca3af', fontSize: 26, fontWeight: 500 }}>
                {commands.toLocaleString()} comandos
              </div>
            </div>

            {/* Barra de progreso */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '34px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: `${porcentaje}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #a855f7, #3b82f6)',
                }}
              />
            </div>

            {/* Texto debajo de la barra */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px',
              }}
            >
              <div style={{ display: 'flex', color: '#d1d5db', fontSize: 22 }}>
                {progresoActual.toLocaleString()} / {xp.toLocaleString()} XP
              </div>
              <div style={{ display: 'flex', color: '#d1d5db', fontSize: 22, fontWeight: 700 }}>
                {porcentaje}%
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 900,
        height: 300,
      }
    );
  } catch (e) {
    return new Response(`Error generando la imagen: ${e.message}`, { status: 500 });
  }
}
