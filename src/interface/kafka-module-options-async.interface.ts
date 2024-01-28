import { InjectionToken, OptionalFactoryDependency, Type } from '@nestjs/common'
import { KafkaModuleOptions } from './kafka-module-options.interface'


export interface KafkaModuleOptionsAsync {
  /**
   * @default "default"
   */
  name?: string
  useClass?: Type<KafkaModuleOptions>
  useExisting?: Type<KafkaModuleOptions>
  useFactory?: (...args: any[]) => Promise<KafkaModuleOptions> | KafkaModuleOptions
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
