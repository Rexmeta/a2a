'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Agent } from '@/types/agent';
import { supabase } from '@/lib/supabase';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

const statusColors = {
  idle: 'success',
  busy: 'warning',
  error: 'error',
} as const;

export default function AgentList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAgentUpdate = useCallback((updatedAgent: Agent) => {
    setAgents((currentAgents) =>
      currentAgents.map((agent) =>
        agent.id === updatedAgent.id ? updatedAgent : agent
      )
    );
  }, []);

  const handleAgentDelete = useCallback((deletedAgent: Agent) => {
    setAgents((currentAgents) =>
      currentAgents.filter((agent) => agent.id !== deletedAgent.id)
    );
  }, []);

  const handleAgentInsert = useCallback((newAgent: Agent) => {
    setAgents((currentAgents) => [newAgent, ...currentAgents]);
  }, []);

  // Subscribe to real-time updates
  useRealtimeSubscription<Agent>('agents', (payload) => {
    if (payload) {
      handleAgentUpdate(payload);
    }
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  if (loading) {
    return <Typography>Loading agents...</Typography>;
  }

  return (
    <List>
      {agents.map((agent) => (
        <ListItem
          key={agent.id}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            mb: 1,
          }}
        >
          <ListItemText
            primary={agent.name}
            secondary={
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {agent.description}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {agent.capabilities.map((capability) => (
                    <Chip
                      key={capability}
                      label={capability}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Chip
              label={agent.status}
              color={statusColors[agent.status]}
              size="small"
              sx={{ mr: 1 }}
            />
            <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleDelete(agent.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
} 