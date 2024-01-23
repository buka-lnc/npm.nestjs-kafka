import { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Producer, ProducerRecord, RecordMetadata } from 'kafkajs'
import { KafkaModuleForProducerOptions } from './interface/kafka-module-for-producer.interface.js'
import { KafkaService } from './kafka.service'


export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  producer!: Producer
  constructor(
    private readonly options: KafkaModuleForProducerOptions,
    private readonly kafka: KafkaService
  ) {}

  async onModuleInit(): Promise<void> {
    this.producer = this.kafka.producer(this.options)
    await this.producer.connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect()
  }

  send(record: ProducerRecord): Promise<RecordMetadata[]> {
    return this.producer.send(record)
  }
}
