import { describe, expect, it } from "vitest";
import { products } from "./products";

describe("catálogo", () => {
  it("mantiene identificadores únicos", () => {
    expect(new Set(products.map(({ id }) => id)).size).toBe(products.length);
  });

  it("no publica precios ni stock inválidos", () => {
    for (const product of products) {
      expect(product.price).toBeGreaterThan(0);
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(product.images.length).toBeGreaterThan(0);
    }
  });
});
