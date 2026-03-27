import { EmptyState, LoadingSpinner } from "@/components/common";
import { Button } from "@/components/ui";
import {
  SETTINGS_GROUPS,
  SETTINGS_METADATA,
  SettingsGroup,
} from "@/features/settings";
import { useCachedSettings, useSettingsMutations } from "@/hooks";
import { PageHeader } from "@/layout";
import { RotateCcw, Save, SettingsIcon, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Config, Configs } from "@/types";

export function Settings() {
  const [localChanges, setLocalChanges] = useState<Partial<Configs>>({});

  //* Use Query
  const { data: settings, isLoading, error } = useCachedSettings();
  const { updateSettings, isUpdating } = useSettingsMutations();

  //* Data
  const formValues = useMemo(() => {
    if (!settings) return null;

    const merged: Configs = { ...settings };

    Object.entries(localChanges).forEach(([key, config]) => {
      if (config) {
        merged[key as keyof Configs] = config;
      }
    });

    return merged;
  }, [settings, localChanges]);

  const hasChanges = Object.keys(localChanges).length > 0;

  //* Function Handlers
  const handleValueChange = (key: string, value: number) => {
    if (!settings) return;

    const updatedConfig: Config = {
      ...settings[key as keyof Configs],
      value,
    };

    setLocalChanges((prev) => ({
      ...prev,
      [key]: updatedConfig,
    }));
  };

  const handleSave = () => {
    if (!formValues) return;

    updateSettings(formValues, {
      onSuccess: () => {
        setLocalChanges({});
      },
    });
  };

  const handleReset = () => {
    if (settings) {
      setLocalChanges({});
    }
  };

  const handleResetToDefaults = () => {
    if (!settings) return;

    const defaultChanges: Partial<Configs> = {};

    Object.keys(SETTINGS_METADATA).forEach((key) => {
      const metadata = SETTINGS_METADATA[key];
      const originalConfig = settings[key as keyof Configs];

      defaultChanges[key as keyof Configs] = {
        ...originalConfig,
        value: metadata.default,
      };
    });

    setLocalChanges(defaultChanges);
  };

  //* Error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <EmptyState
          icon={SettingsIcon}
          title="Errore nel caricamento"
          description="Impossibile caricare le configurazioni di sistema"
        />
      </div>
    );
  }

  //* Loading state
  if (isLoading || !settings || !formValues) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Configurazioni"
        description="Gestione dei parametri di sistema per monitoraggio e notifiche"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefaults}
              disabled={isUpdating}
              className="cursor-pointer"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Ripristina Default
            </Button>
            {hasChanges && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReset}
                  disabled={isUpdating}
                  className="cursor-pointer"
                >
                  <X className="mr-2 h-4 w-4" />
                  Annulla
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="cursor-pointer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? "Salvataggio..." : "Salva modifiche"}
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Settings Group */}
      <div className="space-y-6">
        {Object.entries(SETTINGS_GROUPS).map(([groupKey, group]) => (
          <SettingsGroup
            key={groupKey}
            title={group.title}
            description={group.description}
            settingKeys={group.settings}
            values={formValues}
            onChange={handleValueChange}
          />
        ))}
      </div>

      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium">Hai modifiche non salvate</p>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReset}
                  disabled={isUpdating}
                  className="cursor-pointer"
                >
                  <X className="mr-2 h-4 w-4" />
                  Annulla
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="cursor-pointer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? "Salvataggio..." : "Salva modifiche"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
