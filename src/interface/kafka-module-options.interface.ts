import { KafkaConfig } from 'kafkajs'


export interface KafkaModuleOptions extends KafkaConfig {
  name?: string
  groupId: string
}
