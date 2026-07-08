// Задача 1: опиши тип пользователя.
type User = {
  // TODO: добавь поля id, name и isActive.
  name: string
}

// Задача 2: опиши возможные статусы задачи.
type TaskStatus = 'todo'

// Задача 3: верни имена пользователей.
export function getUserNames(users: User[]): string[] {
  // TODO: используй map и корректный тип User.
  return users.map((user) => user.name)
}

// Задача 4: верни первый элемент массива.
export function getFirstItem<T>(items: T[]): T | undefined {
  // TODO: верни первый элемент или undefined, если массив пустой.
  return items[1]
}

// Задача 5: проверь статус задачи через narrowing.
export function isFinishedStatus(status: TaskStatus): boolean {
  // TODO: расширь TaskStatus и проверь, завершена ли задача.
  return status === 'todo'
}

const users: User[] = [
  // TODO: после описания типа добавь сюда пару пользователей.
]

console.log('getUserNames(users):', getUserNames(users))
console.log('getFirstItem([10, 20]):', getFirstItem([10, 20])) // ожидаем 10
console.log('isFinishedStatus("todo"):', isFinishedStatus('todo')) // ожидаем false
