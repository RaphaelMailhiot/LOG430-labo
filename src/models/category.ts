export class Category {
    private _id: string;
    private _name: string;

    constructor(_name: string) {
        this._id = _name.toLowerCase().replace(/\s+/g, '-');
        this._name = _name;
    }
}