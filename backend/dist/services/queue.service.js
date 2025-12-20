"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueService = exports.QueueService = void 0;
// src/services/queue.service.ts
const queue_repository_1 = require("../repositories/queue.repository");
const table_repository_1 = require("../repositories/table.repository");
const user_repository_1 = require("../repositories/user.repository");
class QueueService {
    async getQueue() {
        return queue_repository_1.queueRepository.findActive();
    }
    async getQueueStats() {
        return queue_repository_1.queueRepository.getQueueStats();
    }
    async joinQueue(queueData) {
        const { user_id, party_size } = queueData;
        // Check if user exists
        const user = await user_repository_1.userRepository.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }
        // Check if user is already in the queue
        const activeQueueEntries = await queue_repository_1.queueRepository.findByUser(user_id);
        const isAlreadyInQueue = activeQueueEntries.some(entry => entry.status === 'WAITING');
        if (isAlreadyInQueue) {
            throw new Error('You are already in the queue');
        }
        // Add to queue
        return queue_repository_1.queueRepository.addToQueue({ user_id, party_size, status: 'WAITING' });
    }
    async updateQueuePosition(entryId, newPosition) {
        // In a real app, you'd want to add authorization here
        return queue_repository_1.queueRepository.updatePosition(entryId, newPosition);
    }
    async seatCustomer(entryId, tableId) {
        // Get queue entry
        const queueEntry = await queue_repository_1.queueRepository.findById(entryId);
        if (!queueEntry) {
            throw new Error('Queue entry not found');
        }
        // Check if table is available
        const table = await table_repository_1.tableRepository.findById(tableId);
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
        await queue_repository_1.queueRepository.updateStatus(entryId, 'SEATED');
        // Update table status to OCCUPIED
        await table_repository_1.tableRepository.updateStatus(tableId, 'OCCUPIED');
        // Recalculate wait times for remaining queue
        await queue_repository_1.queueRepository.recalculateWaitTimes();
        return {
            success: true,
            message: `Customer seated at table ${table.table_number}`
        };
    }
    async cancelQueueEntry(entryId, userId, isAdmin = false) {
        const queueEntry = await queue_repository_1.queueRepository.findById(entryId);
        if (!queueEntry) {
            throw new Error('Queue entry not found');
        }
        // Only allow cancellation if user is the owner or admin
        if (queueEntry.user_id !== userId && !isAdmin) {
            throw new Error('Not authorized to cancel this queue entry');
        }
        // Update queue entry status to CANCELLED
        const success = await queue_repository_1.queueRepository.updateStatus(entryId, 'CANCELLED');
        // Recalculate wait times for remaining queue
        if (success) {
            await queue_repository_1.queueRepository.recalculateWaitTimes();
        }
        return success;
    }
    async getQueuePosition(entryId) {
        const queueEntry = await queue_repository_1.queueRepository.findById(entryId);
        if (!queueEntry) {
            throw new Error('Queue entry not found');
        }
        if (queueEntry.status !== 'WAITING') {
            throw new Error('This entry is no longer in the waiting queue');
        }
        const aheadCount = await queue_repository_1.queueRepository.getPositionAheadCount(queueEntry.position);
        const estimatedWait = aheadCount * 15; // 15 minutes per party
        return {
            position: queueEntry.position,
            ahead: aheadCount,
            estimatedWait
        };
    }
}
exports.QueueService = QueueService;
exports.queueService = new QueueService();
//# sourceMappingURL=queue.service.js.map