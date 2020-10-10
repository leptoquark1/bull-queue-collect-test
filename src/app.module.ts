import { BeforeApplicationShutdown, Inject, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bull';
import { ProductSourceService } from './product-source/product-source.service';
import { ProductSourceConsumerService } from './product-source/product-source-consumer.service';
import { ProductSourceHandlerService } from './product-source/product-source-handler.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'products-source',
      redis: {
        host: 'localhost',
        port: 6379,
      },
      settings: {
        stalledInterval: 999999999,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ProductSourceHandlerService, ProductSourceService, ProductSourceConsumerService],
})
export class AppModule implements OnModuleInit, BeforeApplicationShutdown {
  @Inject(ProductSourceService) private readonly productSourceService: ProductSourceService;
  private interval;

  onModuleInit(): any {
    this.productSourceService.clear().then(() => {
      this.interval = setInterval(() => {
        this.productSourceService.poll();
      }, 1000);
    });
  }

  beforeApplicationShutdown(signal?: string): any {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

}
