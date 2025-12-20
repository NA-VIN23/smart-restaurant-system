// src/services/queue.service.ts
import { queueRepository } from '../repositories/queue.repository';
import { tableRepository } from '../repositories/table.repository';
import { QueueEntry, QueueInput, QueueStats } from '../models/queue.model';
import { userRepository } from '../repositories/user.repository';

export class QueueService {
  async getQueue(): Promise<QueueEntry[]> {
    return queueRepository.findActive();
  }

  async getQueueStats(): Promise<QueueStats> {
    return queueRepository.getQueueStats();
  }

  async joinQueue(queueData: QueueInput): Promise<QueueEntry> {
    const { user_id, party_size } = queueData;

    // Check if user exists
    const user = await userRepository.findById(user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already in the queue
    const activeQueueEntries = await queueRepository.findByUser(user_id);
    const isAlreadyInQueue = activeQueueEntries.some(entry => entry.status === 'WAITING');
    
    if (isAlreadyInQueue) {
      throw new Error('You are already in the queue');
    }

    // Add to queue
    return queueRepository.addToQueue({ user_id, party_size, status: 'WAITING' });
  }

  async updateQueuePosition(entryId: number, newPosition: number): Promise<boolean> {
    // In a real app, you'd want to add authorization here
    return queueRepository.updatePosition(entryId, newPosition);
  }

  async seatCustomer(entryId: number, tableId: number): Promise<{ success: boolean; message: string }> {
    // Get queue entry
    const queueEntry = await queueRepository.findById(entryId);
    if (!queueEntry) {
      throw new Error('Queue entry not found');
    }

    // Check if table is available
    const table = await tableRepository.findById(tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    if (table.status !== 'AVAILABLE') {
      throw new Error('Table is not available');
    }

    // Check if table has enough capacity
    if (table.capacity < queueEntry.party_size) {
      throw new Error(`Table can only accommodate up to ${table.capacity} guests`);
    }

    // Update queue entry status to SEATED
    await queueRepository.updateStatus(entryId, 'SEATED');

    // Update table status to OCCUPIED
    await tableRepository.updateStatus(tableId, 'OCCUPIED');

    // Recalculate wait times for remaining queue
    await queueRepository.recalculateWaitTimes();

    return {
      success: true,
      message: `Customer seated at table ${table.table_number}`
    };
  }

  async cancelQueueEntry(entryId: number, userId: number, isAdmin: boolean = false): Promise<boolean> {
    const queueEntry = await queueRepository.findById(entryId);
    if (!queueEntry) {
      throw new Error('Queue entry not found');
    }

    // Only allow cancellation if user is the owner or admin
    if (queueEntry.user_id !== userId && !isAdmin) {
      throw new Error('Not authorized to cancel this queue entry');
    }

    // Update queue entry status to CANCELLED
    const success = await queueRepository.updateStatus(entryId, 'CANCELLED');
    
    // Recalculate wait times for remaining queue
    if (success) {
      await queueRepository.recalculateWaitTimes();
    }

    return success;
  }

  async getQueuePosition(entryId: number): Promise<{ position: number; ahead: number; estimatedWait: number }> {
    const queueEntry = await queueRepository.findById(entryId);
    if (!queueEntry) {
      throw new Error('Queue entry not found');
    }

    if (queueEntry.status !== 'WAITING') {
      throw new Error('This entry is no longer in the waiting queue');
    }

    const aheadCount = await queueRepository.getPositionAheadCount(queueEntry.position);
    const estimatedWait = aheadCount * 15; // 15 minutes per party

    return {
      position: queueEntry.position,
      ahead: aheadCount,
      estimatedWait
    };
  }
}

export const queueService = new QueueService();