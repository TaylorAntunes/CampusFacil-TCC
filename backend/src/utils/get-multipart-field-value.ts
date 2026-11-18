type MultipartFieldValue<T = unknown> =
  | T
  | {
      value?: T
    }

export function getMultipartFieldValue<T = unknown>(
  field: MultipartFieldValue<T> | undefined,
): T | undefined {
  if (
    field &&
    typeof field === 'object' &&
    'value' in field &&
    field.value !== undefined
  ) {
    return field.value as T
  }

  return field as T | undefined
}
