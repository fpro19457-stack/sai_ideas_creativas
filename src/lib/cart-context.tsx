"use client";

import {createContext, useContext, useState, useEffect, ReactNode} from "react";

interface CartItem {
  id: string;
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  cantidadFotos: number;
  opciones: any;
  envioGratis: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}: {children: ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const validateCart = async () => {
      const savedCart = localStorage.getItem("cart");
      if (!savedCart) return;

      const items = JSON.parse(savedCart);
      if (!items.length) return;

      try {
        const res = await fetch("/api/productos");
        const productos = await res.json();
        const idsValidos = productos.map((p: any) => p.id);
        const itemsValidos = items.filter((item: any) => idsValidos.includes(item.productoId));

        if (itemsValidos.length !== items.length) {
          localStorage.setItem("cart", JSON.stringify(itemsValidos));
          setItems(itemsValidos);
        } else {
          setItems(items);
        }
      } catch {
        setItems(items);
      }
    };

    validateCart();
  }, []);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("cart");
    if (saved) {
      const items = JSON.parse(saved);
      setItems(items);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (item: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productoId === item.productoId && JSON.stringify(i.opciones) === JSON.stringify(item.opciones)
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? {...i, cantidad: i.cantidad + item.cantidad}
            : i
        );
      }
      return [...prev, {...item, id: `${item.productoId}-${Date.now()}`}];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? {...i, cantidad} : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{items, addItem, removeItem, updateQuantity, clearCart, total, itemCount}}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}