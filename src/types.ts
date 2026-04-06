export interface Expense {
  id: string;
  category: string;
  content: string;
  amount: number;
  date: string;
  memo?: string;
}

export interface Trip {
  // id가 숫자(int8)여도, 문자(text)여도 모두 받아낼 수 있게 'any'로 설정합니다.
  id: any; 
  name: string;
  startDate: string;
  endDate: string;
  expenses: Expense[];
}