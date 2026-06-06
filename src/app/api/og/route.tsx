import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'row', background: '#0d0d0d' }}>
        {/* 左カラム */}
        <div style={{ width: '420px', height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '0 60px', borderRight: '1px solid rgba(255,255,255,0.08)', background: 'radial-gradient(ellipse at 10% 80%, rgba(66,153,225,0.12) 0%, transparent 70%)' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', fontSize: '76px', fontWeight: 900, color: '#ffffff' }}>uni</div>
            <div style={{ display: 'flex', fontSize: '76px', fontWeight: 900, color: '#63b3ed' }}>can</div>
          </div>
          <div style={{ display: 'flex', fontSize: '14px', color: 'rgba(255,255,255,0.3)', letterSpacing: '4px', marginTop: '12px' }}>UNIVERSITY CAMPUS</div>
        </div>
        {/* 右カラム */}
        <div style={{ flex: 1, height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '0 64px', background: 'radial-gradient(ellipse at 90% 20%, rgba(159,122,234,0.15) 0%, transparent 60%)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: '40px', fontWeight: 800, color: '#ffffff' }}>大学生だけの</div>
            <div style={{ display: 'flex', fontSize: '40px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>クローズドコミュニティ</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '24px' }}>
            <div style={{ display: 'flex', fontSize: '20px', color: 'rgba(255,255,255,0.45)' }}>楽単・テスト情報・フリマ・時間割など</div>
            <div style={{ display: 'flex', fontSize: '20px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>キャンパスライフを充実させる場所</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', marginTop: '40px' }}>
            <div style={{ display: 'flex', background: 'rgba(66,153,225,0.15)', border: '1px solid rgba(66,153,225,0.35)', color: '#63b3ed', borderRadius: '8px', padding: '8px 20px', fontSize: '17px', fontWeight: 600 }}>掲示板</div>
            <div style={{ display: 'flex', background: 'rgba(66,153,225,0.15)', border: '1px solid rgba(66,153,225,0.35)', color: '#63b3ed', borderRadius: '8px', padding: '8px 20px', fontSize: '17px', fontWeight: 600 }}>フリマ</div>
            <div style={{ display: 'flex', background: 'rgba(66,153,225,0.15)', border: '1px solid rgba(66,153,225,0.35)', color: '#63b3ed', borderRadius: '8px', padding: '8px 20px', fontSize: '17px', fontWeight: 600 }}>時間割</div>
            <div style={{ display: 'flex', background: 'rgba(66,153,225,0.15)', border: '1px solid rgba(66,153,225,0.35)', color: '#63b3ed', borderRadius: '8px', padding: '8px 20px', fontSize: '17px', fontWeight: 600 }}>メッセージ</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
