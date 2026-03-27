import { z } from "zod";
import { SETTINGS_METADATA } from "../config/settingsMetadata";

const configSchema = z.object({
  key: z.string(),
  value: z.number(),
  description: z.string(),
});

export const settingsSchema = z.object({
  packetsCount: configSchema.refine(
    (config) =>
      config.value >= SETTINGS_METADATA.packetsCount.min &&
      config.value <= SETTINGS_METADATA.packetsCount.max,
    {
      message: `Valore deve essere tra ${SETTINGS_METADATA.packetsCount.min} e ${SETTINGS_METADATA.packetsCount.max}`,
    },
  ),

  packetSize: configSchema.refine(
    (config) =>
      config.value >= SETTINGS_METADATA.packetSize.min &&
      config.value <= SETTINGS_METADATA.packetSize.max,
    {
      message: `Valore deve essere tra ${SETTINGS_METADATA.packetSize.min} e ${SETTINGS_METADATA.packetSize.max}`,
    },
  ),

  pingsInterval: configSchema.refine(
    (config) =>
      config.value >= SETTINGS_METADATA.pingsInterval.min &&
      config.value <= SETTINGS_METADATA.pingsInterval.max,
    {
      message: `Valore deve essere tra ${SETTINGS_METADATA.pingsInterval.min} e ${SETTINGS_METADATA.pingsInterval.max}`,
    },
  ),

  pingsTimeout: configSchema.refine(
    (config) =>
      config.value >= SETTINGS_METADATA.pingsTimeout.min &&
      config.value <= SETTINGS_METADATA.pingsTimeout.max,
    {
      message: `Valore deve essere tra ${SETTINGS_METADATA.pingsTimeout.min} e ${SETTINGS_METADATA.pingsTimeout.max}`,
    },
  ),

  routineDelay: configSchema.refine(
    (config) =>
      config.value >= SETTINGS_METADATA.routineDelay.min &&
      config.value <= SETTINGS_METADATA.routineDelay.max,
    {
      message: `Valore deve essere tra ${SETTINGS_METADATA.routineDelay.min} e ${SETTINGS_METADATA.routineDelay.max}`,
    },
  ),

  pendingThreshold: configSchema.refine(
    (config) =>
      config.value >= SETTINGS_METADATA.pendingThreshold.min &&
      config.value <= SETTINGS_METADATA.pendingThreshold.max,
    {
      message: `Valore deve essere tra ${SETTINGS_METADATA.pendingThreshold.min} e ${SETTINGS_METADATA.pendingThreshold.max}`,
    },
  ),

  notificationRepeatInterval: configSchema.refine(
    (config) =>
      config.value >= SETTINGS_METADATA.notificationRepeatInterval.min &&
      config.value <= SETTINGS_METADATA.notificationRepeatInterval.max,
    {
      message: `Valore deve essere tra ${SETTINGS_METADATA.notificationRepeatInterval.min} e ${SETTINGS_METADATA.notificationRepeatInterval.max}`,
    },
  ),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
