import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, generateId } from '../lib/utils';
import { toast } from 'sonner';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [experts, setExperts] = useState([]);
  const [settings, setSettings] = useState({
    groqApiKey: '',
    selectedModel: '',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: '',
  });
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjects = storage.get('projects') || [];
    const savedExperts = storage.get('experts') || getDefaultExperts();
    const savedSettings = storage.get('settings') || {};
    
    setProjects(savedProjects);
    setExperts(savedExperts);
    setSettings(prev => ({ ...prev, ...savedSettings }));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    storage.set('projects', projects);
  }, [projects]);

  useEffect(() => {
    storage.set('experts', experts);
  }, [experts]);

  useEffect(() => {
    storage.set('settings', settings);
  }, [settings]);

  // Fetch available models from Groq API
  const fetchModels = async () => {
    if (!settings.groqApiKey) {
      toast.error('Please set your Groq API key first');
      return;
    }

    setIsLoadingModels(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${settings.groqApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      const modelList = data.data.map(model => ({
        id: model.id,
        name: model.id,
      }));
      setModels(modelList);
      
      if (modelList.length > 0 && !settings.selectedModel) {
        updateSettings({ selectedModel: modelList[0].id });
      }
      
      toast.success('Models loaded successfully');
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to fetch models. Check your API key.');
      // Set some default models as fallback
      const defaultModels = [
        { id: 'llama3-8b-8192', name: 'llama3-8b-8192' },
        { id: 'llama3-70b-8192', name: 'llama3-70b-8192' },
        { id: 'mixtral-8x7b-32768', name: 'mixtral-8x7b-32768' },
        { id: 'gemma-7b-it', name: 'gemma-7b-it' },
      ];
      setModels(defaultModels);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Project CRUD
  const addProject = (project) => {
    const newProject = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
      context: '',
    };
    setProjects(prev => [newProject, ...prev]);
    toast.success('Project created successfully');
    return newProject;
  };

  const updateProject = (id, updates) => {
    setProjects(prev =>
      prev.map(project => (project.id === id ? { ...project, ...updates } : project))
    );
    toast.success('Project updated successfully');
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    toast.success('Project deleted successfully');
  };

  // Expert CRUD
  const addExpert = (expert) => {
    const newExpert = {
      ...expert,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExperts(prev => [newExpert, ...prev]);
    toast.success('Expert created successfully');
    return newExpert;
  };

  const updateExpert = (id, updates) => {
    setExperts(prev =>
      prev.map(expert => (expert.id === id ? { ...expert, ...updates } : expert))
    );
    toast.success('Expert updated successfully');
  };

  const deleteExpert = (id) => {
    setExperts(prev => prev.filter(expert => expert.id !== id));
    toast.success('Expert deleted successfully');
  };

  // Settings
  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // AI Profile App function
  const profileApp = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (!settings.groqApiKey) {
      toast.error('Please set your Groq API key in settings');
      return;
    }

    if (!settings.selectedModel) {
      toast.error('Please select a model in settings');
      return;
    }

    try {
      toast.info('Analyzing application...');
      
      // Build context from project data
      let contextInfo = `Project: ${project.name}\n`;
      if (project.description) contextInfo += `Description: ${project.description}\n`;
      if (project.code) contextInfo += `\nCode:\n${project.code}\n`;
      if (project.urls && project.urls.length > 0) {
        contextInfo += `\nURLs:\n${project.urls.join('\n')}\n`;
      }

      const prompt = `You are a technical documentation expert. Based on the following application information, generate a comprehensive README.md file. The README should include:

1. Project Title and Description
2. Key Features (inferred from code/URLs)
3. Tech Stack (identified from code patterns)
4. Installation Instructions (if applicable)
5. Usage Examples
6. API Documentation (if applicable)
7. Contributing Guidelines
8. License

Important: Only include factual information that can be directly inferred from the provided context. Do not hallucinate or make assumptions. If information is missing, indicate it clearly.

Application Information:
${contextInfo}

Generate a professional README.md:`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.selectedModel,
          messages: [
            settings.systemPrompt ? { role: 'system', content: settings.systemPrompt } : null,
            { role: 'user', content: prompt }
          ].filter(Boolean),
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate README');
      }

      const data = await response.json();
      const readme = data.choices[0].message.content;

      updateProject(projectId, { context: readme });
      toast.success('README.md generated successfully!');
      return readme;
    } catch (error) {
      console.error('Error profiling app:', error);
      toast.error('Failed to generate README. Check your API key and settings.');
    }
  };

  const value = {
    projects,
    experts,
    settings,
    models,
    isLoadingModels,
    addProject,
    updateProject,
    deleteProject,
    addExpert,
    updateExpert,
    deleteExpert,
    updateSettings,
    fetchModels,
    profileApp,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

// Default preset experts
function getDefaultExperts() {
  return [
    {
      id: generateId(),
      name: 'Marketing Expert',
      role: 'Marketing Strategist',
      domain_description: 'Digital marketing, brand strategy, customer acquisition, and growth marketing',
      key_objectives: 'Strategic marketing advice, campaign optimization, brand positioning, and market analysis',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Senior Developer',
      role: 'Senior Software Engineer',
      domain_description: 'Software architecture, code quality, best practices, and technical problem-solving',
      key_objectives: 'Technical guidance, code reviews, architectural decisions, and development best practices',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'SEO Specialist',
      role: 'SEO Expert',
      domain_description: 'Search engine optimization, content strategy, technical SEO, and organic growth',
      key_objectives: 'SEO audits, keyword research, technical optimization, and organic traffic growth strategies',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'UI Designer',
      role: 'UI/UX Designer',
      domain_description: 'User interface design, user experience, visual design, and interaction patterns',
      key_objectives: 'Design critiques, UI/UX improvements, accessibility guidelines, and visual design principles',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Copywriter',
      role: 'Content Strategist & Copywriter',
      domain_description: 'Content creation, copywriting, messaging, tone of voice, and content strategy',
      key_objectives: 'Compelling copy, content strategy, messaging optimization, and editorial guidance',
      createdAt: new Date().toISOString(),
    },
  ];
}
