import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Input,
  Layout,
  Space,
  Splitter,
  Tag,
  Tree,
  Typography,
} from 'antd'
import type { DataNode } from 'antd/es/tree'
import { taskGroups, tasks, type Task, type TaskCheck } from './tasks/tasksRegistry'
import './App.css'

const { Header, Sider, Content } = Layout
const { Text, Title, Paragraph } = Typography
const { TextArea } = Input

type TaskStatus = 'success' | 'failed'
type TaskStatuses = Record<string, TaskStatus>

function getSavedCode(task: Task): string {
  return localStorage.getItem(`task-code:${task.id}`) ?? task.starterCode
}

function getSavedStatuses(): TaskStatuses {
  const savedValue = localStorage.getItem('task-statuses')

  if (!savedValue) {
    return {}
  }

  try {
    return JSON.parse(savedValue) as TaskStatuses
  } catch {
    return {}
  }
}

function getStatusTag(status: TaskStatus | undefined) {
  if (status === 'success') {
    return <Tag color="success">Успешно</Tag>
  }

  if (status === 'failed') {
    return <Tag color="error">Неуспешно</Tag>
  }

  return <Tag>Не проверено</Tag>
}

function getTreeData(statuses: TaskStatuses): DataNode[] {
  return taskGroups.map((group) => ({
    title: (
      <span>
        <Text strong>{group.title}</Text>
        <Text type="secondary" className="task-tree-path">
          {group.path}
        </Text>
      </span>
    ),
    key: group.id,
    selectable: false,
    children: group.tasks.map((task) => ({
      title: (
        <span className="task-tree-item">
          <span>{task.title}</span>
          {getStatusTag(statuses[task.id])}
        </span>
      ),
      key: task.id,
      isLeaf: true,
    })),
  }))
}

function getPassedCount(results: TaskCheck[]): number {
  return results.filter((result) => result.passed).length
}

function App() {
  const [statuses, setStatuses] = useState<TaskStatuses>(() => getSavedStatuses())
  const treeData = useMemo(() => getTreeData(statuses), [statuses])
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0].id)
  const selectedTaskIndex = tasks.findIndex((task) => task.id === selectedTaskId)
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0]
  const [code, setCode] = useState(() => getSavedCode(selectedTask))
  const [results, setResults] = useState<TaskCheck[]>([])
  const [showHint, setShowHint] = useState(false)

  function selectTask(task: Task) {
    setSelectedTaskId(task.id)
    setCode(getSavedCode(task))
    setResults([])
    setShowHint(false)
  }

  useEffect(() => {
    localStorage.setItem(`task-code:${selectedTask.id}`, code)
  }, [code, selectedTask.id])

  useEffect(() => {
    localStorage.setItem('task-statuses', JSON.stringify(statuses))
  }, [statuses])

  const passedCount = getPassedCount(results)
  const hasResults = results.length > 0
  const isSolved = hasResults && passedCount === results.length
  const selectedStatus = statuses[selectedTask.id]
  const previousTask = tasks[selectedTaskIndex - 1]
  const nextTask = tasks[selectedTaskIndex + 1]

  return (
    <Layout className="trainer-shell">
      <Header className="trainer-header">
        <div>
          <Title level={1}>New Life</Title>
          <Text>Тренажер JavaScript и TypeScript задач</Text>
        </div>
      </Header>

      <Layout className="trainer-body">
        <Sider width={320} className="trainer-sidebar">
          <Text className="sidebar-label" type="secondary">
            src/tasks
          </Text>
          <Tree
            blockNode
            defaultExpandAll
            selectedKeys={[selectedTask.id]}
            treeData={treeData}
            onSelect={(keys) => {
              const nextKey = String(keys[0] ?? selectedTask.id)
              const nextTask = tasks.find((task) => task.id === nextKey)

              if (nextTask) {
                selectTask(nextTask)
              }
            }}
          />
        </Sider>

        <Content className="trainer-content">
          <Splitter className="task-splitter">
            <Splitter.Panel defaultSize="42%" min="320px">
              <section className="task-description">
                <div className="task-kicker">
                  <Text type="secondary">{selectedTask.groupId}</Text>
                  {getStatusTag(selectedStatus)}
                </div>
                <Title level={2}>{selectedTask.title}</Title>
                <Paragraph>{selectedTask.goal}</Paragraph>
                <Paragraph>{selectedTask.description}</Paragraph>

                <Space wrap>
                  <Button
                    type="primary"
                    onClick={() => {
                      const nextResults = selectedTask.check(code)
                      const nextStatus =
                        nextResults.length > 0 &&
                        getPassedCount(nextResults) === nextResults.length
                          ? 'success'
                          : 'failed'

                      setResults(nextResults)
                      setStatuses((currentStatuses) => ({
                        ...currentStatuses,
                        [selectedTask.id]: nextStatus,
                      }))
                    }}
                  >
                    Проверить
                  </Button>
                  <Button
                    onClick={() => {
                      setCode(selectedTask.starterCode)
                      setResults([])
                      setStatuses((currentStatuses) => {
                        const nextStatuses = { ...currentStatuses }
                        delete nextStatuses[selectedTask.id]
                        return nextStatuses
                      })
                    }}
                  >
                    Сбросить
                  </Button>
                  <Button onClick={() => setShowHint((value) => !value)}>
                    Подсказка
                  </Button>
                </Space>

                <div className="task-navigation">
                  <Button disabled={!previousTask} onClick={() => selectTask(previousTask)}>
                    Назад
                  </Button>
                  <Text type="secondary">
                    {selectedTaskIndex + 1} из {tasks.length}
                  </Text>
                  <Button
                    type={isSolved ? 'primary' : 'default'}
                    disabled={!nextTask}
                    onClick={() => selectTask(nextTask)}
                  >
                    Далее
                  </Button>
                </div>

                {showHint && (
                  <Alert
                    className="task-alert"
                    type="info"
                    showIcon
                    message="Подсказка"
                    description={selectedTask.hint}
                  />
                )}

                {hasResults && (
                  <Alert
                    className="task-alert"
                    type={isSolved ? 'success' : 'warning'}
                    showIcon
                    message={
                      isSolved
                        ? 'Ответ правильный'
                        : `Прошло проверок: ${passedCount} из ${results.length}`
                    }
                    description={
                      <ul className="check-list">
                        {results.map((result) => (
                          <li key={result.title}>
                            <Text type={result.passed ? 'success' : 'danger'}>
                              {result.passed ? 'OK' : 'Ошибка'}
                            </Text>{' '}
                            {result.title}. Ожидали: <code>{result.expected}</code>,
                            получили: <code>{result.received}</code>
                          </li>
                        ))}
                      </ul>
                    }
                  />
                )}
              </section>
            </Splitter.Panel>

            <Splitter.Panel min="360px">
              <section className="editor-panel">
                <div className="editor-toolbar">
                  <Text strong>solution.js</Text>
                  <Text type="secondary">Сохраняется в браузере</Text>
                </div>
                <TextArea
                  className="code-editor"
                  value={code}
                  spellCheck={false}
                  onChange={(event) => setCode(event.target.value)}
                />
              </section>
            </Splitter.Panel>
          </Splitter>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
