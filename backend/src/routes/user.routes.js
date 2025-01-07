import { Router } from 'express';
import { login, register , addToHistory, getUserHistory} from '../controllers/user.controller.js';

const userRouter = new Router();

userRouter.route('/login').post(login);
userRouter.route('/register').post(register);
userRouter.route('/add_to_activity').post(addToHistory);
userRouter.route('/get_all_activity').get(getUserHistory);

export default userRouter;