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

const runCode = (code: string, names: string[]): RuntimeScope => {
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

const formatValue = (value: unknown): string => JSON.stringify(value) ?? String(value)

const checkFunction = (
  code: string,
  functionName: string,
  cases: {
    title: string
    args: unknown[]
    expected: unknown
  }[],
): TaskCheck[] => {
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

const checkArrayFunction = (
  code: string,
  functionName: string,
  cases: {
    title: string
    args: unknown[]
    expected: unknown[]
  }[],
): TaskCheck[] =>
  checkFunction(code, functionName, cases).map((result) => ({
    ...result,
    passed: result.received === result.expected,
  }))

const checkDeepFunction = (
  code: string,
  functionName: string,
  cases: {
    title: string
    args: unknown[]
    expected: unknown
  }[],
): TaskCheck[] =>
  checkFunction(code, functionName, cases).map((result) => ({
    ...result,
    passed: result.received === result.expected,
  }))

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
  {
    id: '02-modern-js/count-words',
    groupId: '02-modern-js',
    title: 'countWords',
    goal: 'Потренироваться собирать объект-словарь.',
    description: 'Напиши функцию `countWords`, которая считает, сколько раз каждое слово встречается в массиве.',
    hint: 'Создай пустой объект и увеличивай счетчик для каждого слова.',
    starterCode: `function countWords(words) {
  return {}
}`,
    check: (code) =>
      checkDeepFunction(code, 'countWords', [
        {
          title: 'Считает повторения слов',
          args: [['js', 'ts', 'js']],
          expected: { js: 2, ts: 1 },
        },
      ]),
  },
  {
    id: '02-modern-js/create-counter',
    groupId: '02-modern-js',
    title: 'createCounter',
    goal: 'Понять замыкания на простом счетчике.',
    description: 'Напиши функцию `createCounter`, которая возвращает функцию. Каждый вызов внутренней функции увеличивает счетчик на `1`.',
    hint: 'Переменная счетчика должна жить во внешней функции, а изменяться во внутренней.',
    starterCode: `function createCounter() {
  return function () {
    return 0
  }
}`,
    check: (code) => {
      try {
        const scope = runCode(code, ['createCounter'])
        const createCounter = scope.createCounter

        if (typeof createCounter !== 'function') {
          return [
            {
              title: 'Функция createCounter найдена',
              passed: false,
              expected: 'function',
              received: typeof createCounter,
            },
          ]
        }

        const counter = createCounter() as () => unknown
        const first = counter()
        const second = counter()

        return [
          {
            title: 'Первый вызов возвращает 1',
            passed: Object.is(first, 1),
            expected: '1',
            received: formatValue(first),
          },
          {
            title: 'Второй вызов возвращает 2',
            passed: Object.is(second, 2),
            expected: '2',
            received: formatValue(second),
          },
        ]
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
    },
  },
]

const functionsAndObjectsTasks: Task[] = [
  {
    id: '03-functions-objects/group-by',
    groupId: '03-functions-objects',
    title: 'groupBy',
    goal: 'Потренироваться группировать массив объектов.',
    description: 'Напиши функцию `groupBy`, которая принимает массив объектов и имя поля, а возвращает объект с группами по значению этого поля.',
    hint: 'Для каждого элемента возьми `item[key]` и положи элемент в массив с таким ключом.',
    starterCode: `function groupBy(items, key) {
  return {}
}`,
    check: (code) =>
      checkDeepFunction(code, 'groupBy', [
        {
          title: 'Группирует пользователей по роли',
          args: [
            [
              { name: 'Ivan', role: 'admin' },
              { name: 'Anna', role: 'user' },
              { name: 'Oleg', role: 'admin' },
            ],
            'role',
          ],
          expected: {
            admin: [
              { name: 'Ivan', role: 'admin' },
              { name: 'Oleg', role: 'admin' },
            ],
            user: [{ name: 'Anna', role: 'user' }],
          },
        },
      ]),
  },
  {
    id: '03-functions-objects/unique',
    groupId: '03-functions-objects',
    title: 'unique',
    goal: 'Потренироваться удалять дубликаты.',
    description: 'Напиши функцию `unique`, которая возвращает массив уникальных значений в порядке первого появления.',
    hint: 'Можно использовать `Set`, но сохрани порядок элементов.',
    starterCode: `function unique(values) {
  return values
}`,
    check: (code) =>
      checkArrayFunction(code, 'unique', [
        { title: 'Удаляет дубликаты чисел', args: [[1, 2, 1, 3, 2]], expected: [1, 2, 3] },
        { title: 'Удаляет дубликаты строк', args: [['a', 'b', 'a']], expected: ['a', 'b'] },
      ]),
  },
  {
    id: '03-functions-objects/deep-pick',
    groupId: '03-functions-objects',
    title: 'pick',
    goal: 'Потренироваться создавать новый объект из выбранных полей.',
    description: 'Напиши функцию `pick`, которая принимает объект и массив ключей, а возвращает новый объект только с этими ключами.',
    hint: 'Не меняй исходный объект. Создай новый объект и копируй туда только нужные поля.',
    starterCode: `function pick(object, keys) {
  return {}
}`,
    check: (code) =>
      checkDeepFunction(code, 'pick', [
        {
          title: 'Выбирает name и age',
          args: [{ name: 'Ivan', age: 28, role: 'admin' }, ['name', 'age']],
          expected: { name: 'Ivan', age: 28 },
        },
      ]),
  },
]

const asyncTasks: Task[] = [
  {
    id: '04-async-js/is-promise-like',
    groupId: '04-async-js',
    title: 'isPromiseLike',
    goal: 'Понять, как распознать thenable-объект.',
    description: 'Напиши функцию `isPromiseLike`, которая возвращает `true`, если значение похоже на Promise: объект или функция с методом `then`.',
    hint: 'Проверь, что значение не `null`, и что `typeof value.then === "function"`.',
    starterCode: `function isPromiseLike(value) {
  return false
}`,
    check: (code) =>
      checkFunction(code, 'isPromiseLike', [
        { title: 'Promise похож на Promise', args: [Promise.resolve(1)], expected: true },
        { title: 'Объект с then похож на Promise', args: [{ then() {} }], expected: true },
        { title: 'null не похож на Promise', args: [null], expected: false },
      ]),
  },
  {
    id: '04-async-js/create-resolved-message',
    groupId: '04-async-js',
    title: 'createResolvedMessage',
    goal: 'Потренироваться возвращать Promise.',
    description: 'Напиши функцию `createResolvedMessage`, которая возвращает Promise со строкой `Done`.',
    hint: 'Используй `Promise.resolve("Done")`.',
    starterCode: `function createResolvedMessage() {
  return 'Done'
}`,
    check: (code) => {
      try {
        const scope = runCode(code, ['createResolvedMessage'])
        const candidate = scope.createResolvedMessage

        if (typeof candidate !== 'function') {
          return [
            {
              title: 'Функция createResolvedMessage найдена',
              passed: false,
              expected: 'function',
              received: typeof candidate,
            },
          ]
        }

        const received = candidate()

        return [
          {
            title: 'Возвращает Promise',
            passed: received instanceof Promise,
            expected: 'Promise',
            received: received instanceof Promise ? 'Promise' : typeof received,
          },
        ]
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
    },
  },
]

const interviewTasks: Task[] = [
  {
    id: '05-interview-practice/fizz-buzz',
    groupId: '05-interview-practice',
    title: 'fizzBuzz',
    goal: 'Размяться на классической задаче с условиями.',
    description: 'Напиши функцию `fizzBuzz`, которая возвращает `Fizz` для чисел, кратных 3, `Buzz` для кратных 5, `FizzBuzz` для кратных 3 и 5, иначе само число.',
    hint: 'Сначала проверь случай кратности и 3, и 5.',
    starterCode: `function fizzBuzz(value) {
  return value
}`,
    check: (code) =>
      checkFunction(code, 'fizzBuzz', [
        { title: '3 дает Fizz', args: [3], expected: 'Fizz' },
        { title: '5 дает Buzz', args: [5], expected: 'Buzz' },
        { title: '15 дает FizzBuzz', args: [15], expected: 'FizzBuzz' },
        { title: '7 дает 7', args: [7], expected: 7 },
      ]),
  },
  {
    id: '05-interview-practice/is-palindrome',
    groupId: '05-interview-practice',
    title: 'isPalindrome',
    goal: 'Потренироваться работать со строками.',
    description: 'Напиши функцию `isPalindrome`, которая проверяет, читается ли строка одинаково слева направо и справа налево. Регистр и пробелы игнорируй.',
    hint: 'Приведи строку к нижнему регистру, убери пробелы и сравни с перевернутой строкой.',
    starterCode: `function isPalindrome(value) {
  return false
}`,
    check: (code) =>
      checkFunction(code, 'isPalindrome', [
        { title: 'madam является палиндромом', args: ['madam'], expected: true },
        { title: 'A man a plan a canal Panama является палиндромом без учета пробелов и регистра', args: ['A man a plan a canal Panama'], expected: true },
        { title: 'javascript не является палиндромом', args: ['javascript'], expected: false },
      ]),
  },
  {
    id: '05-interview-practice/two-sum',
    groupId: '05-interview-practice',
    title: 'twoSum',
    goal: 'Потренироваться искать пару значений.',
    description: 'Напиши функцию `twoSum`, которая возвращает индексы двух чисел, сумма которых равна `target`.',
    hint: 'Можно пройти массив один раз и хранить уже увиденные числа в объекте или Map.',
    starterCode: `function twoSum(numbers, target) {
  return []
}`,
    check: (code) =>
      checkArrayFunction(code, 'twoSum', [
        { title: '[2, 7, 11, 15], 9 дает [0, 1]', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { title: '[3, 2, 4], 6 дает [1, 2]', args: [[3, 2, 4], 6], expected: [1, 2] },
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
  {
    id: '03-typescript-basics/filter-active-users',
    groupId: '03-typescript-basics',
    title: 'filterActiveUsers',
    goal: 'Связать тип объекта с поведением функции.',
    description: 'Напиши функцию `filterActiveUsers`, которая оставляет только пользователей с `isActive: true`.',
    hint: 'В TypeScript это была бы функция `(users: User[]) => User[]`, но в тренажере проверяем поведение.',
    starterCode: `function filterActiveUsers(users) {
  return users
}`,
    check: (code) =>
      checkArrayFunction(code, 'filterActiveUsers', [
        {
          title: 'Оставляет только активных пользователей',
          args: [[{ name: 'Ivan', isActive: true }, { name: 'Anna', isActive: false }]],
          expected: [{ name: 'Ivan', isActive: true }],
        },
      ]),
  },
  {
    id: '03-typescript-basics/normalize-status',
    groupId: '03-typescript-basics',
    title: 'normalizeStatus',
    goal: 'Потренироваться с ограниченным набором значений.',
    description: 'Напиши функцию `normalizeStatus`, которая принимает строку и возвращает `todo`, `in-progress` или `done`. Для неизвестных значений возвращай `todo`.',
    hint: 'Это похоже на union type: разрешены только несколько строк.',
    starterCode: `function normalizeStatus(status) {
  return status
}`,
    check: (code) =>
      checkFunction(code, 'normalizeStatus', [
        { title: 'done остается done', args: ['done'], expected: 'done' },
        { title: 'unknown превращается в todo', args: ['unknown'], expected: 'todo' },
        { title: 'in-progress остается in-progress', args: ['in-progress'], expected: 'in-progress' },
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
  {
    id: '03-functions-objects',
    title: '04. Functions and Objects',
    path: 'src/tasks/04-functions-objects',
    tasks: functionsAndObjectsTasks,
  },
  {
    id: '04-async-js',
    title: '05. Async JavaScript',
    path: 'src/tasks/05-async-js',
    tasks: asyncTasks,
  },
  {
    id: '05-interview-practice',
    title: '06. Interview Practice',
    path: 'src/tasks/06-interview-practice',
    tasks: interviewTasks,
  },
]

export const tasks = taskGroups.flatMap((group) => group.tasks)
