export function getAsyncOptionsProvideName(name?: string): string {
  return `KafkaAsyncOptions.${name || 'default'}`
}
