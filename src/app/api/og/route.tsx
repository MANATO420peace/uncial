import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'row', background: '#0d0d0d' }}>
        {/* 左カラム */}
        <div style={{
          width: '420px', height: '630px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'flex-start', padding: '0 60px',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          background: 'radial-gradient(ellipse at 10% 80%, rgba(66,153,225,0.18) 0%, transparent 70%)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', fontSize: '80px', fontWeight: 900, color: '#ffffff', letterSpacing: '-2px' }}>uni</div>
            <div style={{ display: 'flex', fontSize: '80px', fontWeight: 900, color: '#63b3ed', letterSpacing: '-2px' }}>can</div>
          </div>
          <div style={{ display: 'flex', fontSize: '13px', color: 'rgba(255,255,255,0.3)', letterSpacing: '4px', marginTop: '14px' }}>UNIVERSITY CAMPUS</div>
        </div>
        {/* 右カラム */}
        <div style={{
          flex: 1, height: '630px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'flex-start', padding: '0 72px',
          background: 'radial-gradient(ellipse at 90% 20%, rgba(159,122,234,0.18) 0%, transparent 60%)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: '44px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px' }}>大学生だけの</div>
            <div style={{ display: 'flex', fontSize: '44px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', marginTop: '4px' }}>クローズドコミュニティ</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '28px' }}>
            <div style={{ display: 'flex', fontSize: '20px', color: 'rgba(255,255,255,0.45)' }}>楽単・テスト情報・フリマ・時間割など</div>
            <div style={{ display: 'flex', fontSize: '20px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>キャンパスライフを充実させる場所</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', marginTop: '44px' }}>
            {['掲示板', 'フリマ', '時間割', 'メッセージ'].map(label => (
              <div key={label} style={{
                display: 'flex',
                background: 'rgba(66,153,225,0.15)',
                border: '1px solid rgba(66,153,225,0.4)',
                color: '#63b3ed',
                borderRadius: '10px',
                padding: '10px 22px',
                fontSize: '18px',
                fontWeight: 600,
              }}>{label}</div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
