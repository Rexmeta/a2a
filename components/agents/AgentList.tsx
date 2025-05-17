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
  CircularProgress,
  Button,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Agent } from '@/types/agent';
import { supabase } from '@/lib/supabase';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface AgentListProps {
  onSelectAgent: (agentId: string | null) => void;
  selectedAgent: string | null;
}

const statusColors = {
  idle: 'success',
  busy: 'warning',
  error: 'error',
} as const;

export default function AgentList({ onSelectAgent, selectedAgent }: AgentListProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useRealtimeSubscription<Agent>('agents', (payload) => {
    if (payload) {
      handleAgentUpdate(payload);
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchAgents();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
        setError(`Failed to fetch agents: ${error.message}`);
        return;
      }

      setAgents(data || []);
    } catch (error) {
      console.error('Error in fetchAgents:', error);
      setError('An unexpected error occurred while fetching agents');
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
      <Typography variant="h6" gutterBottom>
        Agents
      </Typography>
      <List>
        {agents.map((agent) => (
          <ListItem
            key={agent.id}
            button
            selected={selectedAgent === agent.id}
            onClick={() => onSelectAgent(agent.id)}
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
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(agent.id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 