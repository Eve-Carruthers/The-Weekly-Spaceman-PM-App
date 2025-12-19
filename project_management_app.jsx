import React, { useState } from "react";
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
import { PlusIcon, XIcon } from "lucide-react";

/**
 * ProjectManagementApp
 *
 * This component implements a lightweight project management board inspired by
 * Notion and Slack/Discord workflows. Tasks are organised into columns
 * representing different statuses. Users can add new tasks, edit existing
 * ones and drag tasks between columns (drag logic to be implemented).
 *
 * Features:
 * - Dynamic columns representing workflow stages (Idea, Assigned, Drafting, Editing, Fact‑Check, Scheduled, Published)
 * - Modal dialog for creating new tasks with title, description, assignee and due date
 * - Responsive grid layout with Tailwind CSS
 * - Uses shadcn/ui components for consistent styling
 */

const STATUS_ORDER = [
  "Idea",
  "Assigned",
  "Drafting",
  "Editing",
  "Fact‑Check",
  "Scheduled",
  "Published",
];

export default function ProjectManagementApp() {
  // Task state: an array of objects { id, title, description, assignee, status, dueDate }
  const [tasks, setTasks] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "",
    status: "Idea",
    dueDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (value) => {
    setFormData({ ...formData, status: value });
  };

  const addTask = () => {
    if (!formData.title.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      ...formData,
    };
    setTasks([...tasks, newTask]);
    setFormData({ title: "", description: "", assignee: "", status: "Idea", dueDate: "" });
    setDialogOpen(false);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  // Render tasks for a given status
  const renderColumnTasks = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .map((task) => (
        <Card key={task.id} className="mb-2 shadow-md">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold truncate">
              {task.title}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
              <XIcon className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p className="mb-2 line-clamp-3">{task.description}</p>
            {task.assignee && <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>}
            {task.dueDate && <p className="text-xs text-gray-500">Due: {task.dueDate}</p>}
          </CardContent>
        </Card>
      ));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Project Management Board</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <PlusIcon className="h-4 w-4" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
            <div className="space-y-4">
              <Input
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleInputChange}
              />
              <Textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
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
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={addTask}>Add Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg border p-2">
            <h3 className="text-sm font-bold mb-2 text-center">{status}</h3>
            <ScrollArea className="h-[60vh] pr-2">
              {renderColumnTasks(status)}
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}