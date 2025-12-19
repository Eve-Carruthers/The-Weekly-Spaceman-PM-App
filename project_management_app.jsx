import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, XIcon, Loader2Icon } from "lucide-react";

/**
 * ProjectManagementApp
 *
 * This component implements a lightweight project management board for
 * The Weekly Spaceman content pipeline. Tasks are organised into columns
 * representing different workflow stages from Idea to Published.
 *
 * Features:
 * - Dynamic columns representing workflow stages
 * - Full CRUD operations via REST API
 * - Modal dialog for creating/editing tasks
 * - Drag and drop between columns
 * - Responsive grid layout with Tailwind CSS
 * - Uses shadcn/ui components for consistent styling
 */

// API configuration - adjust for your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Workflow statuses for The Weekly Spaceman content pipeline
const STATUS_ORDER = [
  "Idea",
  "Assigned",
  "Drafting",
  "Editing",
  "Fact-Check",
  "Scheduled",
  "Published",
];

export default function ProjectManagementApp() {
  // Task state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog state
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "",
    status: "Idea",
    dueDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (value) => {
    setFormData({ ...formData, status: value });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assignee: "",
      status: "Idea",
      dueDate: "",
    });
    setEditingTask(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      assignee: task.assignee || "",
      status: task.status,
      dueDate: task.dueDate || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const url = editingTask
        ? `${API_BASE_URL}/tasks/${editingTask.id}`
        : `${API_BASE_URL}/tasks`;
      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save task");
      }

      await fetchTasks();
      resetForm();
      setDialogOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Drag handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (draggedTaskId) {
      const task = tasks.find((t) => t.id === draggedTaskId);
      if (task && task.status !== status) {
        await updateTaskStatus(draggedTaskId, status);
      }
    }
    setDraggedTaskId(null);
  };

  // Render tasks for a given status column
  const renderColumnTasks = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .map((task) => (
        <Card
          key={task.id}
          className={`mb-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
            draggedTaskId === task.id ? "opacity-50" : ""
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, task.id)}
          onClick={() => openEditDialog(task)}
        >
          <CardHeader className="flex flex-row justify-between items-start p-3">
            <CardTitle className="text-base font-semibold truncate flex-1">
              {task.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 p-3 pt-0">
            {task.description && (
              <p className="mb-2 line-clamp-3">{task.description}</p>
            )}
            {task.assignee && (
              <p className="text-xs text-gray-500">
                Assigned to: {task.assignee}
              </p>
            )}
            {task.dueDate && (
              <p className="text-xs text-gray-500">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button
            className="ml-2 underline"
            onClick={() => {
              setError(null);
              fetchTasks();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">The Weekly Spaceman</h1>
          <p className="text-sm text-gray-500">Content Pipeline Management</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <PlusIcon className="h-4 w-4" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
            <div className="space-y-4">
              <Input
                name="title"
                placeholder="Title *"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={200}
              />
              <Textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                maxLength={2000}
              />
              <Input
                name="assignee"
                placeholder="Assignee"
                value={formData.assignee}
                onChange={handleInputChange}
              />
              <Input
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
              <div>
                <label className="block mb-1 text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <span>{formData.status}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
                  {editingTask ? "Save Changes" : "Add Task"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto">
        {STATUS_ORDER.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div
              key={status}
              className="bg-gray-50 rounded-lg border p-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="text-center mb-2">
                <h3 className="text-sm font-bold">{status}</h3>
                <p className="text-xs text-gray-400">
                  {columnTasks.length} task{columnTasks.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ScrollArea className="h-[60vh] pr-2">
                {renderColumnTasks(status)}
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
