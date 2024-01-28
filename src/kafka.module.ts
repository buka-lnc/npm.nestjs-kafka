import { DynamicModule, FactoryProvider, Global, Module, Provider } from '@nestjs/common'
import { DiscoveryModule, DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'
import {
  KafkaModuleOptions,
  KafkaModuleOptionsAsync,
} from './interface'
import { KafkaModuleForProducerOptions } from './interface/kafka-module-for-producer.interface.js'
import { KafkaConsumerService } from './kafka-consumer.service'
import { KafkaProducer } from './kafka-producer.service'
import { KafkaService } from './kafka.service'
import { getAsyncOptionsProvideName } from './utils/get-async-options-provide-name.js'
import { getForProducerOptionsProvideName } from './utils/get-for-producer-options-provide-name.js'
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
    const kafkaConsumerServiceProvideName = getKafkaConsumerServiceProvideName(name)

    return [
      {
        provide: kafkaServiceProvideName,
        inject: [optionsProvideName],
        useFactory: (opts) => new KafkaService(opts),
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
    const asyncOptionsProvideName = getAsyncOptionsProvideName(options.name)
    const optionsProvideName = getOptionsProvideName(options.name)
    const providers = this.getProviders(options.name)

    let asyncOptionsProvide: Provider

    if (options.useFactory) {
      asyncOptionsProvide = {
        provide: asyncOptionsProvideName,
        inject: options.inject,
        useFactory: options.useFactory,
      }
    } else if (options.useClass) {
      asyncOptionsProvide = {
        provide: asyncOptionsProvideName,
        useClass: options.useClass,
      }
    } else if (options.useExisting) {
      asyncOptionsProvide = {
        provide: asyncOptionsProvideName,
        useExisting: options.useExisting,
      }
    } else {
      throw new Error('Invalid KafkaModuleOptionsAsync: useClass, useExisting or useFactory must be defined')
    }

    const optionsProvide: Provider = {
      inject: [asyncOptionsProvideName],
      provide: optionsProvideName,
      useFactory: (o: KafkaModuleOptions): KafkaModuleOptions => ({ name: options.name, ...o }),
    }

    return {
      global: true,
      module: KafkaModule,
      imports: [DiscoveryModule],
      providers: [
        asyncOptionsProvide,
        optionsProvide,
        ...providers,
      ],
      exports: providers.map((item) => item.provide),
    }
  }

  static forProducer(options?: KafkaModuleForProducerOptions): DynamicModule {
    const kafkaForProducerOptionsProvideName = getForProducerOptionsProvideName(options?.name)
    const kafkaServiceProvideName = getKafkaServiceProvideName(options?.name)
    const kafkaProducerServiceProvideName = getKafkaProducerServiceProvideName(options?.name)

    return {
      global: true,
      module: KafkaModule,
      providers: [
        {
          provide: kafkaForProducerOptionsProvideName,
          useValue: options,
        },
        {
          provide: kafkaProducerServiceProvideName,
          inject: [kafkaForProducerOptionsProvideName, kafkaServiceProvideName],
          useFactory: (options, kafkaService) => new KafkaProducer(options, kafkaService),
        },
      ],
      exports: [kafkaProducerServiceProvideName],
    }
  }
}
