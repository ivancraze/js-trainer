export type TaskCheck = {
  title: string
  passed: boolean
  expected: string
  received: string
}

export type Task = {
  id: string
  groupId: string
  title: string
  goal: string
  description: string
  hint: string
  starterCode: string
  check: (code: string) => TaskCheck[]
}

export type TaskGroup = {
  id: string
  title: string
  path: string
  tasks: Task[]
}

type RuntimeScope = Record<string, unknown>

function runCode(code: string, names: string[]): RuntimeScope {
  const returnedNames = names
    .map((name) => `${name}: typeof ${name} === 'function' ? ${name} : undefined`)
    .join(',')

  const run = new Function(`
    "use strict";
    ${code}
    return { ${returnedNames} };
  `)

  return run() as RuntimeScope
}

function formatValue(value: unknown): string {
  return JSON.stringify(value) ?? String(value)
}

function checkFunction(
  code: string,
  functionName: string,
  cases: {
    title: string
    args: unknown[]
    expected: unknown
  }[],
): TaskCheck[] {
  try {
    const scope = runCode(code, [functionName])
    const candidate = scope[functionName]

    if (typeof candidate !== 'function') {
      return [
        {
          title: `Функция ${functionName} найдена`,
          passed: false,
          expected: 'function',
          received: typeof candidate,
        },
      ]
    }

    return cases.map((item) => {
      const received = (candidate as (...args: unknown[]) => unknown)(...item.args)

      return {
        title: item.title,
        passed: Object.is(received, item.expected),
        expected: formatValue(item.expected),
        received: formatValue(received),
      }
    })
  } catch (error) {
    return [
      {
        title: 'Код выполняется без ошибки',
        passed: false,
        expected: 'без ошибки',
        received: error instanceof Error ? error.message : 'неизвестная ошибка',
      },
    ]
  }
}

function checkArrayFunction(
  code: string,
  functionName: string,
  cases: {
    title: string
    args: unknown[]
    expected: unknown[]
  }[],
): TaskCheck[] {
  return checkFunction(code, functionName, cases).map((result) => ({
    ...result,
    passed: result.received === result.expected,
  }))
}

const jsBasicsTasks: Task[] = [
  {
    id: '01-js-basics/is-even',
    groupId: '01-js-basics',
    title: 'isEven',
    goal: 'Научиться писать функцию с boolean-результатом.',
    description: 'Напиши функцию `isEven`, которая возвращает `true`, если число четное, и `false`, если нечетное.',
    hint: 'Остаток от деления можно получить через оператор `%`.',
    starterCode: `function isEven(value) {
  return false
}`,
    check: (code) =>
      checkFunction(code, 'isEven', [
        { title: '4 является четным', args: [4], expected: true },
        { title: '5 не является четным', args: [5], expected: false },
        { title: '0 является четным', args: [0], expected: true },
      ]),
  },
  {
    id: '01-js-basics/get-max',
    groupId: '01-js-basics',
    title: 'getMax',
    goal: 'Потренироваться сравнивать значения.',
    description: 'Напиши функцию `getMax`, которая принимает два числа и возвращает большее.',
    hint: 'Можно использовать `if` или тернарный оператор.',
    starterCode: `function getMax(a, b) {
  return a
}`,
    check: (code) =>
      checkFunction(code, 'getMax', [
        { title: '3 и 7 дают 7', args: [3, 7], expected: 7 },
        { title: '10 и 2 дают 10', args: [10, 2], expected: 10 },
      ]),
  },
  {
    id: '01-js-basics/sum-to',
    groupId: '01-js-basics',
    title: 'sumTo',
    goal: 'Потренироваться писать цикл.',
    description: 'Напиши функцию `sumTo`, которая возвращает сумму чисел от `1` до `n` включительно.',
    hint: 'Создай переменную `sum`, пройди циклом от `1` до `n` и прибавляй текущее число.',
    starterCode: `function sumTo(n) {
  let sum = 0

  return sum
}`,
    check: (code) =>
      checkFunction(code, 'sumTo', [
        { title: 'sumTo(5) дает 15', args: [5], expected: 15 },
        { title: 'sumTo(1) дает 1', args: [1], expected: 1 },
        { title: 'sumTo(10) дает 55', args: [10], expected: 55 },
      ]),
  },
  {
    id: '01-js-basics/is-empty-string',
    groupId: '01-js-basics',
    title: 'isEmptyString',
    goal: 'Потренироваться проверять строки.',
    description: 'Напиши функцию `isEmptyString`, которая возвращает `true` для пустой строки и строки из пробелов.',
    hint: 'Метод `trim()` убирает пробелы по краям строки.',
    starterCode: `function isEmptyString(value) {
  return false
}`,
    check: (code) =>
      checkFunction(code, 'isEmptyString', [
        { title: 'Пустая строка считается пустой', args: [''], expected: true },
        { title: 'Строка из пробелов считается пустой', args: ['   '], expected: true },
        { title: 'Строка "js" не пустая', args: ['js'], expected: false },
      ]),
  },
]

const modernJsTasks: Task[] = [
  {
    id: '02-modern-js/get-positive-numbers',
    groupId: '02-modern-js',
    title: 'getPositiveNumbers',
    goal: 'Потренироваться использовать `filter`.',
    description: 'Напиши функцию `getPositiveNumbers`, которая оставляет в массиве только числа больше нуля.',
    hint: 'Для каждого числа верни условие `number > 0`.',
    starterCode: `function getPositiveNumbers(numbers) {
  return numbers
}`,
    check: (code) =>
      checkArrayFunction(code, 'getPositiveNumbers', [
        { title: '[-2, 0, 3] дает [3]', args: [[-2, 0, 3]], expected: [3] },
        { title: '[1, -1, 2] дает [1, 2]', args: [[1, -1, 2]], expected: [1, 2] },
      ]),
  },
  {
    id: '02-modern-js/get-user-names',
    groupId: '02-modern-js',
    title: 'getUserNames',
    goal: 'Потренироваться использовать `map`.',
    description: 'Напиши функцию `getUserNames`, которая превращает массив пользователей в массив имен.',
    hint: 'Каждый объект пользователя содержит поле `name`.',
    starterCode: `function getUserNames(users) {
  return []
}`,
    check: (code) =>
      checkArrayFunction(code, 'getUserNames', [
        {
          title: 'Возвращает имена пользователей',
          args: [[{ name: 'Ivan' }, { name: 'Anna' }]],
          expected: ['Ivan', 'Anna'],
        },
      ]),
  },
]

const typescriptTasks: Task[] = [
  {
    id: '03-typescript-basics/get-first-item',
    groupId: '03-typescript-basics',
    title: 'getFirstItem',
    goal: 'Понять идею generic-функции через поведение.',
    description: 'Напиши функцию `getFirstItem`, которая возвращает первый элемент массива или `undefined`, если массив пустой.',
    hint: 'Первый элемент массива находится по индексу `0`.',
    starterCode: `function getFirstItem(items) {
  return undefined
}`,
    check: (code) =>
      checkFunction(code, 'getFirstItem', [
        { title: 'Первый элемент [10, 20] это 10', args: [[10, 20]], expected: 10 },
        { title: 'Пустой массив дает undefined', args: [[]], expected: undefined },
      ]),
  },
]

export const taskGroups: TaskGroup[] = [
  {
    id: '01-js-basics',
    title: '01. JavaScript Basics',
    path: 'src/tasks/01-js-basics',
    tasks: jsBasicsTasks,
  },
  {
    id: '02-modern-js',
    title: '02. Modern JavaScript',
    path: 'src/tasks/02-modern-js',
    tasks: modernJsTasks,
  },
  {
    id: '03-typescript-basics',
    title: '03. TypeScript Basics',
    path: 'src/tasks/03-typescript-basics',
    tasks: typescriptTasks,
  },
]

export const tasks = taskGroups.flatMap((group) => group.tasks)
