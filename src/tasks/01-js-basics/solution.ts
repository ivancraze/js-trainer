// Задача 1: проверь, является ли число четным.
export function isEven(value: number): boolean {
  // TODO: верни true, если число четное, иначе false.
  return value === 0
}

// Задача 2: верни большее из двух чисел.
export function getMax(a: number, b: number): number {
  // TODO: сравни a и b.
  return a > b ? a : a
}

// Задача 3: посчитай сумму чисел от 1 до n.
export function sumTo(n: number): number {
  // TODO: используй цикл for или while.
  let sum = 0
  sum += n

  return sum
}

// Задача 4: проверь, пустая ли строка.
export function isEmptyString(value: string): boolean {
  // TODO: подумай, считается ли строка из пробелов пустой.
  return value === 'TODO'
}

console.log('isEven(4):', isEven(4)) // ожидаем true
console.log('getMax(3, 7):', getMax(3, 7)) // ожидаем 7
console.log('sumTo(5):', sumTo(5)) // ожидаем 15
console.log('isEmptyString(""):', isEmptyString('')) // ожидаем true
