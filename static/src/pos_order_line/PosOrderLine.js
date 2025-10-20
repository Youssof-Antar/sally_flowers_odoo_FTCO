/** @odoo-module */

import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";
import { patch } from "@web/core/utils/patch";

patch(PosOrderline.prototype, {
  /**
   * @override
   */
  setup(vals) {
    super.setup(vals);
    this.addons = vals.addons || [];
    this.addons_price_extra = vals.addons_price_extra || 0.0;
  },

  /**
   * @override
   */
  get_unit_price() {
    const basePrice = super.get_unit_price();
    return basePrice + this.addons_price_extra;
  },

  /**
   * @override
   */
  export_as_json() {
    const json = super.export_as_json();
    json.addons_price_extra = this.addons_price_extra;
    json.addons = this.addons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      price: addon.price,
    }));
    return json;
  },

  addAddonToOrderLine(addon) {
    this.addons.push(addon);
    this.addons_price_extra += addon.price;
    this.order_id.recomputeOrderData();
  },

  removeAddonFromOrderLine(addon) {
    const index = this.addons.findIndex((a) => a.id === addon.id);
    if (index > -1) {
      this.addons.splice(index, 1);
      this.addons_price_extra -= addon.price;
      this.order_id.recomputeOrderData();
    }
  },
});
