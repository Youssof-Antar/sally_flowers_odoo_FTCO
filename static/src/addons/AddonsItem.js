/** @odoo-module **/

import { Component } from "@odoo/owl";

export class AddonsItem extends Component {
  static template = "sally_flowers.AddonsItem";
  static props = {
    addon: {
      type: Object,
      required: true,
    },
    toggleAddon: {
      type: Function,
      required: true,
    },
  };

 
}
