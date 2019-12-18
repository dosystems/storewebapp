import express from 'express';
import activityRoutes from './activity.route';
import announcementRoutes from './announcement.route';
import authRoutes from './auth.route';
import attributeRoutes from './attribute.route';
import brandRoutes from './brand.route';
import buyerRoutes from './buyer.route';
import categoryRoutes from './category.route';
import categoryRequestRoutes from './categoryRequest.route';
import colorRoutes from './color.route';
import countryRoutes from './country.route';
import dealRoutes from './deal.route';
import employeeRoutes from './employee.route';
import entityRoutes from './entity.route';
import exchangeratesRoutes from './exchangerates.route';
import favoriteRoutes from './favorite.route';
import orderRoutes from './order.route';
import productClickRoutes from './productClick.route';
import promoCodeRoutes from './promocodes.route';
import reviewRoutes from './review.route';
import rolesRoutes from './roles.route';
import sellerRoutes from './seller.route';
import settingRoutes from './setting.route';
import statementRoutes from './statement.route';
import ticketRoutes from './ticket.route';
import paymentRoutes from './payment.route';
import planRoutes from './plan.route';
import subscriptionRoutes from './subscription.route';
import userPromoCodeRoutes from './userpromocode.route';
import newsLetterRoutes from './newsLetter.route';
import reportsRoutes from './reports.route';


const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
    res.send('OK')
);
// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount activity routes at /activities
router.use('/activities', activityRoutes);

//mount Brand routes at /brand
router.use('/brands', brandRoutes);

//mount Employee routes at /employees
router.use('/employees', employeeRoutes);

//mount Category routes at /categories
router.use('/categories', categoryRoutes);

//mount CategoryRequest routes at /categories
router.use('/categoryRequest', categoryRequestRoutes);

//mount Order routes at /orders
router.use('/orders', orderRoutes);

//mount Entity routes at /entities
router.use('/entities', entityRoutes);

// mount exchangerates routes at /exchangerates
router.use('/exchangerates', exchangeratesRoutes);

//mount Setting routes at /settings
router.use('/settings', settingRoutes);

//mount Statement routes at /statements
router.use('/statements', statementRoutes);

//mount Roles routes at /roles
router.use('/roles', rolesRoutes);

//mount reviews routes at /reviews
router.use('/reviews', reviewRoutes)

//mount productClick routes at /productClick
router.use('/productClick', productClickRoutes)

//mount promocodes routes at /productClick
router.use('/promoCodes', promoCodeRoutes)

//mount favotite routes at /favorites
router.use('/favorites', favoriteRoutes);

//mount deals routes at /deals
router.use('/deals', dealRoutes);

//mount attributes routes at /attributes
router.use('/attributes', attributeRoutes);

//mount announcement routes at /announcements
router.use('/announcements', announcementRoutes);

//mount tickets routes at /tickets
router.use('/tickets', ticketRoutes);

//mount seller routes at /seller
router.use('/sellers', sellerRoutes);

//mount buyer routes at /buyer
router.use('/buyers', buyerRoutes);

//mount country routes at /countries
router.use('/countries', countryRoutes);

//mount plans routes at /plans
router.use('/plans', planRoutes);

//mount payment routes at /plans
router.use('/payments', paymentRoutes);

//mount subscription routes at /subscriptions
router.use('/subscriptions', subscriptionRoutes);

//mount newsLetter routes at /newsLetters
router.use('/newsLetters', newsLetterRoutes);

//mount reports routes at /reports
router.use('/reports', reportsRoutes)

//mount colors routes at /reports
router.use('/colors', colorRoutes)

//mount subscription routes at /subscriptions
router.use('/userPromoCodes', userPromoCodeRoutes);
export default router;
