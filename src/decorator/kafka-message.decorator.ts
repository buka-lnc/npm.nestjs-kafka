import { SetMetadata } from '@nestjs/common'
import { MESSAGE_ARGUMENT_INDEX } from '../constant'

export function KafkaMessage(): ParameterDecorator {
  return (target, key, index) => {
    SetMetadata(MESSAGE_ARGUMENT_INDEX, index)(key && target[key])
  }
}
