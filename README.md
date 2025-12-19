# The Weekly Spaceman - Project Management App

A Kanban-style project management board designed for managing the content pipeline at **The Weekly Spaceman**. Track articles and content through the entire workflow from idea to publication.

## Features

- **7-Stage Content Pipeline**: Idea → Assigned → Drafting → Editing → Fact-Check → Scheduled → Published
- **Drag & Drop**: Move tasks between columns by dragging
- **Full CRUD Operations**: Create, read, update, and delete tasks
- **Task Details**: Title, description, assignee, due date, and status
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Changes sync with the backend API

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

3. **Open your browser:**

   Navigate to [http://localhost:4000](http://localhost:4000)

That's it! The app is ready to use.

## Project Structure

```
weekly-spaceman-pm-app/
├── package.json                    # NPM configuration and dependencies
├── server.js                       # Express backend API
├── public/
│   └── index.html                  # Standalone frontend (Tailwind CSS)
├── project_management_app.jsx      # React component (for integration)
└── README.md                       # This file
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (optional: `?status=X` or `?assignee=Y`) |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/api/statuses` | Get list of valid workflow statuses |

### Task Object

```json
{
  "id": "uuid",
  "title": "Article title (required)",
  "description": "Optional description",
  "assignee": "Person responsible",
  "dueDate": "2024-12-31",
  "status": "Idea|Assigned|Drafting|Editing|Fact-Check|Scheduled|Published",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Workflow Statuses

| Status | Description |
|--------|-------------|
| **Idea** | Initial concept or pitch |
| **Assigned** | Task assigned to a writer |
| **Drafting** | Writer is working on the first draft |
| **Editing** | Editor is reviewing and refining |
| **Fact-Check** | Verifying facts and sources |
| **Scheduled** | Ready for publication, scheduled |
| **Published** | Live on the website |

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |

Example:
```bash
PORT=3000 npm start
```

## React Component Integration

The `project_management_app.jsx` file provides a React component that can be integrated into existing React applications (Create React App, Next.js, etc.).

### Requirements

- React 18+
- shadcn/ui components
- Tailwind CSS
- lucide-react icons

### Usage

```jsx
import ProjectManagementApp from './project_management_app';

function App() {
  return <ProjectManagementApp />;
}
```

### Configure API URL

Set the `REACT_APP_API_URL` environment variable:

```bash
REACT_APP_API_URL=http://localhost:4000 npm start
```

## Development Notes

### Current Limitations

- **In-Memory Storage**: Tasks are stored in memory and will be lost when the server restarts. For production, integrate a database (PostgreSQL, MongoDB, etc.).
- **No Authentication**: All users share the same task pool. Add JWT or session-based auth for multi-user environments.

### Future Improvements

- Database integration for persistence
- User authentication and authorization
- File attachments for tasks
- Comments and activity log
- Email notifications for due dates
- Export to CSV/PDF

## License

MIT License - Feel free to use and modify for your own purposes.
