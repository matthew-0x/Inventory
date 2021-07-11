const Checkout = require("../src/checkout");
const catalogue = require("../src/catalogue");

describe("Test checkout application", () => {
  test("sample 1", () => {
    const co = new Checkout(catalogue);
    co.scan("atv");
    co.scan("atv");
    co.scan("atv");
    co.scan("vga");

    expect(co.items).toEqual({
      atv: {
        name: "Apple TV",
        qty: 3,
        unitPrice: 109.5,
        freeQty: 0,
        totalPrice: 0,
        totalQty: 0,
      },
      vga: {
        name: "VGA adapter",
        qty: 1,
        unitPrice: 30.0,
        freeQty: 0,
        totalPrice: 0,
        totalQty: 0,
      },
    });

    const total = co.total();
    expect(total).toBe(249);

    expect(co.items).toEqual({
      atv: {
        name: "Apple TV",
        qty: 2,
        unitPrice: 109.5,
        freeQty: 1,
        totalPrice: 219,
        totalQty: 3,
      },
      vga: {
        name: "VGA adapter",
        qty: 1,
        unitPrice: 30,
        freeQty: 0,
        totalPrice: 30,
        totalQty: 1,
      },
    });
  });

  test("sample 2", () => {
    const total = new Checkout(catalogue)
      .scan("atv")
      .scan("ipd")
      .scan("ipd")
      .scan("atv")
      .scan("ipd")
      .scan("ipd")
      .scan("ipd")
      .total();

    expect(total).toBe(2718.95);
  });

  test("sample 3", () => {
    const checkout = new Checkout(catalogue);
    checkout.scan("mbp");
    checkout.scan("vga");
    checkout.scan("ipd");
    const total = checkout.total();

    expect(total).toBe(1949.98);
  });
});
