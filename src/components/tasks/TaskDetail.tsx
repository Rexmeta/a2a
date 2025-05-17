'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Task, Agent } from '@/types/agent';
import { supabase } from '@/lib/supabase';

interface TaskDetailProps {
  task: Task;
  open: boolean;
  onClose: () => void;
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

export default function TaskDetail({ task, open, onClose }: TaskDetailProps) {
  const [assignedAgent, setAssignedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (task.assignedTo) {
      fetchAssignedAgent();
    } else {
      setLoading(false);
    }
  }, [task.assignedTo]);

  const fetchAssignedAgent = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', task.assignedTo)
        .single();

      if (error) throw error;
      setAssignedAgent(data);
    } catch (error) {
      console.error('Error fetching assigned agent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{task.title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={task.status}
                color={statusColors[task.status]}
              />
              <Chip
                label={task.priority}
                color={priorityColors[task.priority]}
              />
            </Box>
            <Typography variant="body1" paragraph>
              {task.description}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Task Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Created"
                  secondary={new Date(task.createdAt).toLocaleString()}
                />
              </ListItem>
              {task.deadline && (
                <ListItem>
                  <ListItemText
                    primary="Deadline"
                    secondary={new Date(task.deadline).toLocaleString()}
                  />
                </ListItem>
              )}
              {task.updatedAt && (
                <ListItem>
                  <ListItemText
                    primary="Last Updated"
                    secondary={new Date(task.updatedAt).toLocaleString()}
                  />
                </ListItem>
              )}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Assigned Agent
            </Typography>
            {loading ? (
              <Typography>Loading agent information...</Typography>
            ) : assignedAgent ? (
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={assignedAgent.name}
                    secondary={assignedAgent.description}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Capabilities"
                    secondary={
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        {assignedAgent.capabilities.map((capability) => (
                          <Chip
                            key={capability}
                            label={capability}
                            size="small"
                          />
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            ) : (
              <Typography color="text.secondary">
                No agent assigned
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
} 