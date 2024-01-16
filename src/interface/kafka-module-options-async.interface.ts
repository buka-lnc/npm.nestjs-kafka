import { InjectionToken, ModuleMetadata, OptionalFactoryDependency } from '@nestjs/common'
import { KafkaModuleOptions } from './kafka-module-options.interface'


export interface KafkaModuleOptionsAsync extends Pick<ModuleMetadata, 'imports'> {
  /**
   * @default "default"
   */
  name?: string
  useFactory: (...args: any[]) => Promise<KafkaModuleOptions> | KafkaModuleOptions
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
