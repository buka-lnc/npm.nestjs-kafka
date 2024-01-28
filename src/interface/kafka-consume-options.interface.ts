import { KafkaConsumeMetadata } from './kafka-consume-metadata.interface.js'


export type KafkaConsumeOptions = Omit<KafkaConsumeMetadata, 'topics'>
