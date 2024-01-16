import { Inject } from '@nestjs/common'
import { getKafkaServiceProvideName } from '../utils/get-kafka-service-provide-name'


export const InjectKafka = (name = 'default'): ParameterDecorator => Inject(getKafkaServiceProvideName(name))
