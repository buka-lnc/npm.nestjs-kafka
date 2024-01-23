import { ProducerConfig } from 'kafkajs'

export interface KafkaModuleForProducerOptions extends ProducerConfig {
  /**
   * @default "default"
   */
  name?: string
}
