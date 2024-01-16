import { DynamicModule, FactoryProvider, Global, Module, Provider } from '@nestjs/common'
import { DiscoveryModule, DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'
import {
  KafkaModuleOptions,
  KafkaModuleOptionsAsync,
} from './interface'
import { KafkaConsumerService } from './kafka-consumer.service'
import { KafkaProducerService } from './kafka-producer.service'
import { KafkaService } from './kafka.service'
import { getKafkaConsumerServiceProvideName } from './utils/get-kafka-consumer-service-provide-name'
import { getKafkaProducerServiceProvideName } from './utils/get-kafka-producer-service-provide-name'
import { getKafkaServiceProvideName } from './utils/get-kafka-service-provide-name'
import { getOptionsProvideName } from './utils/get-options-provide-name'


@Module({})
@Global()
export class KafkaModule {
  private static getProviders(name?: string): FactoryProvider[] {
    const optionsProvideName = getOptionsProvideName(name)
    const kafkaServiceProvideName = getKafkaServiceProvideName(name)
    const kafkaProducerServiceProvideName = getKafkaProducerServiceProvideName(name)
    const kafkaConsumerServiceProvideName = getKafkaConsumerServiceProvideName(name)

    return [
      {
        provide: kafkaServiceProvideName,
        inject: [optionsProvideName],
        useFactory: (opts) => new KafkaService(opts),
      },
      {
        provide: kafkaProducerServiceProvideName,
        inject: [kafkaServiceProvideName],
        useFactory: (kafkaService) => new KafkaProducerService(kafkaService),
      },
      {
        provide: kafkaConsumerServiceProvideName,
        inject: [
          optionsProvideName,
          kafkaServiceProvideName,
          Reflector,
          DiscoveryService,
          MetadataScanner,
        ],
        useFactory: (a, b, c, d, e) => new KafkaConsumerService(a, b, c, d, e),
      },
    ]
  }

  static forRoot(options: KafkaModuleOptions): DynamicModule {
    const optionsProvideName = getOptionsProvideName(options.name)
    const providers = this.getProviders(options.name)

    const optionsProvide: Provider = {
      provide: optionsProvideName,
      useValue: options,
    }

    return {
      global: true,
      module: KafkaModule,
      imports: [DiscoveryModule],
      providers: [
        optionsProvide,
        ...providers,
      ],
      exports: providers.map((item) => item.provide),
    }
  }

  static forRootAsync(options: KafkaModuleOptionsAsync): DynamicModule {
    const optionsProvideName = getOptionsProvideName(options.name)
    const providers = this.getProviders(options.name)

    const optionsProvide: Provider = {
      provide: optionsProvideName,
      inject: options.inject,
      useFactory: options.useFactory,
    }

    return {
      global: true,
      module: KafkaModule,
      imports: [DiscoveryModule],
      providers: [
        optionsProvide,
        ...providers,
      ],
      exports: providers.map((item) => item.provide),
    }
  }
}
