import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [items, setItems] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data, error } = await supabase
      .from('trips') // 수파베이스 표 이름이 'trips'가 맞는지 꼭 확인!
      .select('*')
      .order('id', { ascending: false })
    
    if (error) {
      console.error('불러오기 에러:', error)
    } else {
      setItems(data || [])
    }
  }

  async function addItem() {
    if (!content || !amount) return alert('내용과 금액을 입력해주세요!')

    // insert 안에 들어가는 이름들이 수파베이스 표의 칸 이름과 똑같아야 해요!
    const { error } = await supabase
      .from('trips')
      .insert([{ 
        content: content, 
        amount: Number(amount) 
      }])

    if (error) {
      alert('저장 실패: ' + error.message)
      console.error('저장 에러:', error)
    } else {
      setContent('')
      setAmount('')
      fetchData() // 저장 후 목록 새로고침
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>✈️ 여행 가계부</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input
          placeholder="내용 (예: 점심 식사)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ padding: '10px' }}
        />
        <input
          type="number"
          placeholder="금액 (예: 15000)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '10px' }}
        />
        <button onClick={addItem} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
          추가하기
        </button>
      </div>
      <hr />
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item: any) => (
          <li key={item.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.content}</span>
            <span>{item.amount?.toLocaleString()}원</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App