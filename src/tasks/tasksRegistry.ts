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
  exampleCode?: string
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
  {
    id: '01-js-basics/is-odd',
    groupId: '01-js-basics',
    title: 'isOdd',
    goal: 'Закрепить проверку числа через остаток от деления.',
    description: 'Напиши функцию `isOdd`, которая возвращает `true`, если число нечетное.',
    hint: 'Нечетное число дает остаток `1` или `-1` при делении на `2`.',
    starterCode: `function isOdd(value) {
  return false
}`,
    check: (code) =>
      checkFunction(code, 'isOdd', [
        { title: '5 является нечетным', args: [5], expected: true },
        { title: '4 не является нечетным', args: [4], expected: false },
        { title: '-3 является нечетным', args: [-3], expected: true },
      ]),
  },
  {
    id: '01-js-basics/clamp',
    groupId: '01-js-basics',
    title: 'clamp',
    goal: 'Потренироваться ограничивать число диапазоном.',
    description: 'Напиши функцию `clamp`, которая возвращает число внутри диапазона `min`-`max`.',
    hint: 'Если число меньше `min`, верни `min`. Если больше `max`, верни `max`.',
    starterCode: `function clamp(value, min, max) {
  return value
}`,
    check: (code) =>
      checkFunction(code, 'clamp', [
        { title: '5 внутри диапазона 1-10', args: [5, 1, 10], expected: 5 },
        { title: '-2 становится 0', args: [-2, 0, 10], expected: 0 },
        { title: '15 становится 10', args: [15, 0, 10], expected: 10 },
      ]),
  },
  {
    id: '01-js-basics/get-grade',
    groupId: '01-js-basics',
    title: 'getGrade',
    goal: 'Потренироваться писать цепочку условий.',
    description: 'Напиши функцию `getGrade`, которая возвращает `A`, `B`, `C` или `D` по количеству баллов.',
    hint: '`A` от 90, `B` от 75, `C` от 60, иначе `D`.',
    starterCode: `function getGrade(score) {
  return 'D'
}`,
    check: (code) =>
      checkFunction(code, 'getGrade', [
        { title: '95 дает A', args: [95], expected: 'A' },
        { title: '80 дает B', args: [80], expected: 'B' },
        { title: '64 дает C', args: [64], expected: 'C' },
        { title: '20 дает D', args: [20], expected: 'D' },
      ]),
  },
  {
    id: '01-js-basics/factorial',
    groupId: '01-js-basics',
    title: 'factorial',
    goal: 'Потренироваться использовать цикл для накопления результата.',
    description: 'Напиши функцию `factorial`, которая возвращает произведение чисел от `1` до `n`. Для `0` верни `1`.',
    hint: 'Начни с `result = 1` и умножай его на каждое число от `2` до `n`.',
    starterCode: `function factorial(n) {
  return 1
}`,
    check: (code) =>
      checkFunction(code, 'factorial', [
        { title: 'factorial(0) дает 1', args: [0], expected: 1 },
        { title: 'factorial(4) дает 24', args: [4], expected: 24 },
        { title: 'factorial(5) дает 120', args: [5], expected: 120 },
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
    exampleCode: `const numbers = [-2, 0, 3]
getPositiveNumbers(numbers) // [3]`,
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
    exampleCode: `const users = [
  { name: 'Ivan' },
  { name: 'Anna' },
]

getUserNames(users) // ['Ivan', 'Anna']`,
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
    exampleCode: `const words = ['js', 'ts', 'js']
countWords(words) // { js: 2, ts: 1 }`,
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
  {
    id: '02-modern-js/sum-numbers',
    groupId: '02-modern-js',
    title: 'sumNumbers',
    goal: 'Потренироваться использовать `reduce`.',
    description: 'Напиши функцию `sumNumbers`, которая возвращает сумму чисел массива.',
    exampleCode: `const numbers = [1, 2, 3]
sumNumbers(numbers) // 6`,
    hint: 'Начальное значение аккумулятора должно быть `0`.',
    starterCode: `function sumNumbers(numbers) {
  return 0
}`,
    check: (code) =>
      checkFunction(code, 'sumNumbers', [
        { title: '[1, 2, 3] дает 6', args: [[1, 2, 3]], expected: 6 },
        { title: 'Пустой массив дает 0', args: [[]], expected: 0 },
      ]),
  },
  {
    id: '02-modern-js/get-average',
    groupId: '02-modern-js',
    title: 'getAverage',
    goal: 'Потренироваться комбинировать сумму и длину массива.',
    description: 'Напиши функцию `getAverage`, которая возвращает среднее значение чисел. Для пустого массива верни `0`.',
    exampleCode: `const numbers = [2, 4, 6]
getAverage(numbers) // 4`,
    hint: 'Сначала посчитай сумму, затем раздели на `numbers.length`.',
    starterCode: `function getAverage(numbers) {
  return 0
}`,
    check: (code) =>
      checkFunction(code, 'getAverage', [
        { title: '[2, 4, 6] дает 4', args: [[2, 4, 6]], expected: 4 },
        { title: 'Пустой массив дает 0', args: [[]], expected: 0 },
      ]),
  },
  {
    id: '02-modern-js/sort-by-age',
    groupId: '02-modern-js',
    title: 'sortByAge',
    goal: 'Потренироваться сортировать массив объектов.',
    description: 'Напиши функцию `sortByAge`, которая возвращает пользователей, отсортированных по возрасту по возрастанию.',
    exampleCode: `const users = [
  { name: 'Ivan', age: 28 },
  { name: 'Anna', age: 21 },
]

sortByAge(users)
// [
//   { name: 'Anna', age: 21 },
//   { name: 'Ivan', age: 28 },
// ]`,
    hint: 'Не меняй исходный массив: сначала сделай копию через spread или `slice()`.',
    starterCode: `function sortByAge(users) {
  return users
}`,
    check: (code) =>
      checkDeepFunction(code, 'sortByAge', [
        {
          title: 'Сортирует пользователей по возрасту',
          args: [[{ name: 'Ivan', age: 28 }, { name: 'Anna', age: 21 }]],
          expected: [{ name: 'Anna', age: 21 }, { name: 'Ivan', age: 28 }],
        },
      ]),
  },
  {
    id: '02-modern-js/flatten-once',
    groupId: '02-modern-js',
    title: 'flattenOnce',
    goal: 'Потренироваться разворачивать вложенный массив на один уровень.',
    description: 'Напиши функцию `flattenOnce`, которая превращает массив массивов в один общий массив.',
    exampleCode: `const items = [[1, 2], [3]]
flattenOnce(items) // [1, 2, 3]`,
    hint: 'Можно использовать `flat()` или `reduce` с `concat`.',
    starterCode: `function flattenOnce(items) {
  return items
}`,
    check: (code) =>
      checkArrayFunction(code, 'flattenOnce', [
        { title: '[[1, 2], [3]] дает [1, 2, 3]', args: [[[1, 2], [3]]], expected: [1, 2, 3] },
        { title: '[[], [1]] дает [1]', args: [[[], [1]]], expected: [1] },
      ]),
  },
]

const functionsAndObjectsTasks: Task[] = [
  {
    id: '03-functions-objects/group-by',
    groupId: '03-functions-objects',
    title: 'groupBy',
    goal: 'Потренироваться группировать массив объектов.',
    description: 'Напиши функцию `groupBy`, которая принимает массив объектов и имя поля, а возвращает объект с группами по значению этого поля.',
    exampleCode: `const users = [
  { name: 'Ivan', role: 'admin' },
  { name: 'Anna', role: 'user' },
  { name: 'Oleg', role: 'admin' },
]

groupBy(users, 'role')
// {
//   admin: [
//     { name: 'Ivan', role: 'admin' },
//     { name: 'Oleg', role: 'admin' },
//   ],
//   user: [{ name: 'Anna', role: 'user' }],
// }`,
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
    exampleCode: `const values = [1, 2, 1, 3, 2]
unique(values) // [1, 2, 3]`,
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
    exampleCode: `const user = { name: 'Ivan', age: 28, role: 'admin' }
pick(user, ['name', 'age']) // { name: 'Ivan', age: 28 }`,
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
  {
    id: '03-functions-objects/omit',
    groupId: '03-functions-objects',
    title: 'omit',
    goal: 'Потренироваться создавать объект без выбранных полей.',
    description: 'Напиши функцию `omit`, которая возвращает копию объекта без ключей из массива `keys`.',
    exampleCode: `const user = { name: 'Ivan', age: 28, role: 'admin' }
omit(user, ['role']) // { name: 'Ivan', age: 28 }`,
    hint: 'Пройди по ключам объекта и копируй только те, которых нет в `keys`.',
    starterCode: `function omit(object, keys) {
  return object
}`,
    check: (code) =>
      checkDeepFunction(code, 'omit', [
        {
          title: 'Удаляет role из объекта',
          args: [{ name: 'Ivan', age: 28, role: 'admin' }, ['role']],
          expected: { name: 'Ivan', age: 28 },
        },
      ]),
  },
  {
    id: '03-functions-objects/invert-object',
    groupId: '03-functions-objects',
    title: 'invertObject',
    goal: 'Потренироваться менять ключи и значения местами.',
    description: 'Напиши функцию `invertObject`, которая делает значения объекта ключами, а ключи значениями.',
    exampleCode: `const names = { js: 'JavaScript', ts: 'TypeScript' }
invertObject(names)
// { JavaScript: 'js', TypeScript: 'ts' }`,
    hint: 'Используй `Object.entries()` и собери новый объект.',
    starterCode: `function invertObject(object) {
  return {}
}`,
    check: (code) =>
      checkDeepFunction(code, 'invertObject', [
        {
          title: 'Меняет ключи и значения местами',
          args: [{ js: 'JavaScript', ts: 'TypeScript' }],
          expected: { JavaScript: 'js', TypeScript: 'ts' },
        },
      ]),
  },
  {
    id: '03-functions-objects/merge-by-id',
    groupId: '03-functions-objects',
    title: 'mergeById',
    goal: 'Потренироваться объединять два массива объектов.',
    description: 'Напиши функцию `mergeById`, которая объединяет объекты из двух массивов по одинаковому `id`.',
    exampleCode: `const users = [
  { id: 1, name: 'Ivan' },
  { id: 2, name: 'Anna' },
]

const roles = [
  { id: 1, role: 'admin' },
  { id: 2, role: 'user' },
]

mergeById(users, roles)
// [
//   { id: 1, name: 'Ivan', role: 'admin' },
//   { id: 2, name: 'Anna', role: 'user' },
// ]`,
    hint: 'Для каждого объекта из первого массива найди объект с таким же `id` во втором массиве.',
    starterCode: `function mergeById(left, right) {
  return left
}`,
    check: (code) =>
      checkDeepFunction(code, 'mergeById', [
        {
          title: 'Объединяет данные пользователей по id',
          args: [
            [{ id: 1, name: 'Ivan' }, { id: 2, name: 'Anna' }],
            [{ id: 1, role: 'admin' }, { id: 2, role: 'user' }],
          ],
          expected: [
            { id: 1, name: 'Ivan', role: 'admin' },
            { id: 2, name: 'Anna', role: 'user' },
          ],
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
  {
    id: '04-async-js/wrap-in-promise',
    groupId: '04-async-js',
    title: 'wrapInPromise',
    goal: 'Закрепить создание Promise из значения.',
    description: 'Напиши функцию `wrapInPromise`, которая принимает значение и возвращает Promise с этим значением.',
    hint: 'Используй `Promise.resolve(value)`.',
    starterCode: `function wrapInPromise(value) {
  return value
}`,
    check: (code) => {
      try {
        const scope = runCode(code, ['wrapInPromise'])
        const candidate = scope.wrapInPromise

        if (typeof candidate !== 'function') {
          return [
            {
              title: 'Функция wrapInPromise найдена',
              passed: false,
              expected: 'function',
              received: typeof candidate,
            },
          ]
        }

        const received = candidate('JS')

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
  {
    id: '04-async-js/get-promise-status-label',
    groupId: '04-async-js',
    title: 'getPromiseStatusLabel',
    goal: 'Потренироваться работать со строковыми статусами.',
    description: 'Напиши функцию `getPromiseStatusLabel`, которая превращает `pending`, `fulfilled`, `rejected` в человекочитаемые подписи.',
    hint: 'Можно использовать объект-словарь или `switch`.',
    starterCode: `function getPromiseStatusLabel(status) {
  return status
}`,
    check: (code) =>
      checkFunction(code, 'getPromiseStatusLabel', [
        { title: 'pending дает Loading', args: ['pending'], expected: 'Loading' },
        { title: 'fulfilled дает Success', args: ['fulfilled'], expected: 'Success' },
        { title: 'rejected дает Error', args: ['rejected'], expected: 'Error' },
      ]),
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
    exampleCode: `const numbers = [2, 7, 11, 15]
twoSum(numbers, 9) // [0, 1]`,
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
  {
    id: '05-interview-practice/reverse-string',
    groupId: '05-interview-practice',
    title: 'reverseString',
    goal: 'Размяться на базовой задаче со строкой.',
    description: 'Напиши функцию `reverseString`, которая возвращает строку в обратном порядке.',
    hint: 'Строку можно превратить в массив через `split("")`.',
    starterCode: `function reverseString(value) {
  return value
}`,
    check: (code) =>
      checkFunction(code, 'reverseString', [
        { title: 'abc дает cba', args: ['abc'], expected: 'cba' },
        { title: 'JS дает SJ', args: ['JS'], expected: 'SJ' },
      ]),
  },
  {
    id: '05-interview-practice/are-anagrams',
    groupId: '05-interview-practice',
    title: 'areAnagrams',
    goal: 'Потренироваться сравнивать строки после нормализации.',
    description: 'Напиши функцию `areAnagrams`, которая проверяет, состоят ли две строки из одних и тех же букв.',
    hint: 'Приведи строки к нижнему регистру, отсортируй буквы и сравни результат.',
    starterCode: `function areAnagrams(a, b) {
  return false
}`,
    check: (code) =>
      checkFunction(code, 'areAnagrams', [
        { title: 'listen и silent являются анаграммами', args: ['listen', 'silent'], expected: true },
        { title: 'js и ts не являются анаграммами', args: ['js', 'ts'], expected: false },
      ]),
  },
  {
    id: '05-interview-practice/find-missing-number',
    groupId: '05-interview-practice',
    title: 'findMissingNumber',
    goal: 'Потренироваться искать пропущенное число.',
    description: 'Напиши функцию `findMissingNumber`, которая получает массив чисел от `1` до `n` с одним пропуском и возвращает пропущенное число.',
    exampleCode: `const numbers = [1, 2, 4]
findMissingNumber(numbers, 4) // 3`,
    hint: 'Можно сравнить ожидаемую сумму `1..n` и фактическую сумму массива.',
    starterCode: `function findMissingNumber(numbers, n) {
  return 0
}`,
    check: (code) =>
      checkFunction(code, 'findMissingNumber', [
        { title: '[1, 2, 4], 4 дает 3', args: [[1, 2, 4], 4], expected: 3 },
        { title: '[2, 3, 4], 4 дает 1', args: [[2, 3, 4], 4], expected: 1 },
      ]),
  },
  {
    id: '05-interview-practice/chunk-array',
    groupId: '05-interview-practice',
    title: 'chunkArray',
    goal: 'Потренироваться разбивать массив на части.',
    description: 'Напиши функцию `chunkArray`, которая разбивает массив на подмассивы размера `size`.',
    exampleCode: `const items = [1, 2, 3, 4, 5]
chunkArray(items, 2) // [[1, 2], [3, 4], [5]]`,
    hint: 'Иди циклом с шагом `size` и используй `slice`.',
    starterCode: `function chunkArray(items, size) {
  return []
}`,
    check: (code) =>
      checkDeepFunction(code, 'chunkArray', [
        { title: '[1, 2, 3, 4, 5], 2 дает [[1, 2], [3, 4], [5]]', args: [[1, 2, 3, 4, 5], 2], expected: [[1, 2], [3, 4], [5]] },
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
    exampleCode: `const numbers = [10, 20]
getFirstItem(numbers) // 10`,
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
    exampleCode: `const users = [
  { name: 'Ivan', isActive: true },
  { name: 'Anna', isActive: false },
]

filterActiveUsers(users)
// [{ name: 'Ivan', isActive: true }]`,
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
  {
    id: '03-typescript-basics/ensure-array',
    groupId: '03-typescript-basics',
    title: 'ensureArray',
    goal: 'Понять поведение функции, похожей на generic helper.',
    description: 'Напиши функцию `ensureArray`, которая возвращает значение как массив: если пришел массив, верни его; если одно значение, оберни в массив.',
    exampleCode: `ensureArray(5) // [5]
ensureArray([1, 2]) // [1, 2]`,
    hint: 'Проверь `Array.isArray(value)`.',
    starterCode: `function ensureArray(value) {
  return value
}`,
    check: (code) =>
      checkArrayFunction(code, 'ensureArray', [
        { title: '5 превращается в [5]', args: [5], expected: [5] },
        { title: '[1, 2] остается [1, 2]', args: [[1, 2]], expected: [1, 2] },
      ]),
  },
  {
    id: '03-typescript-basics/get-task-label',
    groupId: '03-typescript-basics',
    title: 'getTaskLabel',
    goal: 'Потренироваться с discriminated union через поведение.',
    description: 'Напиши функцию `getTaskLabel`, которая возвращает подпись задачи по ее типу: `bug`, `feature` или `docs`.',
    exampleCode: `const task = { type: 'bug' }
getTaskLabel(task) // 'Bug'`,
    hint: 'Для неизвестного типа верни `Unknown`.',
    starterCode: `function getTaskLabel(task) {
  return 'Unknown'
}`,
    check: (code) =>
      checkFunction(code, 'getTaskLabel', [
        { title: 'bug дает Bug', args: [{ type: 'bug' }], expected: 'Bug' },
        { title: 'feature дает Feature', args: [{ type: 'feature' }], expected: 'Feature' },
        { title: 'docs дает Documentation', args: [{ type: 'docs' }], expected: 'Documentation' },
      ]),
  },
  {
    id: '03-typescript-basics/get-role-permissions',
    groupId: '03-typescript-basics',
    title: 'getRolePermissions',
    goal: 'Потренироваться ограничивать значения роли.',
    description: 'Напиши функцию `getRolePermissions`, которая возвращает разрешения для ролей `admin`, `editor`, `viewer`.',
    hint: '`admin`: `["read", "write", "delete"]`, `editor`: `["read", "write"]`, `viewer`: `["read"]`.',
    starterCode: `function getRolePermissions(role) {
  return []
}`,
    check: (code) =>
      checkArrayFunction(code, 'getRolePermissions', [
        { title: 'admin получает все права', args: ['admin'], expected: ['read', 'write', 'delete'] },
        { title: 'viewer получает только чтение', args: ['viewer'], expected: ['read'] },
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
