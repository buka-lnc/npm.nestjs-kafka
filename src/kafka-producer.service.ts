import { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Producer } from 'kafkajs'
import { KafkaService } from './kafka.service'


export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  producer!: Producer
  constructor(private readonly kafka: KafkaService) {}

  async onModuleInit(): Promise<void> {
    this.producer = this.kafka.producer()
    await this.producer.connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect()
  }

  async send(topic: string, message: string): Promise<any> {
    const producer = this.kafka.producer()
    await producer.connect()
    await producer.send({
      topic,
      messages: [{ value: message }],
    })
    await producer.disconnect()
  }
}
