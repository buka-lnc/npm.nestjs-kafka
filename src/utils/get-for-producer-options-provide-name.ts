export function getForProducerOptionsProvideName(name?: string): string {
  return `KafkaForProducerOptions.${name || 'default'}`
}
