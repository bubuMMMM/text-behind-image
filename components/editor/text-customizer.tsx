import React, { useState } from 'react';
import InputField from './input-field';
import SliderField from './slider-field';
import ColorPicker from './color-picker';
import FontFamilyPicker from './font-picker'; 
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Move, Text, Bold, RotateCw, Palette, LightbulbIcon, CaseSensitive, 
  TypeOutline, ArrowLeftRight, ArrowUpDown, AlignHorizontalSpaceAround,
  PenLine, Droplets, Gradient, Copy, Trash2
} from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface TextCustomizerProps {
    textSet: {
        id: number;
        text: string;
        fontFamily: string;
        top: number;
        left: number;
        color: string;
        fontSize: number;
        fontWeight: number;
        opacity: number;
        rotation: number;
        shadowColor: string;
        shadowSize: number;
        tiltX: number;
        tiltY: number;
        letterSpacing: number;
        strokeColor: string;
        strokeWidth: number;
        useGradient: boolean;
        gradientFrom: string;
        gradientTo: string;
    };
    handleAttributeChange: (id: number, attribute: string, value: any) => void;
    removeTextSet: (id: number) => void;
    duplicateTextSet: (textSet: any) => void;
}

const TextCustomizer: React.FC<TextCustomizerProps> = ({ textSet, handleAttributeChange, removeTextSet, duplicateTextSet }) => {
    const [activeControl, setActiveControl] = useState<string | null>(null);

    const controls = [
        { id: 'text', icon: <CaseSensitive size={16} />, label: 'Text' },
        { id: 'fontFamily', icon: <TypeOutline size={16} />, label: 'Font' },
        { id: 'color', icon: <Palette size={16} />, label: 'Color' },
        { id: 'gradient', icon: <Gradient size={16} />, label: 'Gradient' },
        { id: 'stroke', icon: <PenLine size={16} />, label: 'Stroke' },
        { id: 'shadow', icon: <Droplets size={16} />, label: 'Shadow' },
        { id: 'position', icon: <Move size={16} />, label: 'Position' },
        { id: 'fontSize', icon: <Text size={16} />, label: 'Size' },
        { id: 'fontWeight', icon: <Bold size={16} />, label: 'Weight' },
        { id: 'letterSpacing', icon: <AlignHorizontalSpaceAround size={16} />, label: 'Spacing' },
        { id: 'opacity', icon: <LightbulbIcon size={16} />, label: 'Opacity' },
        { id: 'rotation', icon: <RotateCw size={16} />, label: 'Rotate' },
        { id: 'tiltX', icon: <ArrowLeftRight size={16} />, label: 'Tilt X' },
        { id: 'tiltY', icon: <ArrowUpDown size={16} />, label: 'Tilt Y' },
    ];  

    const renderControl = (controlId: string) => {
        switch (controlId) {
            case 'text':
                return (
                    <InputField
                        attribute="text"
                        label="Text"
                        currentValue={textSet.text}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            case 'fontFamily':
                return (
                    <FontFamilyPicker
                        attribute="fontFamily"
                        currentFont={textSet.fontFamily}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            case 'color':
                return (
                    <ColorPicker
                        attribute="color"
                        label="Text Color"
                        currentColor={textSet.color}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            case 'gradient':
                return (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">Enable Gradient</Label>
                            <Switch
                                checked={textSet.useGradient}
                                onCheckedChange={(checked) => handleAttributeChange(textSet.id, 'useGradient', checked)}
                            />
                        </div>
                        {textSet.useGradient && (
                            <div className="flex flex-col gap-3">
                                <div className="h-8 w-full rounded-md border border-border"
                                    style={{ background: `linear-gradient(90deg, ${textSet.gradientFrom}, ${textSet.gradientTo})` }}
                                />
                                <div className="flex gap-3">
                                    <ColorPicker
                                        attribute="gradientFrom"
                                        label="From"
                                        currentColor={textSet.gradientFrom}
                                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                                    />
                                    <ColorPicker
                                        attribute="gradientTo"
                                        label="To"
                                        currentColor={textSet.gradientTo}
                                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'stroke':
                return (
                    <div className="flex flex-col gap-3">
                        <SliderField
                            attribute="strokeWidth"
                            label="Stroke Width"
                            min={0}
                            max={10}
                            step={0.5}
                            currentValue={textSet.strokeWidth}
                            hasTopPadding={false}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                        {textSet.strokeWidth > 0 && (
                            <ColorPicker
                                attribute="strokeColor"
                                label="Stroke Color"
                                currentColor={textSet.strokeColor}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}
                    </div>
                );
            case 'shadow':
                return (
                    <div className="flex flex-col gap-3">
                        <SliderField
                            attribute="shadowSize"
                            label="Shadow Blur"
                            min={0}
                            max={50}
                            step={1}
                            currentValue={textSet.shadowSize}
                            hasTopPadding={false}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                        {textSet.shadowSize > 0 && (
                            <ColorPicker
                                attribute="shadowColor"
                                label="Shadow Color"
                                currentColor={textSet.shadowColor}
                                handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            />
                        )}
                    </div>
                );
            case 'position':
                return (
                    <div className="flex flex-col gap-1">
                        <SliderField
                            attribute="left"
                            label="X Position"
                            min={-200}
                            max={200}
                            step={1}
                            currentValue={textSet.left}
                            hasTopPadding={false}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                        <SliderField
                            attribute="top"
                            label="Y Position"
                            min={-100}
                            max={100}
                            step={1}
                            currentValue={textSet.top}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                    </div>
                );
            case 'fontSize':
                return (
                    <SliderField
                        attribute="fontSize"
                        label="Text Size"
                        min={10}
                        max={800}
                        step={1}
                        currentValue={textSet.fontSize}
                        hasTopPadding={false}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            case 'fontWeight':
                return (
                    <SliderField
                        attribute="fontWeight"
                        label="Font Weight"
                        min={100}
                        max={900}
                        step={100}
                        currentValue={textSet.fontWeight}
                        hasTopPadding={false}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            case 'letterSpacing':
                return (
                    <SliderField
                        attribute="letterSpacing"
                        label="Letter Spacing"
                        min={-20}
                        max={100}
                        step={1}
                        currentValue={textSet.letterSpacing}
                        hasTopPadding={false}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            case 'opacity':
                return (
                    <SliderField
                        attribute="opacity"
                        label="Opacity"
                        min={0}
                        max={1}
                        step={0.01}
                        currentValue={textSet.opacity}
                        hasTopPadding={false}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            case 'rotation':
                return (
                    <SliderField
                        attribute="rotation"
                        label="Rotation"
                        min={-360}
                        max={360}
                        step={1}
                        currentValue={textSet.rotation}
                        hasTopPadding={false}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            case 'tiltX':
                return (
                    <SliderField
                        attribute="tiltX"
                        label="Horizontal Tilt (3D)"
                        min={-45}
                        max={45}
                        step={1}
                        currentValue={textSet.tiltX}
                        hasTopPadding={false}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            case 'tiltY':
                return (
                    <SliderField
                        attribute="tiltY"
                        label="Vertical Tilt (3D)"
                        min={-45}
                        max={45}
                        step={1}
                        currentValue={textSet.tiltY}
                        hasTopPadding={false}
                        handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <AccordionItem value={`item-${textSet.id}`} className="border-border">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-3">
                {textSet.text || 'Untitled'}
            </AccordionTrigger>
            <AccordionContent>
                {/* Mobile Controls */}
                <div className="md:hidden">
                    <ScrollArea className="w-full">
                        <div className="flex w-max gap-1 mb-3 p-0.5">
                            {controls.map((control) => (
                                <button
                                    key={control.id}
                                    onClick={() => setActiveControl(activeControl === control.id ? null : control.id)}
                                    className={`flex flex-col items-center justify-center min-w-[3.5rem] h-14 rounded-lg text-xs transition-colors ${
                                        activeControl === control.id 
                                            ? 'bg-foreground text-background' 
                                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {control.icon}
                                    <span className="mt-1 text-[10px]">{control.label}</span>
                                </button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {activeControl && (
                        <div className="mt-1">
                            {renderControl(activeControl)}
                        </div>
                    )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex md:flex-col md:gap-4">
                    {controls.map((control) => (
                        <div key={control.id}>
                            {renderControl(control.id)}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mt-6">
                    <Button variant="outline" size="sm" onClick={() => duplicateTextSet(textSet)} className="flex-1 gap-2 text-xs">
                        <Copy className="h-3 w-3" />
                        Duplicate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => removeTextSet(textSet.id)} className="flex-1 gap-2 text-xs text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                        Remove
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default TextCustomizer;
