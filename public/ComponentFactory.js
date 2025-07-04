import AddProduct from './components/AddProduct.js';
import SearchProduct from './components/SearchProduct.js';
import RecordSale from './components/RecordSale.js';
import ManageReturn from './components/ManageReturn.js';
import SupplyRequest from './components/SupplyRequest.js';
import { logger } from './logger';

export default class ComponentFactory {
  constructor() {
    this.componentInstances = [];
    this.componentList = {
      AddProduct,
      SearchProduct,
      RecordSale,
      ManageReturn,
      SupplyRequest,
    };
    this.init();
  }

  init() {
    const components = document.querySelectorAll('[data-component]');

    for (let i = 0; i < components.length; i++) {
      const element = components[i];
      const componentName = element.dataset.component;

      if (this.componentList[componentName]) {
        const instance = new this.componentList[componentName](element);
        this.componentInstances.push(instance);
      } else {
        logger.warn(`La composante ${componentName} n'existe pas`);
      }
    }
  }
}