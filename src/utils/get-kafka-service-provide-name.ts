export function getKafkaServiceProvideName(name?: string): string {
  return `KafkaService.${name || 'default'}`
}
