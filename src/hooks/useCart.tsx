import { createContext, ReactNode, useContext, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
  finishOrder: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const history = useHistory();
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productsUpdated = [...cart];
      const hasInStock = productsUpdated.find(
        (product) => product.id === productId
      );

      const response = await api.get(`/stock/${productId}`);
      const amountInStock = response.data.amount;
      const currentAmount = hasInStock ? hasInStock.amount : 0;
      const amount = currentAmount + 1;

      if (amount > amountInStock) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      if (hasInStock) {
        hasInStock.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`);
        const newProduct = { ...product.data, amount: 1 };
        productsUpdated.push(newProduct);
      }

      setCart(productsUpdated);
      localStorage.setItem(
        "@RocketShoes:cart",
        JSON.stringify(productsUpdated)
      );
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productIndex = updatedCart.findIndex(
        (product) => product.id === productId
      );
      if (productIndex >= 0) {
        updatedCart.splice(productIndex, 1);
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) return;

      const inStock = await api.get(`stock/${productId}`);
      const amountInStock = inStock.data.amount;
      if (amount > amountInStock) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const updatedCart = [...cart];
      const carExists = updatedCart.find((item) => item.id === productId);
      if (carExists) {
        carExists.amount = amount;
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  function finishOrder() {
    toast.success("Compra efetuada com sucesso! Volte sempre!!");
    localStorage.removeItem("@RocketShoes:cart");
    setCart([]);
    history.goBack();
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addProduct,
        removeProduct,
        updateProductAmount,
        finishOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
