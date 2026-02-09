'use client'

import React, { useRef, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/mode-toggle';
import TextCustomizer from '@/components/editor/text-customizer';
import AiImageGenerator from '@/components/editor/ai-image-generator';

import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Sparkles, Upload, Download, ArrowLeft } from 'lucide-react';

import { removeBackground } from "@imgly/background-removal";

import '@/app/fonts.css';

const Page = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageSetupDone, setIsImageSetupDone] = useState<boolean>(false);
    const [removedBgImageUrl, setRemovedBgImageUrl] = useState<string | null>(null);
    const [textSets, setTextSets] = useState<Array<any>>([]);
    const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleUploadImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            await setupImage(imageUrl);
        }
    };

    const setupImage = async (imageUrl: string) => {
        try {
            const imageBlob = await removeBackground(imageUrl);
            const url = URL.createObjectURL(imageBlob);
            setRemovedBgImageUrl(url);
            setIsImageSetupDone(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAiImageGenerated = async (dataUrl: string) => {
        setIsImageSetupDone(false);
        setRemovedBgImageUrl(null);
        setSelectedImage(dataUrl);
        await setupImage(dataUrl);
    };

    const addNewTextSet = () => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, {
            id: newId,
            text: 'edit',
            fontFamily: 'Inter',
            top: 0,
            left: 0,
            color: '#ffffff',
            fontSize: 200,
            fontWeight: 800,
            opacity: 1,
            shadowColor: 'rgba(0, 0, 0, 0.8)',
            shadowSize: 0,
            rotation: 0,
            tiltX: 0,
            tiltY: 0,
            letterSpacing: 0,
            strokeColor: '#000000',
            strokeWidth: 0,
            useGradient: false,
            gradientFrom: '#ffffff',
            gradientTo: '#888888',
        }]);
    };

    const handleAttributeChange = (id: number, attribute: string, value: any) => {
        setTextSets(prev => prev.map(set => 
            set.id === id ? { ...set, [attribute]: value } : set
        ));
    };

    const duplicateTextSet = (textSet: any) => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, { ...textSet, id: newId }]);
    };

    const removeTextSet = (id: number) => {
        setTextSets(prev => prev.filter(set => set.id !== id));
    };

    const saveCompositeImage = () => {
        if (!canvasRef.current || !isImageSetupDone) return;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const bgImg = new (window as any).Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
    
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    
            textSets.forEach(textSet => {
                ctx.save();
                
                const scaledFontSize = textSet.fontSize * 3;
                ctx.font = `${textSet.fontWeight} ${scaledFontSize}px ${textSet.fontFamily}`;
                ctx.globalAlpha = textSet.opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
    
                const x = canvas.width * (textSet.left + 50) / 100;
                const y = canvas.height * (50 - textSet.top) / 100;
    
                ctx.translate(x, y);
                
                const tiltXRad = (-textSet.tiltX * Math.PI) / 180;
                const tiltYRad = (-textSet.tiltY * Math.PI) / 180;
    
                ctx.transform(
                    Math.cos(tiltYRad),
                    Math.sin(0),
                    -Math.sin(0),
                    Math.cos(tiltXRad),
                    0,
                    0
                );
    
                ctx.rotate((textSet.rotation * Math.PI) / 180);

                // Shadow
                if (textSet.shadowSize > 0) {
                    ctx.shadowColor = textSet.shadowColor;
                    ctx.shadowBlur = textSet.shadowSize * 3;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }

                // Stroke
                if (textSet.strokeWidth > 0) {
                    ctx.strokeStyle = textSet.strokeColor;
                    ctx.lineWidth = textSet.strokeWidth * 3;
                    ctx.lineJoin = 'round';
                    if (textSet.letterSpacing === 0) {
                        ctx.strokeText(textSet.text, 0, 0);
                    } else {
                        const chars = textSet.text.split('');
                        let totalWidth = 0;
                        chars.forEach((char: string, i: number) => {
                            totalWidth += ctx.measureText(char).width + (i < chars.length - 1 ? textSet.letterSpacing : 0);
                        });
                        let currentX = -totalWidth / 2;
                        chars.forEach((char: string) => {
                            const charWidth = ctx.measureText(char).width;
                            ctx.strokeText(char, currentX + charWidth / 2, 0);
                            currentX += charWidth + textSet.letterSpacing;
                        });
                    }
                }

                // Fill (gradient or solid)
                if (textSet.useGradient) {
                    const textWidth = ctx.measureText(textSet.text).width;
                    const gradient = ctx.createLinearGradient(-textWidth / 2, 0, textWidth / 2, 0);
                    gradient.addColorStop(0, textSet.gradientFrom);
                    gradient.addColorStop(1, textSet.gradientTo);
                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = textSet.color;
                }
    
                if (textSet.letterSpacing === 0) {
                    ctx.fillText(textSet.text, 0, 0);
                } else {
                    const chars = textSet.text.split('');
                    let totalWidth = 0;
                    chars.forEach((char: string, i: number) => {
                        totalWidth += ctx.measureText(char).width + (i < chars.length - 1 ? textSet.letterSpacing : 0);
                    });
                    let currentX = -totalWidth / 2;
                    chars.forEach((char: string) => {
                        const charWidth = ctx.measureText(char).width;
                        ctx.fillText(char, currentX + charWidth / 2, 0);
                        currentX += charWidth + textSet.letterSpacing;
                    });
                }
                ctx.restore();
            });
    
            if (removedBgImageUrl) {
                const removedBgImg = new (window as any).Image();
                removedBgImg.crossOrigin = "anonymous";
                removedBgImg.onload = () => {
                    ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height);
                    triggerDownload();
                };
                removedBgImg.src = removedBgImageUrl;
            } else {
                triggerDownload();
            }
        };
        bgImg.src = selectedImage || '';
    
        function triggerDownload() {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'text-behind-image.png';
            link.href = dataUrl;
            link.click();
        }
    };
    
    return (
        <div className='flex flex-col h-screen bg-background'>
            {/* Header */}
            <header className='flex items-center justify-between px-4 md:px-6 h-14 border-b border-border'>
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm hidden md:inline">Back</span>
                    </Link>
                    <Separator orientation="vertical" className="h-6" />
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">
                        <span className="md:hidden">TBI</span>
                        <span className="hidden md:inline">Text Behind Image</span>
                    </h2>
                </div>

                <div className='flex items-center gap-2'>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".jpg, .jpeg, .png"
                    />
                    <Button variant="outline" size="sm" onClick={handleUploadImage} className="gap-2">
                        <Upload className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Upload</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsAiGeneratorOpen(true)} className="gap-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">AI Generate</span>
                    </Button>
                    {selectedImage && (
                        <Button size="sm" onClick={saveCompositeImage} className="gap-2">
                            <Download className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Export</span>
                        </Button>
                    )}
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <ModeToggle />
                </div>
            </header>

            {selectedImage ? (
                <div className='flex flex-col md:flex-row flex-1 overflow-hidden'>
                    {/* Canvas area */}
                    <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-muted/30 overflow-auto">
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <div className="relative w-full max-w-2xl aspect-square rounded-lg overflow-hidden border border-border bg-muted/50 shadow-sm">
                            {isImageSetupDone ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={selectedImage} 
                                    alt="Uploaded"
                                    className="absolute inset-0 w-full h-full object-contain"
                                />
                            ) : (
                                <div className='flex flex-col items-center justify-center w-full h-full gap-3'>
                                    <ReloadIcon className='h-5 w-5 animate-spin text-muted-foreground' />
                                    <span className='text-sm text-muted-foreground'>Processing image...</span>
                                </div>
                            )}
                            {isImageSetupDone && textSets.map(textSet => (
                                <div
                                    key={textSet.id}
                                    style={{
                                        position: 'absolute',
                                        top: `${50 - textSet.top}%`,
                                        left: `${textSet.left + 50}%`,
                                        transform: `
                                            translate(-50%, -50%) 
                                            rotate(${textSet.rotation}deg)
                                            perspective(1000px)
                                            rotateX(${textSet.tiltX}deg)
                                            rotateY(${textSet.tiltY}deg)
                                        `,
                                        color: textSet.useGradient ? 'transparent' : textSet.color,
                                        background: textSet.useGradient
                                            ? `linear-gradient(90deg, ${textSet.gradientFrom}, ${textSet.gradientTo})`
                                            : 'none',
                                        WebkitBackgroundClip: textSet.useGradient ? 'text' : undefined,
                                        WebkitTextFillColor: textSet.useGradient ? 'transparent' : undefined,
                                        textAlign: 'center',
                                        fontSize: `${textSet.fontSize}px`,
                                        fontWeight: textSet.fontWeight,
                                        fontFamily: textSet.fontFamily,
                                        opacity: textSet.opacity,
                                        letterSpacing: `${textSet.letterSpacing}px`,
                                        transformStyle: 'preserve-3d',
                                        textShadow: textSet.shadowSize > 0
                                            ? `0 0 ${textSet.shadowSize}px ${textSet.shadowColor}`
                                            : 'none',
                                        WebkitTextStroke: textSet.strokeWidth > 0
                                            ? `${textSet.strokeWidth}px ${textSet.strokeColor}`
                                            : undefined,
                                    }}
                                >
                                    {textSet.text}
                                </div>
                            ))}
                            {removedBgImageUrl && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={removedBgImageUrl}
                                    alt="Removed bg"
                                    className="absolute top-0 left-0 w-full h-full object-contain"
                                /> 
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className='w-full md:w-[380px] border-t md:border-t-0 md:border-l border-border flex flex-col bg-background'>
                        <div className="p-3 border-b border-border">
                            <Button variant={'secondary'} onClick={addNewTextSet} className="w-full gap-2 h-9 text-sm">
                                <PlusIcon className='h-3.5 w-3.5' />
                                Add Text Layer
                            </Button>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-3">
                                <Accordion type="single" collapsible className="w-full">
                                    {textSets.map(textSet => (
                                        <TextCustomizer 
                                            key={textSet.id}
                                            textSet={textSet}
                                            handleAttributeChange={handleAttributeChange}
                                            removeTextSet={removeTextSet}
                                            duplicateTextSet={duplicateTextSet}
                                        />
                                    ))}
                                </Accordion>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            ) : (
                <div className='flex-1 flex flex-col items-center justify-center gap-6'>
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-2">
                            <Sparkles className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground tracking-tight">Get started</h2>
                        <p className="text-sm text-muted-foreground">Upload a photo or generate one with AI</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleUploadImage} className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Image
                        </Button>
                        <Button onClick={() => setIsAiGeneratorOpen(true)} className="gap-2">
                            <Sparkles className="h-4 w-4" />
                            Generate with AI
                        </Button>
                    </div>
                </div>
            )} 
            <AiImageGenerator
                isOpen={isAiGeneratorOpen}
                onClose={() => setIsAiGeneratorOpen(false)}
                onImageGenerated={handleAiImageGenerated}
            />
        </div>
    );
}

export default Page;
