import { Category } from './category';
import { Checkout } from './checkout';
import { Product } from './product';

export class Store {
    private _id: number;
    private _name: string;
    private _categories: Category[] = [];
    private _products: Product[] = [];
    private _checkouts: Checkout[] = [];

    constructor(_id: number, _name: string) {
        this._id = _id;
        this._name = _name;
    }
}