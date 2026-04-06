export interface Expense {
  id: string;
  category: string;
  content: string;
  amount: number;
  date: string;
}

export interface Trip {
  // id가 숫자(number)일 수도, 문자(string)일 수도 있어서 둘 다 허용합니다.
  id: any; 
  name: string;
  startDate: string;
  endDate: string;
  expenses: Expense[];
}