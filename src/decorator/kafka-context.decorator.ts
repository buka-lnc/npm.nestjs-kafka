import { SetMetadata } from '@nestjs/common'
import { CONTEXT_ARGUMENT_INDEX } from '../constant'


export function KafkaContext(): ParameterDecorator {
  return (target, key, index) => {
    SetMetadata(CONTEXT_ARGUMENT_INDEX, index)(key && target[key])
  }
}
