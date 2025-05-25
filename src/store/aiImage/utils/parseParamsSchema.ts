import {
  AiImageParamsSchemaZodSchema,
  StandardAiImageParameters,
} from './StandardAiImageParameters';

export function parseParamsSchema(schema: Record<string, any>) {
  const paramsSchema = AiImageParamsSchemaZodSchema.parse(schema);
  const properties = paramsSchema.properties;
  const defaultValues = Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      return [key, value.default];
    }),
  ) as Partial<StandardAiImageParameters>;

  return {
    defaultValues,
    properties,
  };
}
