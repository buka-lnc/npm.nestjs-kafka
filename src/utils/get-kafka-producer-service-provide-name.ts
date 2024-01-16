export function getKafkaProducerServiceProvideName(name?: string): string {
  return `KafkaProducerService.${name || 'default'}`
}
