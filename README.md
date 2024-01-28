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

Import `KafkaModule.forRoot` to `AppModule`:

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

### KafkaConsumer

Create a provider named `AppConsumer` that consume messages：

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

> `AppConsumer` and `AppService` can be merged into one provider, but writing them separately will make the code clearer.

Then, append `AppConsumer` to `AppModule`:

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

### KafkaProducer

`KafkaProducer` will connect on module init and disconnect on module destroy.
To use this, import `KafkaModule.forProducer(options)` to `AppModule`:

```typescript
// app.module.js
import { Module } from "@nestjs/common";
import { KafkaModule, Partitioners } from "@buka/nestjs-kafka";
import AppService from "./app.service";

@Module({
  imports: [
    KafkaModule.forRoot({
      name: "my-kafka",
      groupId: "my-group-id",
      clientId: "my-client-id",
      brokers: ["my_kafka_host:9092"],
    }),
    KafkaModule.forProducer({
      name: "my-kafka",
      createPartitioner: Partitioners.LegacyPartitioner,
    }),
  ],
  provider: [AppService],
})
export class AppModule {}
```

> The `options` of `.forProducer` is exactly the same as [the `options` of `kafka.producer` in KafkaJS](https://kafka.js.org/docs/producing)。

Inject `KafkaProducer` to your `AppService`:

```typescript
// app.service.js
@Injectable()
export class AppService {
  constructor(
    @InjectKafkaProducer('my-kafka')
    private readonly producer: KafkaProducer
  ) {}

  async sendMessage() {
    this.producer.send({
      topic: 'kafka-topic'
      messages: [{ value: 'Hello Kafka' }]
    })
  }
}
```

The `.send` function of `KafkaProducer` is exactly the same as [the `.send` function of KafkaJS](https://kafka.js.org/docs/producing#producing-messages)。

### KafkaService

Using the `KafkaService`, you can create `consumer` and `producer` like plain KafkaJS.

```typescript
// app.service.js
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Producer, ProducerRecord, RecordMetadata } from "kafkajs";
import { KafkaService } from "@buka/nestjs-kafka";

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  producer!: Producer;
  consumer!: Consumer;

  constructor(private readonly kafka: KafkaService) {}

  async onModuleInit(): Promise<void> {
    this.producer = this.kafka.producer();
    await this.producer.connect();

    this.consumer = this.kafka.consumer({
      groupId: "my-group-id",
    });

    this.consumer.subscribe({ topic: "kafka-topic" });
    this.consumer.run({
      eachMessage: async (context) => {
        // do somethings
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }
}
```

## Q&A

### `KafkaConsumer` not working with `CreateRequestContext` of `mikro-orm`

If you don't pay attention to the order of `CreateRequestContext` decorators,
you may have problems with any of other method decorators, not only `@buka/nestjs-kafka`.

```typescript
import { Injectable } from "@nestjs/common";
import { KafkaConsumer, KafkaConsume, KafkaMessage } from "@buka/nestjs-kafka";
import { CreateRequestContext } from "@mikro-orm/mysql";

// app.consumer.js
@Injectable()
@KafkaConsumer()
export class AppConsumer {
  @CreateRequestContext()
  // !! KafkaConsume decorator will not work !!
  @KafkaConsume("my-topic")
  async finishTask(@KafkaMessage() message: string): Promise<void> {
    console.log(message);
  }
}
```

There are two solutions:

1. [recommend] written as two functions:

   ```typescript
   @Injectable()
   @KafkaConsumer()
   export class AppConsumer {
     @KafkaConsume("my-topic")
     async consumeMessage(@KafkaMessage() message: string): Promise<void> {
       // ... filter and format message
       this.finishTask(JSON.parse(message))
     }

     @CreateRequestContext()
     async finishTask(task: Task): Promise<void> {
       // do something
       console.log(task);
     }
   ```

1. Pay attention to the order of `CreateRequestContext`:

   ```typescript
   @Injectable()
   @KafkaConsumer()
   export class AppConsumer {
     @KafkaConsume("my-topic")
     // use CreateRequestContext as the last decorator
     @CreateRequestContext()
     async finishTask(@KafkaMessage() message: string): Promise<void> {
       // do something
       console.log(message);
     }
   }
   ```
