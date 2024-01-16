import { Inject } from '@nestjs/common'
import { getKafkaConsumerServiceProvideName } from '../utils/get-kafka-consumer-service-provide-name'


export const InjectKafkaConsumer = (name = 'default'): ParameterDecorator => Inject(getKafkaConsumerServiceProvideName(name))
