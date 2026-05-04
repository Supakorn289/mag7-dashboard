import { createClient } from '@supabase/supabase-js';

// 🔑 เชื่อมต่อ Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ปิดการแคช เพื่อดึงข้อมูลสดใหม่เสมอ
export const revalidate = 0; 

export default async function Home() {
  // ดึงข้อมูลล่าสุด 7 ตัว
  const { data: stocks, error } = await supabase
    .from('mag7_prices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(7);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-red-500">
        <p className="text-xl font-bold p-6 bg-red-500/10 rounded-2xl border border-red-500/20">
          ❌ เกิดข้อผิดพลาด: {error.message}
        </p>
      </div>
    );
  }

  // หาวันที่อัปเดตล่าสุดจากข้อมูลตัวแรก
  const lastUpdated = stocks && stocks.length > 0 
    ? new Date(stocks[0].created_at).toLocaleString('th-TH', { 
        timeZone: 'Asia/Bangkok',
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }) 
    : 'ไม่มีข้อมูล';

  return (
    <main className="min-h-screen bg-[#0a0f1c] text-slate-200 font-sans pb-12 selection:bg-blue-500/30">
      
      {/* 🚀 Navigation Bar สไตล์กระจกฝ้า */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0f1c]/70 border-b border-white/5 px-6 py-4 mb-8 shadow-2xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              M7
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Mag 7 Tracker</h1>
          </div>
          <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
            <span className="hidden sm:inline">อัปเดตล่าสุด: </span>{lastUpdated}
          </div>
        </div>
      </nav>

      {/* 📊 Content Area */}
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header Section */}
        <header className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300 mb-3">
            Magnificent 7 Stocks
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl">
            ติดตามความเคลื่อนไหวของ 7 บริษัทเทคโนโลยีที่ขับเคลื่อนโลกแบบ Real-time พร้อมวิเคราะห์การเปลี่ยนแปลงรายวัน
          </p>
        </header>
        
        {/* Grid Cards (Responsive 1 คอลัมน์บนมือถือ, 2-3 คอลัมน์บนจอใหญ่) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stocks?.map((stock) => {
            const isUp = stock.change_amount > 0;
            const isNeutral = stock.change_amount === 0;
            
            return (
              <div 
                key={stock.id} 
                className="group relative overflow-hidden bg-white/[0.02] p-6 rounded-3xl border border-white/[0.05] shadow-lg hover:shadow-2xl hover:bg-white/[0.04] transition-all duration-300 ease-out hover:-translate-y-1"
              >
                {/* แสง Glow ด้านหลังการ์ด */}
                <div className={`absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                  isUp ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`} aria-hidden="true" />
                
                <div className="relative flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-white tracking-widest">{stock.ticker}</h3>
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm ${
                    isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    isNeutral ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : 
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {isUp ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    )}
                    <span>{Math.abs(stock.change_percent).toFixed(2)}%</span>
                  </div>
                </div>
                
                <div className="relative">
                  <p className="text-slate-400 text-sm mb-1 font-medium">ราคาปิด (USD)</p>
                  <div className="text-4xl font-light text-white tracking-tight mb-2">
                    ${parseFloat(stock.price).toFixed(2)}
                  </div>
                  
                  <div className={`flex items-center gap-2 text-sm font-medium ${
                    isUp ? 'text-emerald-400' : isNeutral ? 'text-slate-400' : 'text-red-400'
                  }`}>
                    <span className="px-2 py-0.5 rounded-md bg-white/5">
                      {isUp ? '+' : ''}{stock.change_amount}
                    </span>
                    <span className="text-slate-500 text-xs">เทียบกับเมื่อวาน</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </main>
  );
}
