import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import appConfig from './config/app.config.js';
import authRoutes from './auth/auth.route.js'
import itemRoutes from './item/item.routes.js'
import excelRoutes from './excel/import/excel.routes.js'
import jobRoutes from './job/job.routes.js'
import jobItemRoutes from './jobItem/jobItem.routes.js'
import checkoutRoutes from './checkout/checkout.routes.js'
import checkinRoutes from './checkin/checkin.routes.js'
import logRoutes from './log/log.routes.js'

dotenv.config();

const app = express();
const PORT = appConfig.port;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes)
app.use('/api/items', itemRoutes)
app.use('/api/excel', excelRoutes)
app.use('/api/jobs', jobRoutes);
app.use('/api', jobItemRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', checkinRoutes);
app.use('/api/logs', logRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;