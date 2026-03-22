import { Hono } from 'hono';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} from './users-controller.js';

const usersRouter = new Hono();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUser);
usersRouter.post('/', createUser);
usersRouter.patch('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;
