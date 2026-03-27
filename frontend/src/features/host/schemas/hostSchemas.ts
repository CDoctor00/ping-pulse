import type { NewHost } from "@/types";
import { z } from "zod";

export const baseHostSchema = z.object({
  name: z
    .string()
    .min(1, "Nome host obbligatorio")
    .max(255, "Nome troppo lungo (max 255 caratteri)"),

  ipAddress: z.ipv4({ message: "Indirizzo IPv4 non valido" }),
  parentIP: z
    .ipv4({ message: "Indirizzo IPv4 genitore non valido" })
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, "Note troppo lunghe (max 500 caratteri)")
    .optional()
    .or(z.literal("")),
});

export const hostEditSchema = baseHostSchema;

export type HostEditFormData = z.infer<typeof baseHostSchema>;

export const hostAddSchema = baseHostSchema;

export type HostAddFormData = z.infer<typeof hostAddSchema>;

export function formDataToNewHost(data: HostEditFormData): NewHost {
  return {
    name: data.name.trim(),
    ipAddress: data.ipAddress.trim(),
    parentIP: data.parentIP?.trim() || null,
    note: data.note?.trim() || null,
  };
}
