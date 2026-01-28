import { Router } from 'express';
import * as adminDbService from '../services/adminDb.service';
import { seedDemoData } from '../services/seeder.service';

const router = Router();

// Guard: all routes
router.use(adminDbService.guardAdminDb);

router.post('/seed-demo', async (req, res) => {
    try {
        const result = await seedDemoData();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// List tables
router.get('/tables', adminDbService.getTables);

// Get schema for a table
router.get('/schema', adminDbService.getSchema);

// Get rows for a table (with pagination, search, sort)
router.get('/rows', adminDbService.getRows);

// Insert row
router.post('/rows', adminDbService.insertRow);

// Update row
router.put('/rows', adminDbService.updateRow);

// Delete row
router.delete('/rows', adminDbService.deleteRow);

// Query builder
router.post('/query', adminDbService.queryBuilder);


// Reset DB and create root user
router.post('/reset', adminDbService.resetDatabase);

export default router;
