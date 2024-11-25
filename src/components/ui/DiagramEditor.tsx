'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import GitHubButton from 'react-github-btn'
import Editor from "@monaco-editor/react";
import mermaid from "mermaid";
import { Toaster, toast } from 'react-hot-toast';

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ZoomIn, ZoomOut, Share2 } from 'lucide-react';


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
  const [zoomLevel, setZoomLevel] = useState(1);

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

  // Add near the top of the component
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('code');
    if (sharedCode) {
      try {
        const decodedCode = atob(sharedCode);
        setCode(decodedCode);
      } catch (e) {
        console.error('Failed to decode shared URL');
      }
    }
  }, []);

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const params = new URLSearchParams();
                params.set('code', btoa(code));
                const url = `${window.location.origin}?${params.toString()}`;
                navigator.clipboard.writeText(url);
                toast.success('Share URL copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4" />
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
          <div className="h-full p-4 bg-white dark:bg-gray-900 relative">
            <div className="absolute top-10 right-10 flex gap-2">
              <Button 
                variant="secondary" 
                size="icon"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="icon"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
            <div 
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s'
              }}
            >
              <div ref={diagramRef} className="mermaid" />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster position="bottom-right" />
    </div>
  );
}