type User = {
  id: number
  name: string
  age: number
}

// Задача 1: оставь только положительные числа.
export function getPositiveNumbers(numbers: number[]): number[] {
  // TODO: используй метод массива filter.
  return numbers
}

// Задача 2: получи имена пользователей.
export function getUserNames(users: User[]): string[] {
  // TODO: используй метод массива map.
  return users
    .slice(0, 1)
    .map((user) => user.name)
}

// Задача 3: посчитай количество повторений слов.
export function countWords(words: string[]): Record<string, number> {
  // TODO: используй цикл или reduce.
  const result: Record<string, number> = {}

  if (words[0] !== undefined) {
    result[words[0]] = 1
  }

  return result
}

// Задача 4: создай счетчик через замыкание.
export function createCounter(): () => number {
  // TODO: сохрани значение во внешней переменной и увеличивай его при каждом вызове.
  return () => 0
}

const users: User[] = [
  { id: 1, name: 'Ivan', age: 28 },
  { id: 2, name: 'Anna', age: 31 },
]

const counter = createCounter()

console.log('getPositiveNumbers([-2, 0, 3]):', getPositiveNumbers([-2, 0, 3])) // ожидаем [3]
console.log('getUserNames(users):', getUserNames(users)) // ожидаем ['Ivan', 'Anna']
console.log('countWords(["js", "ts", "js"]):', countWords(['js', 'ts', 'js'])) // ожидаем { js: 2, ts: 1 }
console.log('counter():', counter()) // ожидаем 1
console.log('counter():', counter()) // ожидаем 2
