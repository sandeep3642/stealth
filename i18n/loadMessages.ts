"use server";

import { cookies, headers } from "next/headers";

type GenericObject = Record<string, unknown>;

const isObject = (value: unknown): value is GenericObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const deepMerge = (target: GenericObject, source: GenericObject): GenericObject => {
  const result: GenericObject = { ...target };

  Object.keys(source).forEach((key) => {
    const targetValue = result[key];
    const sourceValue = source[key];

    if (isObject(targetValue) && isObject(sourceValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
      return;
    }

    result[key] = sourceValue;
  });

  return result;
};

export async function loadMessages(locale: string): Promise<GenericObject> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const base = (await import(`../messages/${locale}/translation.json`)).default;
  let auto: GenericObject = {};

  try {
    auto = (await import(`../messages/${locale}/translation.auto.json`))
      .default as GenericObject;
  } catch {
    auto = {};
  }

  const cookieOverridesRaw = cookieStore.get("locale-overrides")?.value || "";
  const cookieOverrides = cookieOverridesRaw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const headerOverridesRaw = headerStore.get("x-local-overrides") || "";
  const headerOverrides = headerOverridesRaw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const overrideKeys = Array.from(new Set([...cookieOverrides, ...headerOverrides]));
  const overrideFiles = await Promise.all(
    overrideKeys.map(async (key) => {
      try {
        return (await import(`../messages/${locale}/translation.${key}.json`))
          .default as GenericObject;
      } catch {
        return {};
      }
    }),
  );

  const baseWithAuto = deepMerge(base as GenericObject, auto);

  return overrideFiles.reduce((acc, next) => deepMerge(acc, next), baseWithAuto);
}
