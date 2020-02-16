import { Request, Response } from 'express';
import { ApplicationInstance } from '../models/application-model';
import ServiceContainer from '../services/service-container';
import Controller, { Link } from './controller';

/**
 * Applications controller class.
 * 
 * Root path : `/applications`
 */
export default class ApplicationController extends Controller {

    /**
     * Creates a new applications controller.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container, '/applications');
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
        this.registerEndpoint({ method: 'PATCH', uri: '/:id/regenerateSecret', handlers: this.regenerateSecretHandler });
    }

    /**
     * Lists all applications.
     * 
     * Path : `GET /applications`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async listHandler(req: Request, res: Response): Promise<any> {
        try {
            return res.status(200).send({ applications: await this.db.applications.find().populate('author') });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Gets a specific application.
     * 
     * Path : `GET /applications/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async getHandler(req: Request, res: Response): Promise<any> {
        try {
            const app = await this.db.applications.findById(req.params.id).populate('author');
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            return res.status(200).send({ application: app });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Creates a new application.
     * 
     * Path : `POST /applications`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async createHandler(req: Request, res: Response): Promise<any> {
        try {
            if (!await this.db.users.exists({ _id: req.body.author })) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Author not found'
                }));
            }
            const app = await this.db.applications.create({
                name: req.body.name,
                description: req.body.description,
                logo: req.body.logo,
                author: req.body.author,
                redirectUris: req.body.redirectUris,
                enabled: req.body.enabled
            });
            return res.status(201).send({
                id: app.id,
                links: [{
                    rel: 'Gets the created application',
                    action: 'GET',
                    href: `${req.protocol}://${req.hostname}${this.rootUri}/${app.id}`
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
     * Modifies an application.
     * 
     * Path : `PUT /applications/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async modifyHandler(req: Request, res: Response): Promise<any> {
        try {
            const app = await this.db.applications.findById(req.params.id);
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            if (req.body.author != null && !await this.db.users.exists({ _id: req.body.author })) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Author not found'
                }));
            }
            app.name = req.body.name;
            app.description = req.body.description;
            app.logo = req.body.logo;
            app.author = req.body.author;
            app.grantTypes = req.body.grandTypes;
            app.redirectUris = req.body.redirectUris;
            app.enabled = req.body.enabled;
            await app.save();
            if (!app.enabled) {
                await this.deleteTokens(app);
            }
            return res.status(200).send({
                id: app.id,
                links: [{
                    rel: 'Gets the modified application',
                    action: 'GET',
                    href: `${req.protocol}://${req.hostname}${this.rootUri}/${app.id}`
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
     * Updates an application.
     * 
     * Path : `PATCH /applications/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async updateHandler(req: Request, res: Response): Promise<any> {
        try {
            const app = await this.db.applications.findById(req.params.id);
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            if (req.body.author != null && !await this.db.users.exists({ _id: req.body.author })) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Author not found'
                }));
            }
            if (req.body.name != null) {
                app.name = req.body.name;
            }
            if (req.body.description != null) {
                app.description = req.body.description;
            }
            if (req.body.logo != null) {
                app.logo = req.body.logo;
            }
            if (req.body.author != null) {
                app.author = req.body.author;
            }
            if (req.body.grandTypes != null) {
                app.grantTypes = req.body.grandTypes;
            }
            if (req.body.redirectUris != null) {
                app.redirectUris = req.body.redirectUris;
            }
            if (req.body.enabled != null) {
                app.enabled = req.body.enabled;
            }
            await app.save();
            if (!app.enabled) {
                await this.deleteTokens(app);
            }
            return res.status(200).send({
                id: app.id,
                links: [{
                    rel: 'Gets the updated application',
                    action: 'GET',
                    href: `${req.protocol}://${req.hostname}${this.rootUri}/${app.id}`
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
     * Deletes an application.
     * 
     * Path : `DELETE /applications/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async deleteHandler(req: Request, res: Response): Promise<any> {
        try {
            const app = await this.db.applications.findByIdAndDelete(req.params.id);
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            await this.deleteTokens(app);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Updates an application secret.
     * 
     * Path : `PATCH /applications/:id/regenerateSecret`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async regenerateSecretHandler(req: Request, res: Response): Promise<any> {
        try {
            const app = await this.db.applications.findById(req.params.id);
            if (app == null) {
                return res.status(404).send(this.container.errors.formatErrors(404, {
                    error: 'not_found',
                    error_description: 'Application not found'
                }));
            }
            app.secret = this.container.crypto.generateRandomString(50);
            await app.save();
            return res.status(200).send({
                id: app.id,
                secret: app.secret
            });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Deletes application waiting authorization codes and refresh tokens.
     * 
     * @param app Application
     */
    private async deleteTokens(app: ApplicationInstance): Promise<any> {
        this.container.cache.del(`auth_code_${app.id}`); // Waiting authorization code deletion
        await this.db.refreshTokens.deleteMany({ application: app }); // Refresh tokens deletion
    }
}
