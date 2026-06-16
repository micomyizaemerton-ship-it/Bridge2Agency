/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, Brain, Search, MapPin, Image, RefreshCw, Trash2, ArrowUpRight, HelpCircle, Download } from 'lucide-react';
import { ChatMessage, ImageResult } from '../types';

interface AICopilotProps {
  chatHistory: ChatMessage[];
  onSubmitChat: (prompt: string, mode: 'thinking' | 'search' | 'maps' | 'standard') => Promise<void>;
  onGenerateImage: (prompt: string, size: '1K' | '2K' | '4K') => Promise<ImageResult | null>;
  clearHistory: () => void;
  isLoading: boolean;
}

export default function AICopilot({ chatHistory, onSubmitChat, onGenerateImage, clearHistory, isLoading }: AICopilotProps) {
  const [prompt, setPrompt] = useState('');
  const [activeMode, setActiveMode] = useState<'thinking' | 'search' | 'maps' | 'standard'>('thinking');
  
  // Image Generator States
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<ImageResult[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    const currentPrompt = prompt;
    setPrompt('');
    await onSubmitChat(currentPrompt, activeMode);
  };

  const handleCreateImage = async () => {
    if (!imgPrompt.trim() || isGeneratingImg) return;
    setIsGeneratingImg(true);
    const result = await onGenerateImage(imgPrompt, imgSize);
    if (result) {
      setGeneratedImages(prev => [result, ...prev]);
      setImgPrompt('');
    }
    setIsGeneratingImg(false);
  };

  const modeDetails = {
    thinking: { label: 'High Reasoning (Gemini 3.1 Pro)', desc: 'Uncompromised architectural audit logs, integration schemes, and custom adapter code.', icon: Brain, color: 'text-purple-400 border-purple-500/20' },
    search: { label: 'Google Search data (Gemini 3.5 Flash)', desc: 'Real-time query grounding inside official Rwanda Ministry of Health guidelines/policies.', icon: Search, color: 'text-cyan-400 border-cyan-500/20' },
    maps: { label: 'Google Maps data (Gemini 3.5 Flash)', desc: 'Facility locations coordinate verification, routes, and geographic boundaries.', icon: MapPin, color: 'text-emerald-400 border-emerald-500/20' },
    standard: { label: 'Standard fast chat', desc: 'Minimal latency general overview or simple health informatics stubs.', icon: Sparkles, color: 'text-slate-400 border-slate-700/60' }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans select-none" id="ai-intelligence-module">
      {/* Configuration column */}
      <div className="lg:col-span-1 flex flex-col gap-5">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Brain className="h-4.5 w-4.5 text-emerald-400" /> Copilot Configurations
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Choose the specific LLM pipeline and integrated grounding data tools required for the task.
          </p>

          <div className="flex flex-col gap-2.5 mt-4">
            {(Object.keys(modeDetails) as Array<keyof typeof modeDetails>).map((key) => {
              const info = modeDetails[key];
              const Icon = info.icon;
              const isSelected = activeMode === key;
              return (
                <button
                  key={key}
                  id={`mode-config-btn-${key}`}
                  onClick={() => setActiveMode(key)}
                  className={`p-3 rounded-xl border text-left transition duration-150 flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 border-emerald-500/25 ring-1 ring-emerald-500/10'
                      : 'bg-transparent border-slate-900 hover:bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${info.color.split(' ')[0]}`} />
                    <span className="text-[11px] font-bold text-slate-200">{info.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal leading-relaxed">{info.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Image generator sandbox */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block leading-none">High-Qual Image Gen</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Generate customized medical schematic diagrams or launcher assets with exact resolution criteria (supports 1K, 2K, 4K).
          </p>

          <div className="flex flex-col gap-3 mt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Output Dimensions</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['1K', '2K', '4K'].map((size) => (
                  <button
                    key={size}
                    id={`size-choice-${size}`}
                    onClick={() => setImgSize(size as any)}
                    className={`text-[10px] py-1 rounded-lg font-bold transition ${
                      imgSize === size 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/10' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Asset Prompt</label>
              <textarea
                placeholder="e.g. Minimalist clean blueprint showing cross-platform health event routing diagram..."
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                rows={2}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
              />
            </div>

            <button
              id="generate-app-asset-btn"
              disabled={isGeneratingImg || !imgPrompt.trim()}
              onClick={handleCreateImage}
              className="bg-purple-600 hover:bg-purple-500 text-slate-100 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {isGeneratingImg ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-200" />
                  Generating {imgSize}...
                </>
              ) : (
                <>
                  <Image className="h-3.5 w-3.5" /> Synthesize Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Chat & Output feeds */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col h-[520px] overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" /> Consulting Terminal
              </h4>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">MODE: {activeMode.toUpperCase()}</p>
            </div>
            <button
              id="clear-chat-history"
              onClick={clearHistory}
              className="p-1 px-2 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-[10px] font-mono font-bold uppercase"
            >
              <Trash2 className="h-3 w-3" /> Reset Session
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 leading-relaxed text-xs">
            {chatHistory.length === 0 ? (
              <div className="my-auto text-center flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <Brain className="h-6 w-6 text-emerald-400 animate-pulse" />
                </div>
                <div className="max-w-xs">
                  <h5 className="font-bold text-slate-200">Consult BridgeAI</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Query integration strategies, schema guidelines, or administrative structures. Ask how a single health event propagates using the One-Update Rule!
                  </p>
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  id={`chat-msg-${msg.id}`}
                  className={`flex flex-col gap-1.5 p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-800 text-slate-100 self-end border border-slate-700/40 rounded-tr-none'
                      : 'bg-slate-950 text-slate-300 self-start border border-slate-900 rounded-tl-none'
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                    {msg.sender === 'user' ? 'Client Request' : 'BridgeCore AI'}
                  </span>
                  <p className="text-xs whitespace-pre-wrap select-text leading-relaxed tracking-normal">{msg.text}</p>
                  
                  {/* Grounded Sources */}
                  {msg.groundedSources && msg.groundedSources.length > 0 && (
                    <div className="mt-3 border-t border-slate-900/40 pt-2 flex flex-col gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Grounding Citations</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundedSources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-[10px] font-mono transition border border-cyan-500/5 select-none"
                          >
                            <span>{src.title.length > 25 ? `${src.title.substring(0, 25)}...` : src.title}</span>
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="bg-slate-950/40 text-slate-400 p-4 border border-dashed border-slate-850 rounded-2xl flex flex-col gap-2.5 self-start animate-pulse max-w-[80%]">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    {activeMode === 'thinking' ? 'Reasoning Engine Engaged (Thinking Mode)...' : 'Grounding Database Indexing...'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Analyzing central system blueprints, checking OpenMRS endpoints, and validating FHIR specifications.
                </p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSendPrompt} className="mt-4 flex gap-2 pt-3 border-t border-slate-800/60">
            <input
              type="text"
              id="ai-console-input"
              required
              disabled={isLoading}
              placeholder={
                activeMode === 'thinking'
                  ? "Ask architect about integration, OpenMRS schema, RBAC audit rules..."
                  : activeMode === 'search'
                  ? "Search ground: 'What are Rwanda standard TB treatment protocols?'"
                  : "Search maps: 'Find coordinate references for health centers in Gasabo district'"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              id="send-ai-btn"
              disabled={isLoading || !prompt.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2.5 rounded-xl transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed leading-none flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(16,185,129,0.3)] select-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Local Graphics gallery from prompt synthetics */}
        {generatedImages.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest leading-none block">Synthesized System assets</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generatedImages.map((img) => (
                <div key={img.id} className="bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden group flex flex-col" id={`img-card-${img.id}`}>
                  <div className="relative aspect-square bg-slate-900 select-none overflow-hidden max-h-[300px]">
                    <img
                      src={img.url}
                      alt={img.prompt}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-slate-950/80 border border-slate-800/60 text-slate-300 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">
                      {img.size}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-1 flex-1 bg-slate-950 leading-relaxed justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-200 leading-normal line-clamp-2">{img.prompt}</p>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{img.timestamp}</span>
                    </div>
                    <a
                      href={img.url}
                      download={`B2A_Asset_${img.size}_${img.id}.png`}
                      className="mt-2 text-[10px] font-mono font-bold text-emerald-400 select-none flex items-center gap-1 hover:text-emerald-300 self-start"
                    >
                      <Download className="h-3 w-3" /> Save Asset File
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
