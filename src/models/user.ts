import { Product } from './product';

export class User {
    private _id: number;
    private _name: string;
    private _products: Product[] = [];

    constructor(_id: number, _name: string) {
        this._id = _id;
        this._name = _name;
    }
}