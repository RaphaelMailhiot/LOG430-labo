import { Category } from './category';

export class Product {
    private _id: string;
    private _name: string;
    private _category: Category | null = null;

    constructor(_name: string) {
        this._id = _name.toLowerCase().replace(/\s+/g, '-');
        this._name = _name;
    }

    set category(category: Category) {
        this._category = category;
    }
    get category(): Category | null {
        return this._category;
    }
}