/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ControlButtons } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { useState } from "@odoo/owl";
import { makeAwaitable } from "@point_of_sale/app/store/make_awaitable_dialog";
import { FlowerAddOnsPopup } from "@sally_flowers/pos_comp/FlowerAddonsPopup";

patch(ControlButtons.prototype, {
  setup() {
    super.setup();

    // Access POS environment
    this.pos = usePos();

    // Create a tracked state
    this.state = useState({
      isOrderlineSelected: false,
    });

    // Check initially if a line is selected
    const order = this.pos.get_order();
    if (order) {
      this.state.isOrderlineSelected = !!order.get_selected_orderline();
    }
  },

  // Method to update tracked state
  _updateSelectedLine() {
    const order = this.pos.get_order();
    this.state.isOrderlineSelected = order
      ? !!order.get_selected_orderline()
      : false;
  },

  async onClickPopup() {
    await makeAwaitable(this.dialog, FlowerAddOnsPopup);
  },
});
