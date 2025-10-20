import React, { useEffect } from 'react';
import { Settings as SettingsIcon, Key, Zap, Thermometer, Hash, FileText, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { settings, updateSettings, models, isLoadingModels, fetchModels } = useData();

  // Fetch models when API key is set
  useEffect(() => {
    if (settings.groqApiKey && models.length === 0) {
      fetchModels();
    }
  }, []);

  const handleApiKeyChange = (value) => {
    updateSettings({ groqApiKey: value });
  };

  const handleFetchModels = () => {
    fetchModels();
  };

  const handleTestConnection = async () => {
    if (!settings.groqApiKey) {
      toast.error('Please enter your Groq API key first');
      return;
    }

    try {
      toast.info('Testing connection...');
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${settings.groqApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Connection successful!');
        fetchModels();
      } else {
        toast.error('Connection failed. Check your API key.');
      }
    } catch (error) {
      toast.error('Connection failed. Check your API key.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Configure your Groq API and AI parameters
        </p>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Groq API Configuration
          </CardTitle>
          <CardDescription>
            Configure your Groq API key for fast LLM inference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key *</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value={settings.groqApiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="gsk_..."
                className="flex-1"
              />
              <Button variant="outline" onClick={handleTestConnection}>
                Test
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Get your API key from{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Groq Console
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <div className="flex gap-2">
              <Select
                value={settings.selectedModel}
                onValueChange={(value) => updateSettings({ selectedModel: value })}
              >
                <SelectTrigger id="model" className="flex-1">
                  <SelectValue placeholder="Select a model..." />
                </SelectTrigger>
                <SelectContent>
                  {models.length === 0 ? (
                    <SelectItem value="no-models" disabled>
                      No models loaded
                    </SelectItem>
                  ) : (
                    models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleFetchModels}
                disabled={isLoadingModels || !settings.groqApiKey}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {isLoadingModels ? 'Loading models...' : 'Select the LLM model to use'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Model Parameters
          </CardTitle>
          <CardDescription>
            Fine-tune AI behavior and output characteristics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperature
              </Label>
              <span className="text-sm font-bold border-brutal-sm px-3 py-1 bg-muted">
                {settings.temperature.toFixed(2)}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[settings.temperature]}
              onValueChange={(value) => updateSettings({ temperature: value[0] })}
            />
            <p className="text-xs text-muted-foreground font-medium">
              Lower = More focused and deterministic. Higher = More creative and random.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-tokens" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Max Tokens
            </Label>
            <Input
              id="max-tokens"
              type="number"
              min={100}
              max={8000}
              value={settings.maxTokens}
              onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) || 1000 })}
            />
            <p className="text-xs text-muted-foreground font-medium">
              Maximum number of tokens to generate (100-8000)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-prompt" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              System Prompt (Optional)
            </Label>
            <Textarea
              id="system-prompt"
              value={settings.systemPrompt}
              onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
              placeholder="Add a custom system prompt to guide AI behavior..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground font-medium">
              Optional instructions that apply to all AI interactions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-accent/10 border-accent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-accent p-3 border-brutal-sm">
              <SettingsIcon className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase mb-1">Data Storage</h3>
              <p className="text-sm font-medium text-muted-foreground">
                All your data is stored locally in your browser using localStorage. 
                Your API key and settings are never sent to any server except Groq's API when making requests.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
