import { SetMetadata } from '@nestjs/common'
import { KAFKA_CONSUME } from '../constant'
import { KafkaConsumeMetadata } from '../interface/kafka-consume-metadata.interface'
import { KafkaConsumeOptions } from '../interface/kafka-consume-options.interface'

export function KafkaConsume(topic: string | RegExp | string[] | RegExp[], options: KafkaConsumeOptions = {}): MethodDecorator {
  return SetMetadata(KAFKA_CONSUME, <KafkaConsumeMetadata>{
    topics: Array.isArray(topic) ? topic : [topic],
    ...options,
  })
}
