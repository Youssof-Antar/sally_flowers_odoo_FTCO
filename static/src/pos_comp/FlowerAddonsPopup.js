/** @odoo-module **/
import { useState, Component, onMounted } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { Dialog } from "@web/core/dialog/dialog";
import { rpc } from "@web/core/network/rpc";
import { AddonsList } from "../addons/AddonsList";

export class FlowerAddOnsPopup extends Component {
  static template = "sally_flowers.FlowerAddOnsPopup";
  static components = { Dialog, AddonsList };

  setup() {
    this.pos = usePos();
    this.state = useState({
      addons: [],
      customName: "",
      customPrice: 0.0,
      customer: "Youssof",
      notes: "No",
      isOrderlineSelected: false,
    });
    onMounted(() => this.loadAddons());
    const order = this.pos.get_order();
    this.state.isOrderlineSelected = !!(
      order && order.get_selected_orderline()
    );
  }

  async loadAddons() {
    const addons = await rpc("/web/dataset/call_kw", {
      model: "flower.addon",
      method: "search_read",
      args: [],
      kwargs: {
        fields: ["id", "name", "price"],
      },
    });
    const orderline = this.pos.get_order().get_selected_orderline();
    const selectedAddonIds = new Set(orderline?.addons.map((a) => a.id) || []);
    this.state.addons = addons.map((a) => ({
      id: a.id,
      name: a.name,
      price: a.price,
      isSelected: selectedAddonIds.has(a.id),
    }));
  }

  async addCustomAddon() {
    if (!this.state.customName || this.state.customPrice < 0) {
      return;
    }
    const newAddonId = await rpc("/web/dataset/call_kw", {
      model: "flower.addon",
      method: "create",
      args: [
        {
          name: this.state.customName,
          price: parseFloat(this.state.customPrice),
        },
      ],
      kwargs: {},
    });
    const newAddon = {
      id: newAddonId,
      name: this.state.customName,
      price: parseFloat(this.state.customPrice),
      isSelected: true,
    };
    const orderline = this.pos.get_order().get_selected_orderline();
    if (orderline) {
      orderline.addAddonToOrderLine(newAddon);
    }
    this.state.addons.push(newAddon);
    this.state.customName = "";
    this.state.customPrice = 0.0;
  }

  toggleAddon(addonId) {
    const addon = this.addons.find((a) => a.id === addonId);

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
