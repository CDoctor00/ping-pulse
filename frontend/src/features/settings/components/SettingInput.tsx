import type { SettingMetadata } from "../config/settingsMetadata";
import { Input, Label, Slider } from "@/components/ui";
import { Info } from "lucide-react";
import type { Config } from "@/types";

interface SetingInputProps {
  metadata: SettingMetadata;
  config: Config;
  onChange: (value: number) => void;
  error?: string;
}

export function SettingInput({
  metadata,
  config,
  onChange,
  error,
}: SetingInputProps) {
  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    onChange(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);

    if (!isNaN(newValue)) {
      const clampedValue = Math.max(
        metadata.min,
        Math.min(metadata.max, newValue),
      );
      onChange(clampedValue);
    }
  };

  const handleInputBlur = () => {
    const clampedValue = Math.max(
      metadata.min,
      Math.min(metadata.max, config.value),
    );

    if (clampedValue !== config.value) {
      onChange(clampedValue);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        {/* Label */}
        <div className="flex-1">
          <Label htmlFor={config.name} className="text-base font-semibold">
            {metadata.label}
          </Label>
          <div className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{config.description}</p>
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <Input
            id={config.name}
            type="number"
            value={config.value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={metadata.min}
            max={metadata.max}
            step={metadata.step}
            className={`w-20 text-right no-spinner ${error ? "border-error" : ""}`}
          />
        </div>
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[config.value]}
          onValueChange={handleSliderChange}
          min={metadata.min}
          max={metadata.max}
          step={metadata.step}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span className="text-sm">
            {metadata.min} {metadata.unit}
          </span>
          <span className="text-sm">
            {metadata.max} {metadata.unit}
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
