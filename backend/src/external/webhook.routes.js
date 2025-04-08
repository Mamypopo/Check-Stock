import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/line', (req, res) => {
    const events = req.body.events;

    events.forEach(event => {
        if (event.type === 'join' && event.source.type === 'group') {
            console.log('Group ID:', event.source.groupId);
        }
    });

    res.status(200).end();
});

export default router;