import { Request, Response } from 'express';
import ServiceContainer from '../services/service-container';
import Controller, { Link } from './controller';

/**
 * Users controller class.
 * 
 * Root path : `/users`
 */
export default class UserController extends Controller {

    /**
     * Creates a new users controller.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container, '/users');
        this.listHandler = this.listHandler.bind(this);
        this.getHandler = this.getHandler.bind(this);
        this.createHandler = this.createHandler.bind(this);
        this.modifyHandler = this.modifyHandler.bind(this);
        this.updateHandler = this.updateHandler.bind(this);
        this.deleteHandler = this.deleteHandler.bind(this);
        this.registerEndpoint({ method: 'GET', uri: '/', handlers: this.listHandler });
        this.registerEndpoint({ method: 'GET', uri: '/:id', handlers: this.getHandler });
        this.registerEndpoint({ method: 'POST', uri: '/', handlers: this.createHandler });
        this.registerEndpoint({ method: 'PUT', uri: '/:id', handlers: this.modifyHandler });
        this.registerEndpoint({ method: 'PATCH', uri: '/:id', handlers: this.updateHandler });
        this.registerEndpoint({ method: 'DELETE', uri: '/:id', handlers: this.deleteHandler });
    }

    /**
     * Lists all users.
     * 
     * Path : `GET /users`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async listHandler(req: Request, res: Response): Promise<any> {
        try {
            return res.status(200).send({ users: await this.db.users.find() });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Gets a specific user.
     * 
     * Path : `GET /users/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async getHandler(req: Request, res: Response): Promise<any> {
        try {
            const user = await this.db.users.findById(req.params.id).populate('applications');
            if (user == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'User not found'
                }));
            }
            return res.status(200).send({ user });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Creates a new user.
     * 
     * Path : `POST /users`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async createHandler(req: Request, res: Response): Promise<any> {
        try {
            const user = await this.db.users.create({
                name: req.body.name,
                password: req.body.password
            });
            return res.status(201).send({
                id: user.id,
                links: [{
                    rel: 'Gets the created user',
                    action: 'GET',
                    href: `${req.protocol}://${req.hostname}${this.rootUri}/${user.id}`
                }] as Link[]
            });
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(400, ...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Modifies an user.
     * 
     * Path : `PUT /users/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async modifyHandler(req: Request, res: Response): Promise<any> {
        try {
            const user = await this.db.users.findById(req.params.id);
            if (user == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'User not found'
                }));
            }
            user.name = req.body.name;
            user.password = req.body.password;
            await user.save();
            return res.status(200).send({
                id: user.id,
                links: [{
                    rel: 'Gets the modified user',
                    action: 'GET',
                    href: `${req.protocol}://${req.hostname}${this.rootUri}/${user.id}`
                }] as Link[]
            });
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(400, ...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Updates an user.
     * 
     * Path : `PATCH /users/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async updateHandler(req: Request, res: Response): Promise<any> {
        try {
            const user = await this.db.users.findById(req.params.id);
            if (user == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'User not found'
                }));
            }
            if (req.body.name != null) {
                user.name = req.body.name;
            }
            if (req.body.password != null) {
                user.password = req.body.password;
            }
            await user.save();
            return res.status(200).send({
                id: user.id,
                links: [{
                    rel: 'Gets the updated user',
                    action: 'GET',
                    href: `${req.protocol}://${req.hostname}${this.rootUri}/${user.id}`
                }] as Link[]
            });
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(400, ...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Deletes an user.
     * 
     * Path : `DELETE /users/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async deleteHandler(req: Request, res: Response): Promise<any> {
        try {
            const user = await this.db.users.findByIdAndDelete(req.params.id);
            if (user == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'User not found'
                }));
            }
            return res.status(204).send();
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }
}
