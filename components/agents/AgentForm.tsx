'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Agent } from '@/types/agent';
import { supabase } from '@/lib/supabase';

interface AgentFormProps {
  open: boolean;
  onClose: () => void;
  agent?: Agent;
  onSuccess: () => void;
}

const defaultCapabilities = [
  'Text Generation',
  'Code Analysis',
  'Data Processing',
  'Image Generation',
  'Task Planning',
  'Research',
  'Translation',
];

export default function AgentForm({ open, onClose, agent, onSuccess }: AgentFormProps) {
  const [formData, setFormData] = useState<Partial<Agent>>(
    agent || {
      name: '',
      description: '',
      capabilities: [],
      status: 'idle',
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (agent) {
        // Update existing agent
        const { error } = await supabase
          .from('agents')
          .update(formData)
          .eq('id', agent.id);

        if (error) throw error;
      } else {
        // Create new agent
        const { error } = await supabase.from('agents').insert([formData]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{agent ? 'Edit Agent' : 'Register New Agent'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              required
              fullWidth
            />
            <Autocomplete
              multiple
              options={defaultCapabilities}
              value={formData.capabilities}
              onChange={(_, newValue) => setFormData({ ...formData, capabilities: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Capabilities"
                  placeholder="Select capabilities"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : agent ? 'Update' : 'Register'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 