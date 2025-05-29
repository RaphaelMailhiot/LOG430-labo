import ComponentFactory from './ComponentFactory.js';

class Main {
  constructor() {
    this.init();
  }

  init() {
    document.documentElement.classList.add('has-js');

    new ComponentFactory();
  }
}

new Main();