import { Job } from 'bullmq';

export interface CreateWorkerType {
    queueName: string;
    workerFn: (job: Job) => Promise<void>; // Ensures it always returns a Promise<void>
}
