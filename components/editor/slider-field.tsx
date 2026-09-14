'use client'

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface SliderFieldProps {
  attribute: string;
  label: string;
  min: number;
  max: number;
  step: number;
  currentValue: number;
  hasTopPadding?: boolean;
  disabled?: boolean;
  handleAttributeChange: (attribute: string, value: number) => void;
}

const SliderField: React.FC<SliderFieldProps> = ({
    attribute,
    label,
    min,
    max,
    step,
    currentValue,
    hasTopPadding = true,
    disabled = false,
    handleAttributeChange
  }) => { 
    const handleSliderInputFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const value = parseFloat(event.target.value);
      if (!isNaN(value)) {
        handleAttributeChange(attribute, value);
      }
    };
  
    return (
      <div className={`flex flex-col gap-2 ${hasTopPadding ? 'mt-3' : ''}`}>
        <div className="flex items-center justify-between">
          <Label htmlFor={attribute} className="text-xs text-muted-foreground">{label}</Label>
          <Input
            type="text"
            value={currentValue}
            onChange={handleSliderInputFieldChange}
            className={`w-14 h-6 rounded-md border border-border px-2 py-0 text-center text-xs bg-secondary ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
          />
        </div>
        <Slider
          id={attribute}
          min={min}
          max={max}
          value={[currentValue]}
          step={step}
          onValueChange={(value) => !disabled && handleAttributeChange(attribute, value[0])}
          className={`[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={label}
          disabled={disabled}
        />
      </div>
    );
};

export default SliderField
