import { ImageResponse } from 'next/og'


export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0d0d',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <span style={{ fontSize: '100px', fontWeight: 900, color: '#ffffff' }}>uni</span>
          <span style={{ fontSize: '100px', fontWeight: 900, color: '#63b3ed' }}>can</span>
        </div>
        <div style={{ display: 'flex', fontSize: '32px', color: 'rgba(255,255,255,0.5)' }}>
          大学生のためのクローズドコミュニティ
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
