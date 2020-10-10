import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class ProductSourceService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectQueue('products-source') private queue: Queue,
  ) {

  }


  async poll(): Promise<void> {
    await this.queue.add(
      {
        id: '1',
        title: 'bar',
        stock: 12,
        active: true,
        dropShipping: true,
      },
    );
  }

  async clear() {
    this.queue.empty().then(() => {
      return Promise.all([
        this.queue.clean(0, 'completed'),
        this.queue.clean(0, 'wait'),
        this.queue.clean(0, 'active'),
        this.queue.clean(0, 'delayed'),
        this.queue.clean(0, 'failed'),
        this.queue.clean(0, 'paused'),

      ]).then(() => {
        this.queue.getJobCounts().then(count => this.logger.debug(
          `Queue Cleaned 
        active: ${count.active}
        completed: ${count.completed}
        delayed: ${count.delayed}
        failed: ${count.failed}
        waiting: ${count.waiting}
      `,
        ));
      });
    });

  }
}
