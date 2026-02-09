'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers, Sparkles, Type, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-foreground" />
          <span className="font-semibold text-foreground tracking-tight">Text Behind Image</span>
        </div>
        <Link href="/app">
          <Button size="sm" className="gap-2">
            Open Editor
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Now with AI Image Generation
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl text-balance leading-[1.1]">
            Place text behind
            <br />
            <span className="text-muted-foreground">any image</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl text-pretty leading-relaxed">
            Create stunning text-behind-image designs in seconds. Upload a photo or generate one with AI, then add text that seamlessly blends behind the subject.
          </p>
          <div className="flex items-center gap-3 mt-10">
            <Link href="/app">
              <Button size="lg" className="gap-2 h-12 px-8 text-base">
                Start Creating
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No account required. Free to use.
          </p>
        </section>

        {/* Features */}
        <section className="px-6 pb-24">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {[
              {
                icon: <Layers className="h-5 w-5" />,
                title: 'Auto Background Removal',
                description: 'AI-powered subject detection that removes backgrounds instantly.',
              },
              {
                icon: <Type className="h-5 w-5" />,
                title: 'Advanced Typography',
                description: 'Stroke, shadow, gradient text with full font control and 3D effects.',
              },
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: 'AI Generation',
                description: 'Generate images from text prompts with reference photos using fal AI.',
              },
              {
                icon: <Download className="h-5 w-5" />,
                title: 'High-Res Export',
                description: 'Export your designs in full resolution PNG ready for any platform.',
              },
            ].map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3 p-8 bg-card">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-foreground">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 pb-24">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-16 text-center">
            {[
              { value: '400K+', label: 'Designs Created' },
              { value: '250+', label: 'Google Fonts' },
              { value: '100%', label: 'Free to Use' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-4xl font-bold text-foreground tracking-tight">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6 py-16 px-8 rounded-xl border border-border bg-card">
            <h2 className="text-3xl font-bold text-foreground tracking-tight text-balance">
              Ready to create something stunning?
            </h2>
            <p className="text-muted-foreground max-w-md text-pretty">
              Open the editor, upload or generate an image, and start designing in seconds.
            </p>
            <Link href="/app">
              <Button size="lg" className="gap-2 h-12 px-8">
                Open Editor
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center px-6 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          2026 Text Behind Image. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
