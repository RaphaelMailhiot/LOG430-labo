import { Product } from './product';

export class Checkout {
    private _id: number;
    private _cart: Product[] = [];

    constructor(_id: number) {
        this._id = _id;
    }

    addProduct(product: Product): void {
        this._cart.push(product);
    }
    removeProduct(product: Product): void {
        const index = this._cart.indexOf(product);
        if (index > -1) {
            this._cart.splice(index, 1);
        }
    }
    get cart(): Product[] {
        return this._cart;
    }
}