export function getOptionsProvideName(name?: string): string {
  return `KafkaOptions.${name || 'default'}`
}
