export interface KafkaConsumeMetadata {
  topics: (string | RegExp)[]
  json?: boolean
  fromBeginning?: boolean
}
