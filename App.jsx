import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import './App.css'

const API_URL = 'http://localhost:4000'

const STATUS_ORDER = [
  "Idea",
  "Assigned",
  "Drafting",
  "Editing",
  "Fact-Check",
  "Scheduled",
  "Published",
]

function App() {
  const [tasks, setTasks] = useState([])
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "",
    status: "Idea",
    dueDate: "",
  })

  // Fetch tasks from API on mount
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`)
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const addTask = async () => {
    if (!formData.title.trim()) return
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const newTask = await response.json()
      setTasks([...tasks, newTask])
      setFormData({ title: "", description: "", assignee: "", status: "Idea", dueDate: "" })
      setDialogOpen(false)
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' })
      setTasks(tasks.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus }),
      })
      const updatedTask = await response.json()
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, status) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    updateTaskStatus(taskId, status)
  }

  const renderColumnTasks = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(e, task.id)}
          className="bg-white rounded-lg shadow-md p-3 mb-2 cursor-move hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800 text-sm truncate flex-1">{task.title}</h4>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-400 hover:text-red-500 ml-2 p-1"
            >
              <X size={14} />
            </button>
          </div>
          {task.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          )}
          {task.assignee && (
            <p className="text-xs text-blue-600">Assigned: {task.assignee}</p>
          )}
          {task.dueDate && (
            <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
          )}
        </div>
      ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Project Management Board</h1>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> New Task
        </button>
      </header>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
            className="bg-gray-200 rounded-lg p-3 min-h-[400px]"
          >
            <h3 className="text-sm font-bold text-gray-700 mb-3 text-center border-b border-gray-300 pb-2">
              {status}
              <span className="ml-2 bg-gray-400 text-white text-xs px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === status).length}
              </span>
            </h3>
            <div className="overflow-y-auto max-h-[500px]">
              {renderColumnTasks(status)}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Create New Task</h2>
              <button
                onClick={() => setDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                name="title"
                placeholder="Title *"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <input
                name="assignee"
                placeholder="Assignee"
                value={formData.assignee}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_ORDER.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
