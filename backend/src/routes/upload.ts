import { Router, Request, Response } from 'express'
import {
    validateClients,
    validateWorkers,
    validateTasks,
    BackendRowData
} from '../validators'

const router = Router()

const store: Record<'clients' | 'workers' | 'tasks', unknown[]> = {
    clients: [],
    workers: [],
    tasks: []
}

router.post('/:entity', (req: Request, res: Response) => {
    const entity = req.params.entity as 'clients' | 'workers' | 'tasks';
    const data = req.body as BackendRowData[];

    if (!['clients', 'workers', 'tasks'].includes(entity)) {
        res.status(400).json({ ok: false, message: 'Unknown entity' });
        return;
    }

    let errors: string[] = [];

    if (entity === 'clients') errors = validateClients(data);
    else if (entity === 'workers') errors = validateWorkers(data);
    else if (entity === 'tasks') errors = validateTasks(data);

    if (errors.length > 0) {
        console.error('Validation errors:', errors);
        res.status(422).json({ ok: false, errors });
        return;
    }

    store[entity] = data;
    res.json({ ok: true, received: data.length });
});

export default router
