/**
 * checkout.js
 * @description checkout logic
 */

const SpecialFunctions = require("./specialFunctions");
const { round } = require("./helpers");

class Checkout {
  constructor(pricingRules, verbose = false) {
    this.pricingRules = pricingRules;
    this.verbose = verbose;

    /*
     used an object to track the items of transactions.
     */
    this.items = {};
  }

  /**
   * scan
   * @description The role of scan is to write to our class history if a scan has occurred
   * and if so, what is the quantity of the item.
   * @param sku {string} The SKU of the item you wish to add
   * @returns {Checkout} will return checkout for improved code cleanliness.
   */
  scan(sku) {
    // increment this item quantity if already existed, otherwise set to qty 1.
    if (this.items[sku]) {
      this.items[sku].qty += 1;
    } else {
      this.addToItems(sku);
    }
    return this;
  }

  /**
   * addToItems
   * @description Adds a new item to the Checkout items obj.
   * @param sku
   * @return {{added: *}|{error: string}}
   */
  addToItems(sku) {
    const item = this.pricingRules.find((rule) => rule.sku === sku);

    if (!item) {
      const error = `No SKU found by this ID: ${sku}`;
      console.warn(error);
      return { error };
    }
    this.items[sku] = {
      name: item.name,
      qty: 1,
      unitPrice: item.price,
      freeQty: 0,
      totalPrice: 0,
      totalQty: 0,
    };

    return { added: sku };
  }

  /**
   * getItemQty
   * @description fetch the current item qty from the class
   * @param sku { string } sku of the product
   * @param addFreeQty { boolean } add free qty to the result
   * @return {number} Qty of item
   */
  getItemQty(sku, addFreeQty = false) {
    return addFreeQty
      ? this.items[sku].qty + this.items[sku].freeQty || 0
      : this.items[sku].qty;
  }

  /**
   * total
   * @description All pricing & specials calculations are done here
   * @return {number} The grand total price of this checkout transaction.
   */
  total() {
    // pre-load the special functions class as it transforms this Checkout class
    const specialFunctions = new SpecialFunctions(this);

    let grandTotalPrice = 0;
    /*
     We will need to increment over this.items object, to do this we will simply object keys
     Which conveniently gives us an array of used SKU's. 
     */
    Object.keys(this.items).forEach((itemSKU) => {
      const { special } = this.pricingRules.find(
        (pricingRule) => pricingRule.sku === itemSKU
      );

      // If a special exists for this item, let it run & adjust the params of checkout
      if (special) {
        specialFunctions[special.type](itemSKU, special);
      }

      // Calculate the price by multiplying the item unit price by the qty.
      const itemTotalPrice = round(
        this.items[itemSKU].unitPrice * this.getItemQty(itemSKU),
        2
      );
      grandTotalPrice += itemTotalPrice;

      // Push changes to the item object
      Object.assign(this.items[itemSKU], {
        totalQty: this.getItemQty(itemSKU, true),
        totalPrice: itemTotalPrice,
      });
    });

    if (this.verbose) {
      this.pricingBreakdown(grandTotalPrice);
    }
    return grandTotalPrice;
  }

  /**
   * pricingBreakdown
   * @description Purely to show a per item breakdown for anyone running this script.
   * @param grandTotalPrice {number}
   */
  pricingBreakdown(grandTotalPrice) {
    Object.keys(this.items).forEach((itemSKU) => {
      const { name, totalQty, totalPrice } = this.items[itemSKU];
      console.log(
        `Name: ${name}, Total Qty: ${totalQty}, Total Price: ${totalPrice}`
      );
    });
    console.log(`Total: ${grandTotalPrice}`);
    console.log("------------------------------");
  }
}

module.exports = Checkout;
