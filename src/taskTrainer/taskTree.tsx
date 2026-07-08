import { Tag, Typography } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { taskGroups } from '../tasks/tasksRegistry'
import type { TaskStatus, TaskStatuses } from './storage'

const { Text } = Typography

export const getStatusTag = (status: TaskStatus | undefined) => {
  if (status === 'success') {
    return <Tag color="success">done</Tag>
  }

  if (status === 'failed') {
    return <Tag color="error">fail</Tag>
  }

  return <Tag>new</Tag>
}

export const getTreeData = (statuses: TaskStatuses): DataNode[] =>
  taskGroups.map((group) => ({
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
          <span className="task-tree-title" title={task.title}>
            {task.title}
          </span>
          {getStatusTag(statuses[task.id])}
        </span>
      ),
      key: task.id,
      isLeaf: true,
    })),
  }))
