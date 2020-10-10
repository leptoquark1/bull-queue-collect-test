import {
  InjectQueue, OnGlobalQueueWaiting,
  OnQueueActive, OnQueueCleaned,
  OnQueueCompleted, OnQueueDrained,
  OnQueueError,
  OnQueueFailed, OnQueuePaused,
  OnQueueProgress, OnQueueRemoved, OnQueueResumed,
  OnQueueStalled,
  OnQueueWaiting,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { ProductSourceHandlerService } from './product-source-handler.service';

@Processor('products-source')
export class ProductSourceConsumerService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectQueue('products-source') private readonly queue: Queue<unknown>,
    private readonly handlerService: ProductSourceHandlerService,
  ) {
    //
  }

  @Process({ concurrency: 10 })
  async collect(job: Job<unknown>) {
    return await this.handlerService.register(job.data);
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.queue.getActiveCount().then((activeCount) => {
      this.logger.debug(`Active ${activeCount}`);
      if (activeCount === 10) {
        this.handlerService.handle();
      }
    });
  }

  @OnQueueWaiting()
  onWaiting(jobId: number | string) {
    //
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    //
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    //
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.debug(`Queue Failed ${job.id}. Reason: '${err.message}'.`);
  }

  @OnQueueStalled()
  onStalled(job: Job) {
    //
  }

  @OnQueuePaused()
  onPaused() {
    this.logger.debug(`Queue Paused.`);
  }

  @OnQueueResumed()
  onResumed(job: Job) {
    this.logger.debug(`Queue Resumed. ${job.id}.`);
  }

  @OnQueueCleaned()
  onCleaned(jobs: Job[], type: string) {
    //
  }

  @OnQueueDrained()
  onDrained() {
    this.logger.debug(`Queue Drained.`);
  }

  @OnQueueRemoved()
  onRemoved(job: Job) {
    this.logger.debug(`Queue Removed ${job.id}.`);
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.debug(`Queue Process Error '${error.message}' caught.`);
  }
}
