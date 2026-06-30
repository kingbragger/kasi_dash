import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface CartItem {
  id: string;
  catalogueId: string;
  catalogueName: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const s = localStorage.getItem("kasi_cart");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("kasi_cart", JSON.stringify(items));
  }, [items]);

  const add = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const update = (id: string, quantity: number) => {
    if (quantity <= 0) { remove(id); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  };

  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
