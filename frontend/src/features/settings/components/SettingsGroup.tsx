import { Card, Separator } from "@/components/ui";
import { SettingInput } from "./SettingInput";
import { SETTINGS_METADATA } from "../config/settingsMetadata";
import type { Configs } from "@/types";

interface SettingsGroupProps {
  title: string;
  description: string;
  settingKeys: readonly string[];
  values: Configs | null;
  onChange: (key: string, value: number) => void;
  errors?: Record<string, string>;
}

export function SettingsGroup({
  title,
  description,
  settingKeys,
  values,
  onChange,
  errors = {},
}: SettingsGroupProps) {
  if (!values) return null;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <Separator className="mb-6" />

      {/* Body */}
      <div className="space-y-8">
        {settingKeys.map((key) => {
          const metadata = SETTINGS_METADATA[key];
          const config = values[key as keyof Configs];

          if (!metadata || !config) return null;

          return (
            <SettingInput
              key={key}
              metadata={metadata}
              config={config}
              onChange={(newValue) => onChange(key, newValue)}
              error={errors[key]}
            />
          );
        })}
      </div>
    </Card>
  );
}
