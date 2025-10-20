import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
import { rpc } from "@web/core/network/rpc";
import { ask } from "@point_of_sale/app/store/make_awaitable_dialog";

patch(ProductScreen.prototype, {
  get products() {

    const { limit_categories, iface_available_categ_ids } = this.pos.config;
    if (limit_categories && iface_available_categ_ids.length > 0) {
      const productIds = new Set([]);
      for (const categ of iface_available_categ_ids) {
        const categoryProducts = this.getProductsByCategory(categ);
        for (const p of categoryProducts) {
          productIds.add(p.id);
        }
      }
      return this.pos.models["product.product"].filter((p) =>
        productIds.has(p.id)
      );
    }

    return this.pos.models["product.product"].filter(
      (p) => p.is_flower == true
    );
  },
});

patch(PosStore.prototype, {
  async pay() {
    const currentOrder = this.get_order();
    let needsWatering = false;

    for (const line of currentOrder.get_orderlines()) {
      const product = line.get_product();
      const rpcProduct = await rpc("/web/dataset/call_kw", {
        model: "product.product",
        method: "search_read",
        args: [
          [
            ["is_flower", "=", true],
            ["id", "=", product.id],
          ],
        ],
        kwargs: {
          fields: [
            "id",
            "is_flower",
            "last_watered_date",
            "watering_frequency",
            "last_watered_date",
          ],
        },
      });

      if (rpcProduct[0].is_flower) {
        if (
          rpcProduct[0].last_watered_date != undefined &&
          rpcProduct[0].watering_frequency >= 0
        ) {
          const lastWatered = luxon.DateTime.fromISO(
            rpcProduct[0].last_watered_date
          );

          const wateringDue = lastWatered.plus({
            days: rpcProduct[0].watering_frequency,
          });

          const today = luxon.DateTime.local();

          if (today.startOf("day") > wateringDue.startOf("day")) {
            needsWatering = true;
            break;
          }
        } else {
          needsWatering = true;
        }
      }
    }

    if (needsWatering) {
      const { confirmed } = await ask(this.dialog, {
        title: "Flower Warning",
        body: "Some flowers in this order are past due for watering. Please inform the customer to water them soon to avoid wilting.",
      });

      if (!confirmed) {
        // If the user cancels the popup, abort the payment.
        return;
      }
    }

    // If no warning is needed or the user confirmed, proceed with payment.
    super.pay();
  },
});
