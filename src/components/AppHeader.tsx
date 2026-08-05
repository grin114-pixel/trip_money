import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        background: '#e0f2fe',
      }}
    >
      <Link
        to="/"
        aria-label="홈으로"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
          color: 'inherit',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <img
          src="/header-icon.png"
          alt=""
          width={44}
          height={44}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            flexShrink: 0,
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: 'calc(28px * 0.7 * 1.1)',
            fontWeight: 800,
            color: '#1e40af',
          }}
        >
          우리가족 여행경비
        </h2>
      </Link>
    </div>
  )
}
