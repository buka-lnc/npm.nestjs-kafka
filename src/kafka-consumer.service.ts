import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Consumer } from 'kafkajs'
import { CONTEXT_ARGUMENT_INDEX, KAFKA_CONSUME, KAFKA_CONSUMER, MESSAGE_ARGUMENT_INDEX } from './constant'
import { KafkaConsumeOptions, KafkaModuleOptions } from './interface'
import { KafkaConsumeMetadata } from './interface/kafka-consume-metadata.interface'
import { KafkaConsumerMetadata } from './interface/kafka-consumer-metadata.interface'
import { KafkaService } from './kafka.service'

export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  logger = new Logger(KafkaConsumerService.name)

  consumers: Consumer[] = []
  subscriber: Record<string, KafkaConsumeOptions> = {}

  constructor(
    private readonly options: KafkaModuleOptions,
    private readonly kafka: KafkaService,
    private readonly reflector: Reflector,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {
  }


  private getTarget(provider: InstanceWrapper<any>): any {
    const target = !provider.metatype || provider.inject ? provider.instance?.constructor : provider.metatype
    return target
  }

  async onModuleInit(): Promise<void> {
    this.kafka.consumer({ groupId: this.options.groupId })

    const providers = this.discoveryService.getProviders()
      .filter((provider) => {
        const target = this.getTarget(provider)

        if (!target) return false
        const metadata = this.reflector.get(KAFKA_CONSUMER, target)
        if (!metadata) return false

        return metadata.name === (this.options.name || 'default')
      })


    for (const provider of providers) {
      const instance = provider.instance
      const target = this.getTarget(provider)

      const { groupId } = this.reflector.get<KafkaConsumerMetadata>(KAFKA_CONSUMER, target)
      const consumer = this.kafka.consumer({ groupId: groupId || this.options.groupId })
      this.consumers.push(consumer)

      const methods = this.metadataScanner.getAllMethodNames(instance)
        .filter((method) => !!this.reflector.get(KAFKA_CONSUME, instance[method]))

      for (const method of methods) {
        const options = this.reflector.get<KafkaConsumeMetadata>(KAFKA_CONSUME, instance[method])

        await consumer.subscribe({ topics: options.topics })
        this.logger.log(`Subscribe topics ${options.topics.join(',')}`)

        const messageIndex = this.reflector.get(MESSAGE_ARGUMENT_INDEX, instance[method])
        const contextIndex = this.reflector.get(CONTEXT_ARGUMENT_INDEX, instance[method])


        await consumer.run({
          eachMessage: async (context) => {
            let message: any = context.message.value?.toString()
            if (options.json) message = JSON.parse(message)

            const args: any[] = []
            if (messageIndex !== undefined) args[messageIndex] = message
            if (contextIndex !== undefined) args[contextIndex] = context

            // eslint-disable-next-line @typescript-eslint/ban-types
            await (instance[method] as Function).apply(instance, args)
          },
        })
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    for (const consumer of this.consumers) {
      await consumer.disconnect()
    }
  }
}
