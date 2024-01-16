import { Inject } from '@nestjs/common'
import { getKafkaProducerServiceProvideName } from '../utils/get-kafka-producer-service-provide-name'


export const InjectKafkaProducer = (name = 'default'): ParameterDecorator => Inject(getKafkaProducerServiceProvideName(name))
