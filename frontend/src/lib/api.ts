import axios from 'axios'
import { BackendRowData } from '../../../backend/src/validators';

type RowData = BackendRowData;

const API = axios.create({
    baseURL: 'http://localhost:4003/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

export async function uploadData(entity: string, data: RowData[]) {
    return API.post(`/upload/${entity}`, data)
}
