import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [items, setItems] = useState<any[]>([])
  const [text, setText] = useState('')
  const [amount, setAmount] = useState('')

  // 1. 데이터 불러오기
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data, error } = await supabase
      .from('trip_money')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) console.error('Error fetching:', error)
    else setItems(data || [])
  }

  // 2. 데이터 추가하기
  async function addItem() {
    if (!text || !amount) return alert('내용과 금액을 입력해주세요!')

    const { error } = await supabase
      .from('trip_money')
      .insert([{ text, amount: Number(amount) }])

    if (error) {
      console.error('Error inserting:', error)
    } else {
      setText('')
      setAmount('')
      fetchData()
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>✈️ 여행 가계부</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input
          placeholder="내용 (예: 점심 식사)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '10px' }}
        />
        <input
          type="number"
          placeholder="금액 (예: 15000)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '10px' }}
        />
        <button 
          onClick={addItem}
          style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          추가하기
        </button>
      </div>

      <hr />

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item: any) => (
          <li key={item.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.text}</span>
            <span style={{ fontWeight: 'bold' }}>{item.amount.toLocaleString()}원</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App