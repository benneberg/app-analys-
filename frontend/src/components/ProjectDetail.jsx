import React, { useState } from 'react';
import { FileText, ExternalLink, Code, MessageSquare, Send } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';

export const ProjectDetail = ({ project, onClose }) => {
  const { experts, settings } = useData();
  const [selectedExpert, setSelectedExpert] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskExpert = async () => {
    if (!query.trim() || !selectedExpert) {
      toast.error('Please select an expert and enter a query');
      return;
    }

    if (!settings.groqApiKey || !settings.selectedModel) {
      toast.error('Please configure Groq API settings first');
      return;
    }

    const expert = experts.find(e => e.id === selectedExpert);
    if (!expert) return;

    setIsLoading(true);
    try {
      // Build context
      let context = `Project: ${project.name}\n`;
      if (project.description) context += `Description: ${project.description}\n`;
      if (project.context) context += `\nREADME:\n${project.context}\n`;
      if (project.code) context += `\nCode:\n${project.code}\n`;
      if (project.urls && project.urls.length > 0) {
        context += `\nURLs:\n${project.urls.join('\n')}\n`;
      }

      // Build expert prompt
      const expertPrompt = `You will be acting as a domain expert to provide specialized advice and guidance. Your role and expertise area are defined below.

<role>
${expert.role}
</role>

<domain_description>
${expert.domain_description}
</domain_description>

<key_objectives>
${expert.key_objectives}
</key_objectives>

You are ${expert.role}, an expert in ${expert.domain_description}. Your goal is to provide ${expert.key_objectives}.

Follow these core behavioral guidelines:

**Context Usage:**
- Base all responses strictly on the provided context below. Do not hallucinate or invent information not present in the context or your verified training knowledge.
- If the context is insufficient to provide accurate advice, explicitly state "I don't have enough information about [specific missing details]" and ask for the needed information.
- Do not make assumptions beyond what is clearly stated or reasonably inferred from the context.

**Response Approach:**
- Use step-by-step reasoning internally before responding, but present only your final answer unless specifically asked to show your thinking process.
- Be proactive: if the user query implies you need additional information (such as target audience, budget, technical specifications, etc.), ask clarifying questions.
- Keep responses concise, professional, and actionable.
- Use bullet points or numbered lists when presenting multiple items or steps.
- Maintain your expert role consistently throughout the interaction.

**Safety and Accuracy:**
- Only provide advice based on verified knowledge from the context or established best practices in your domain.
- If uncertain about any aspect, say "I don't have enough information to provide accurate guidance on this" and suggest next steps.
- Provide balanced, ethical advice that focuses on value creation rather than manipulation or harmful practices.

**Output Format:**
- For multi-step processes, use numbered lists.
- End responses with a clear summary or recommended next action when relevant.
- Keep language simple and direct while maintaining professional expertise.

<context>
${context}
</context>

<user_query>
${query}
</user_query>

Provide your expert response:`;

      const apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.selectedModel,
          messages: [
            settings.systemPrompt ? { role: 'system', content: settings.systemPrompt } : null,
            { role: 'user', content: expertPrompt }
          ].filter(Boolean),
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to get response from expert');
      }

      const data = await apiResponse.json();
      const expertResponse = data.choices[0].message.content;
      setResponse(expertResponse);
      toast.success('Expert response received');
    } catch (error) {
      console.error('Error asking expert:', error);
      toast.error('Failed to get expert response. Check your API settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{project.name}</DialogTitle>
        <DialogDescription>
          {project.description || 'View project details and consult AI experts'}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="info" className="mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="readme">README</TabsTrigger>
          <TabsTrigger value="expert">Ask Expert</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          {project.code && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code
              </Label>
              <div className="border-brutal bg-muted p-4 overflow-x-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">{project.code}</pre>
              </div>
            </div>
          )}

          {project.urls && project.urls.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                URLs
              </Label>
              <div className="border-brutal bg-muted p-4 space-y-2">
                {project.urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-medium hover:underline break-all"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {!project.code && (!project.urls || project.urls.length === 0) && (
            <div className="text-center py-8 text-muted-foreground font-medium">
              No additional information available
            </div>
          )}
        </TabsContent>

        <TabsContent value="readme">
          {project.context ? (
            <div className="border-brutal bg-muted p-4 overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">{project.context}</pre>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground font-medium">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No README generated yet</p>
              <p className="text-xs mt-2">Click "Profile App" on the project card to generate</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expert" className="space-y-4">
          <div className="space-y-2">
            <Label>Select Expert</Label>
            <Select value={selectedExpert} onValueChange={setSelectedExpert}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an expert..." />
              </SelectTrigger>
              <SelectContent>
                {experts.map((expert) => (
                  <SelectItem key={expert.id} value={expert.id}>
                    {expert.name} - {expert.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Your Question</Label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the expert about your project..."
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleAskExpert} 
            disabled={isLoading || !selectedExpert || !query.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Asking...' : 'Ask Expert'}
          </Button>

          {response && (
            <div className="space-y-2 mt-4">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Expert Response
              </Label>
              <div className="border-brutal bg-muted p-4 overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">{response}</pre>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};
