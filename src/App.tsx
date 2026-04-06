import './App.css';
import { supabase } from './supabase'; // 아까 만든 설정 파일 불러오기

interface TripItem {
  id?: number;
  content: string;
  amount: number;
  date: string;
  category: string;
}

function App() {
  const [list, setList] = useState<TripItem[]>([]);
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState('');

  // 1. 앱이 켜질 때 실행되는 함수
  useEffect(() => {
    fetchData();
  }, []);

  // 2. 데이터 가져오기 (금고에서 데이터 꺼내오기)
  const fetchData = async () => {
    // 우선 온라인 금고(Supabase)에서 데이터를 가져옵니다.
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      // 만약 금고가 비어있고, 내 컴퓨터(localStorage)에 옛날 데이터가 있다면?
      const localData = localStorage.getItem('trips');
      if ((!data || data.length === 0) && localData) {
        const parsedLocal = JSON.parse(localData);
        // 이사하기: 로컬 데이터를 수파베이스로 몽땅 업로드!
        await migrateData(parsedLocal);
      } else {
        setList(data || []);
      }
    }
  };

  // 3. 이사 코드 (로컬 -> 수파베이스)
  const migrateData = async (oldData: TripItem[]) => {
    const { error } = await supabase.from('trips').insert(oldData);
    if (!error) {
      localStorage.removeItem('trips'); // 이사 완료 후 옛날 짐은 버리기
      fetchData(); // 다시 새로고침
    }
  };

  // 4. 새 데이터 추가하기
  const addEntry = async () => {
    if (!content || !amount) return;

    const newItem = {
      content,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      category: '일반',
    };

    const { error } = await supabase.from('trips').insert([newItem]);
    
    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      setContent('');
      setAmount('');
      fetchData(); // 등록 후 다시 목록 가져오기
    }
  };

  return (
    <div className="App">
      <h1>✈️ 여행 경비 (동기화 중)</h1>
      <div className="input-group">
        <input 
          placeholder="내용 (예: 점심식사)" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="금액" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
        />
        <button onClick={addEntry}>추가</button>
      </div>

      <div className="list">
        {list.map((item, index) => (
          <div key={item.id || index} className="item">
            <span>{item.content}</span>
            <span>{item.amount.toLocaleString()}원</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;