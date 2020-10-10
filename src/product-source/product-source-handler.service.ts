import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ProductSourceHandlerService {
  private readonly logger = new Logger(this.constructor.name);
  private collector: Array<{ data: any, resolve: (value: any) => any }> = []
  private delayedHandlingRef;

  private collect(data: any, resolve: (value: any) => any) {
    this.collector.push({ data, resolve });

    if (this.collector.length === 1) {
      this.delayAutomaticHandling();
    }
  }

  private delayAutomaticHandling() {
    this.delayedHandlingRef = setTimeout(() => {
      this.logger.debug('Now automatic Handling');
      this.handle();
    }, 120000);
  }

  register(data: any): Promise<any> {
    return new Promise<any>(resolve => {
      this.collect(data, resolve);
    });
  }

  handle() {
    this.logger.debug(`Now Handling ${this.collector.length} jobs`);
    if (this.delayedHandlingRef) {
      clearTimeout(this.delayedHandlingRef);
    }

    const collection = [...this.collector];
    this.collector = [];

    setTimeout(() => {
      collection.forEach(item => item.resolve(item.data));
    }, 5000);
  }
}
