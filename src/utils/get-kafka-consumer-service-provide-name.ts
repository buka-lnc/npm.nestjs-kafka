export function getKafkaConsumerServiceProvideName(name?: string): string {
  return `KafkaConsumerService.${name || 'default'}`
}
