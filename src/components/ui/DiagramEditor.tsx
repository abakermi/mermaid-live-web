'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import GitHubButton from 'react-github-btn'
import Editor from "@monaco-editor/react";
import mermaid from "mermaid";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";


export default function DiagramEditor() {
  const [mounted, setMounted] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'config'>('code');
  const [code, setCode] = useState(`sequenceDiagram
    participant User as iOS App
    participant SK as StoreKit
    participant Worker as CF Worker`);
  const [config, setConfig] = useState(`{
  "theme": "default",
  "logLevel": 1,
  "securityLevel": "loose",
  "startOnLoad": true
}`);

  // Initialize mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false, // Important: we'll manually render
      theme: 'default',
      securityLevel: 'loose',
    });
    setMounted(true);
  }, []);

  // Render diagram with error handling
  const renderDiagram = useCallback(async () => {
    if (!mounted || !diagramRef.current) return;

    try {
      // Clear previous content
      diagramRef.current.innerHTML = '';
      
      // Generate unique ID for the diagram
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create and insert diagram
      const { svg } = await mermaid.render(id, code);
      diagramRef.current.innerHTML = svg;
    } catch (error) {
      console.error('Failed to render diagram:', error);
      // Optionally show error in UI
      if (diagramRef.current) {
        diagramRef.current.innerHTML = `<div class="text-red-500">Failed to render diagram</div>`;
      }
    }
  }, [code, mounted]);

  // Re-render on code changes
  useEffect(() => {
    const timer = setTimeout(() => {
      renderDiagram();
    }, 300);

    return () => clearTimeout(timer);
  }, [code, renderDiagram]);

  // Handle config changes
  const handleConfigChange = (value: string | undefined) => {
    setConfig(value || '');
    try {
      const configObj = JSON.parse(value || '{}');
      mermaid.initialize(configObj);
      renderDiagram();
    } catch (error) {
      console.error('Invalid config JSON:', error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-purple-600/90 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold">Mermaid Live Editor</span>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant={activeTab === 'code' ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab('code')}
            >
              Code
            </Button>
            <Button 
              variant={activeTab === 'config' ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab('config')}
            >
              Config
            </Button>
<GitHubButton href="https://github.com/abakermi/mermaid-live-web" data-color-scheme="no-preference: light; light: light; dark: dark;" data-size="large" aria-label="Star abakermi/mermaid-live-web on GitHub">Star</GitHubButton>
          </div>
        </div>

   
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ResizablePanel defaultSize={50}>
          <Editor
            height="100%"
            defaultLanguage={activeTab === 'code' ? 'markdown' : 'json'}
            language={activeTab === 'code' ? 'markdown' : 'json'}
            theme="vs-dark"
            value={activeTab === 'code' ? code : config}
            onChange={activeTab === 'code' ? (value: string | undefined) => setCode(value || '') : (value: string | undefined) => handleConfigChange(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div className="h-full p-4 bg-white dark:bg-gray-900">
            <div ref={diagramRef} className="mermaid" />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}