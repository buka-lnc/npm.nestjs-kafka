import { SetMetadata } from '@nestjs/common'
import { KAFKA_CONSUMER } from '../constant'
import { KafkaConsumerOptions } from '../interface'
import { KafkaConsumerMetadata } from '../interface/kafka-consumer-metadata.interface'


export function KafkaConsumer(options: KafkaConsumerOptions = {}): ClassDecorator {
  return SetMetadata(KAFKA_CONSUMER, <KafkaConsumerMetadata>{
    name: options.name || 'default',
    ...options,
  })
}
