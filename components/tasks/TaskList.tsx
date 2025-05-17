'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Box,
  Menu,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Grid,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sort as SortIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Task, Agent } from '@/types/agent';
import { supabase } from '@/lib/supabase';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';

interface TaskListProps {
  selectedAgent: string | null;
}

const statusColors = {
  pending: 'default',
  in_progress: 'primary',
  completed: 'success',
  failed: 'error',
} as const;

const priorityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
} as const;

type SortField = 'created_at' | 'deadline' | 'priority';
type SortOrder = 'asc' | 'desc';

export default function TaskList({ selectedAgent }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  }, []);

  const handleTaskDelete = useCallback((deletedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== deletedTask.id)
    );
  }, []);

  const handleTaskInsert = useCallback((newTask: Task) => {
    setTasks((currentTasks) => [newTask, ...currentTasks]);
  }, []);

  // Subscribe to real-time updates
  useRealtimeSubscription<Task>('tasks', (payload) => {
    if (payload) {
      handleTaskUpdate(payload);
    }
  });

  useEffect(() => {
    fetchTasks();
    fetchAgents();
  }, [selectedAgent]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedAgent) {
        query = query.eq('assigned_to', selectedAgent);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        setError(`Failed to fetch tasks: ${error.message}`);
        return;
      }

      if (!data) {
        setError('No tasks found');
        return;
      }

      setTasks(data);
    } catch (error) {
      console.error('Error in fetchTasks:', error);
      setError('An unexpected error occurred while fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'idle');

      if (error) {
        console.error('Error fetching agents:', error);
        setError(`Failed to fetch agents: ${error.message}`);
        return;
      }

      if (!data) {
        setError('No agents found');
        return;
      }

      setAgents(data);
    } catch (error) {
      console.error('Error in fetchAgents:', error);
      setError('An unexpected error occurred while fetching agents');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!selectedTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          assigned_to: agentId,
          status: 'in_progress',
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      // Update agent status
      await supabase
        .from('agents')
        .update({ status: 'busy' })
        .eq('id', agentId);

      fetchTasks();
      fetchAgents();
    } catch (error) {
      console.error('Error assigning task:', error);
    } finally {
      handleMenuClose();
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
    handleMenuClose();
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskFormClose = () => {
    setIsTaskFormOpen(false);
    setEditingTask(undefined);
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
    handleMenuClose();
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply filters
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, statusFilter, priorityFilter, searchQuery, sortField, sortOrder]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={3}>
        <Typography color="error" variant="h6">
          Error
        </Typography>
        <Typography color="error">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setError(null);
            fetchTasks();
            fetchAgents();
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search tasks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortField}
                label="Sort By"
                onChange={(e) => setSortField(e.target.value as SortField)}
                startAdornment={<SortIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="created_at">Created Date</MenuItem>
                <MenuItem value="deadline">Deadline</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsTaskFormOpen(true)}
        >
          New Task
        </Button>
      </Box>

      <List>
        {filteredAndSortedTasks.map((task) => (
          <ListItem
            key={task.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{task.title}</Typography>
                  <Chip
                    label={task.priority}
                    color={priorityColors[task.priority]}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                  {task.deadline && (
                    <Typography variant="caption" color="text.secondary">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Chip
                label={task.status}
                color={statusColors[task.status]}
                size="small"
                sx={{ mr: 1 }}
              />
              <IconButton
                edge="end"
                aria-label="more"
                onClick={(e) => handleMenuClick(e, task)}
              >
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {agents.map((agent) => (
          <MenuItem
            key={agent.id}
            onClick={() => handleAssignAgent(agent.id)}
          >
            <AssignmentIcon sx={{ mr: 1 }} />
            Assign to {agent.name}
          </MenuItem>
        ))}
        {selectedTask && (
          <>
            <MenuItem onClick={() => handleViewTask(selectedTask)}>
              <VisibilityIcon sx={{ mr: 1 }} />
              View Details
            </MenuItem>
            <MenuItem onClick={() => handleEditTask(selectedTask)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => handleDeleteTask(selectedTask.id)}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
      </Menu>

      <TaskForm
        open={isTaskFormOpen}
        onClose={handleTaskFormClose}
        onTaskCreated={handleTaskCreated}
        task={editingTask}
      />

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={isTaskDetailOpen}
          onClose={() => setIsTaskDetailOpen(false)}
        />
      )}
    </Box>
  );
} 