/** @odoo-module */

import { Component } from "@odoo/owl";
import { AddonsItem } from "./AddonsItem";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { registry } from "@web/core/registry";

export class AddonsList extends Component {
  static components = { AddonsItem };
  static template = "sally_flowers.AddonsList";
  static props = {
    addons: {
      type: Array,
      required: true,
    },
  };

  setup() {
    this.pos = usePos();
  }

  toggleAddon(addonId) {
    const addon = this.props.addons.find((a) => a.id === addonId);

    if (addon) {
      const orderline = this.pos.get_order().get_selected_orderline();
      if (orderline) {
        if (!addon.isSelected) {
          orderline.addAddonToOrderLine(addon);
        } else {
          orderline.removeAddonFromOrderLine(addon);
        }
        addon.isSelected = !addon.isSelected;
      }
    }
  }
}

registry.category("actions").add("sally_flowers.AddonsList", AddonsList);
