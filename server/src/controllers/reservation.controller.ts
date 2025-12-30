import { Request, Response } from 'express';
import { db } from '../db';
import { ResultSetHeader } from 'mysql2';

// Create a new reservation
export const createReservation = async (req: Request, res: Response) => {
    // SECURITY: Use ID from token, ignore body user_id for safety
    const user_id = (req as any).user?.id;
    const { name, party_size, customer_type, reservation_date, reservation_time } = req.body;

    if (!user_id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    if (!name || !party_size || !reservation_date || !reservation_time) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
    }

    try {
        // 1. Check Total Restaurant Capacity
        const [capacityRows] = await db.query<any[]>('SELECT SUM(capacity) as total_capacity FROM restaurant_tables');
        const totalCapacity = capacityRows[0].total_capacity || 0;

        // 2. Check Existing Reservations for this Time Slot (Approximate check: same date/time)
        // In a real app, we'd check duration intersection. Here we check exact slot.
        const [existingRows] = await db.query<any[]>(
            `SELECT SUM(party_size) as booked_seats 
             FROM reservations 
             WHERE reservation_date = ? AND reservation_time = ? AND status != 'Declined'`,
            [reservation_date, reservation_time]
        );
        const bookedSeats = existingRows[0].booked_seats || 0;

        if (bookedSeats + party_size > totalCapacity) {
            res.status(400).json({ message: 'Restaurant is fully booked for this time slot.' });
            return;
        }

        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO reservations (name, party_size, customer_type, reservation_date, reservation_time, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, party_size, customer_type || 'Regular', reservation_date, reservation_time, user_id]
        );
        res.status(201).json({ message: 'Reservation created successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error creating reservation' });
    }
};

// Get User Reservations
export const getUserReservations = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id; // Assuming auth middleware adds user
    console.log(`[getUserReservations] Request for UserID: ${userId}`);

    if (!userId) {
        res.status(400).json({ message: 'User ID required' });
        return;
    }

    // Prevent caching of personal data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        const [rows] = await db.query<any[]>(
            "SELECT * FROM reservations WHERE user_id = ? AND status != 'Declined'",
            [userId]
        );
        console.log(`[getUserReservations] Found ${rows.length} records for UserID: ${userId}`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching user reservations' });
    }
};

// Get all reservations (for manager)
export const getReservations = async (req: Request, res: Response) => {
    // SECURITY: Ensure Role is Manager
    const user = (req as any).user;
    if (!user || user.role !== 'Manager') {
        res.status(403).json({ message: 'Access Denied: Managers Only' });
        return;
    }

    try {
        // Filter out 'Declined'
        // Sort: Pending (1) -> Approved (2)
        // Then by Date/Time
        const query = `
            SELECT * FROM reservations 
            WHERE status != 'Declined' 
            ORDER BY 
                CASE WHEN status = 'Pending' THEN 1 ELSE 2 END, 
                reservation_date ASC, 
                reservation_time ASC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching reservations' });
    }
};

// Update reservation status (Approve/Decline)
export const updateReservationStatus = async (req: Request, res: Response) => {
    // SECURITY: Ensure Role is Manager
    const user = (req as any).user;
    if (!user || user.role !== 'Manager') {
        res.status(403).json({ message: 'Access Denied: Managers Only' });
        return;
    }

    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Declined'

    if (!['Approved', 'Declined', 'Pending'].includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
    }

    try {
        await db.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Reservation marked as ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error updating reservation status' });
    }
};

// Delete all approved reservations (Reset/Cleanup)
export const deleteApprovedReservations = async (req: Request, res: Response) => {
    // SECURITY: Ensure Role is Manager
    const user = (req as any).user;
    if (!user || user.role !== 'Manager') {
        res.status(403).json({ message: 'Access Denied: Managers Only' });
        return;
    }

    try {
        const [result] = await db.query<ResultSetHeader>("DELETE FROM reservations WHERE status = 'Approved'");
        res.json({ message: `Deleted ${result.affectedRows} approved reservations.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error deleting approved reservations' });
    }
};
