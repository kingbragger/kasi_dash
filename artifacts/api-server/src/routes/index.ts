import { Router, type IRouter } from "express";
import healthRouter from "./health";
import waitlistRouter from "./waitlist";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import careersRouter, { staffCareersRouter } from "./careers";
import applicationsRouter, { staffApplicationsRouter } from "./applications";
import staffRouter, { requireStaff } from "./staff";
import driverRouter from "./driver";
import vendorRouter from "./vendor";
import trackingRouter from "./tracking";
import staffDriversRouter from "./staff-drivers";
import staffVendorsRouter from "./staff-vendors";
import cataloguesRouter, { staffCataloguesRouter } from "./catalogues";
import buildforgeRouter, { staffBuildforgeRouter } from "./buildforge";
import investRouter, { staffInvestRouter } from "./invest";

const router: IRouter = Router();

router.use(healthRouter);
router.use(waitlistRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(careersRouter);
router.use(applicationsRouter);
router.use(staffRouter);
router.use(driverRouter);
router.use(vendorRouter);
router.use(trackingRouter);
router.use(cataloguesRouter);

router.use(buildforgeRouter);
router.use(investRouter);
router.use(requireStaff, staffCareersRouter);
router.use(requireStaff, staffApplicationsRouter);
router.use(requireStaff, staffDriversRouter);
router.use(requireStaff, staffVendorsRouter);
router.use(requireStaff, staffCataloguesRouter);
router.use(requireStaff, staffBuildforgeRouter);
router.use(requireStaff, staffInvestRouter);

export default router;
