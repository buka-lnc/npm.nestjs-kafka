# @buka/nestjs-kafka

[npm]: https://www.npmjs.com/package/@buka/nestjs-kafka

[![version](https://img.shields.io/npm/v/@buka/nestjs-kafka.svg?logo=npm&style=for-the-badge)][npm]
[![downloads](https://img.shields.io/npm/dm/@buka/nestjs-kafka.svg?logo=npm&style=for-the-badge)][npm]
[![dependencies](https://img.shields.io/librariesio/release/npm/@buka/nestjs-kafka?logo=npm&style=for-the-badge)][npm]
[![license](https://img.shields.io/npm/l/@buka/nestjs-kafka.svg?logo=github&style=for-the-badge)][npm]
[![Codecov](https://img.shields.io/codecov/c/gh/buka-lnc/npm.nestjs-kafka?logo=codecov&token=PLF0DT6869&style=for-the-badge)](https://codecov.io/gh/buka-lnc/npm.nestjs-kafka)

This is a nestJS module implemented using KafkaJS.
That support multiple connections and fits the coding style of nestjs.

## Usage

Import `KafkaModule`:

```typescript
// app.module.js
import { Module } from "@nestjs/common";
import { KafkaModule } from "@buka/nestjs-kafka";

@Module({
  imports: [
    KafkaModule.forRoot({
      name: "my-kafka",
      groupId: "my-group-id",
      clientId: "my-client-id",
      brokers: ["my_kafka_host:9092"],
    }),
  ],
})
export class AppModule {}
```

Add a provider named `AppConsumer` that consume message：

```typescript
// app.consumer.js
@Injectable()
@KafkaConsumer()
export class AppConsumer {
  @KafkaConsume("my-topic")
  async finishTask(@KafkaMessage() message: string): Promise<void> {
    // do something
    console.log(message);
  }

  @KafkaConsume("other-topic", { json: true })
  async finishTask(
    @KafkaMessage() message: Record<string, any>
  ): Promise<void> {
    // do something
    console.log(message);
  }
}
```

Append `AppConsumer` to `AppModule`:

```typescript
import { Module } from "@nestjs/common";
import { AppConsumer } from "./app.consumer";

@Module({
  imports: [
    /* ... */
  ],
  providers: [AppConsumer],
})
export class AppModule {}
```
