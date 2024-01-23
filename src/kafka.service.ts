import { Injectable, Logger } from '@nestjs/common'
import { Consumer, ConsumerConfig, Kafka, Producer, ProducerConfig, logLevel } from 'kafkajs'
import { KafkaModuleOptions } from './interface/kafka-module-options.interface'

@Injectable()
export class KafkaService {
  kafka: Kafka

  constructor(private readonly options: KafkaModuleOptions) {
    this.kafka = new Kafka({
      clientId: options?.clientId,
      brokers: options?.brokers,
      logCreator: () => ({ level, log }) => {
        if (level === logLevel.DEBUG) {
          Logger.debug(log.message, 'KafkaService')
        } else if (level === logLevel.INFO) {
          Logger.log(log.message, 'KafkaService')
        } else if (level === logLevel.WARN) {
          Logger.warn(log.message, 'KafkaService')
        } else {
          Logger.error(log.message, 'KafkaService')
        }
      },
    })
  }

  producer(config?: ProducerConfig): Producer {
    return this.kafka.producer(config)
  }

  consumer(config: ConsumerConfig): Consumer {
    return this.kafka.consumer(config)
  }
}
