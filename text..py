import yfinance as yf
import requests
import datetime
import json

# ==========================================
# ⚙️ 1. ตั้งค่าพื้นฐาน
# ==========================================
TARGET_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'SPCX']

API_URL = "https://mag7-dashboard-two.vercel.app/api/update-stock"
SECRET_KEY = "SupakornSecureKey2026"

CHANNEL_ACCESS_TOKEN = 'f2buLmJEC31P/rlxyWuWPw0KG66VB6oeAj/2mC4pTjs/RHpehm4dVVxT1ALsI47y6EqqhiOIpGIjeU4oHIJK6t5hs0rxQ+uWe13d1QfhR8Bttyr7MXe4LyTXkzASmbjiDHzxE6TyJCLwJ+Tgnc/MLgdB04t89/1O/w1cDnyilFU='
USER_ID = 'U1c2440eb3db35068d485bc977d401cf5'

def send_to_api(payload):
    headers = {"Authorization": f"Bearer {SECRET_KEY}", "Content-Type": "application/json"}
    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        if response.status_code == 200:
            print(f"✅ บันทึก {payload['ticker']} ลงฐานข้อมูลสำเร็จ")
        else:
            print(f"❌ API Error ({payload['ticker']}): {response.status_code} {response.text}")
    except Exception as e:
        print(f"❌ ไม่สามารถเชื่อมต่อ API ได้: {e}")

def send_line_push(text):
    url = 'https://api.line.me/v2/bot/message/push'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {CHANNEL_ACCESS_TOKEN}'
    }
    payload = {'to': USER_ID, 'messages': [{'type': 'text', 'text': text}]}
    try:
        requests.post(url, headers=headers, data=json.dumps(payload))
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการส่ง LINE: {e}")

# ==========================================
# 🚀 3. เริ่มการทำงานหลัก
# ==========================================
def main():
    print(f"--- เริ่มอัปเดตข้อมูล: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---")
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")
    line_message = f"📊 สรุปพอร์ต Mag 7 + SpaceX\nประจำวันที่ {today_str}\n\n"

    for ticker in TARGET_STOCKS:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="5d")
            closes = hist['Close'].dropna()
            
            if len(closes) >= 2:
                prev_price = float(closes.iloc[-2])
                current_price = float(closes.iloc[-1])
                
                change_amount = round(current_price - prev_price, 2)
                change_percent = round((change_amount / prev_price) * 100, 2)
                current_price = round(current_price, 2)
                
                # 📰 ส่วนที่เพิ่มเข้ามา: ดึงข่าวล่าสุด 3 ข่าว (เวอร์ชันกันกระสุน)
                news_list = []
                raw_news = stock.news
                if raw_news:
                    for n in raw_news:
                        # 1. ป้องกันกรณีที่ n เป็น None หรือไม่ใช่ดิกชันนารี
                        if not isinstance(n, dict):
                            continue
                        
                        # 2. ป้องกันกรณีที่ content เป็น None
                        content = n.get("content") or {}
                        
                        title = n.get("title") or content.get("title", "")
                        
                        click_through = content.get("clickThroughUrl") or {}
                        link = n.get("link") or click_through.get("url", "")
                        
                        provider = content.get("provider") or {}
                        publisher = n.get("publisher") or provider.get("displayName", "Yahoo Finance")

                        # ✅ บันทึกเฉพาะอันที่มี 'ชื่อข่าว' และ 'ลิงก์' จริงๆ
                        if title and link:
                            news_list.append({
                                "title": title,
                                "link": link,
                                "publisher": publisher
                            })
                            
                        # เอาแค่ 3 ข่าวพอ
                        if len(news_list) >= 3:
                            break

                # นำ news_list ใส่เข้าไปใน Payload ที่จะส่งให้ API
                payload = {
                    "ticker": ticker,
                    "price": current_price,
                    "change_amount": change_amount,
                    "change_percent": change_percent,
                    "inflation_rate": 0,
                    "is_private": False,
                    "news": news_list  # ส่งก้อนข่าวไปด้วย
                }
                
                send_to_api(payload)
                
                sign = "📈" if change_amount > 0 else "📉"
                line_message += f"{sign} {ticker}: ${current_price} ({change_percent}%)\n"
            else:
                print(f"⚠️ ข้อมูล {ticker} ไม่เพียงพอ")
                
        except Exception as e:
            print(f"❌ Error {ticker}: {e}")

    line_message += "\n🌐 ดู Dashboard เต็มๆ ได้ที่:\nhttps://mag7-dashboard-two.vercel.app/"
    send_line_push(line_message)
    print("--- อัปเดตข้อมูลเสร็จสมบูรณ์ ---")

if __name__ == "__main__":
    main()