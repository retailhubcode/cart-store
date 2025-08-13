import { useStore } from "../node_modules/@nanostores/react/index";
import { computed, map } from "../node_modules/nanostores/index";
import { getCartCookieValueUniversal } from "./sdk/cart-cookies";
import { getUTMParams } from "./utils/get-utm-params";

function createCommerceServiceCart() {
  const utmParams = getUTMParams();

  return {
    action: {
      removeItems: async (itemsToRemove: any) => {
        const cart = $cart?.get() || {};

        /* const response = await CommerceService.checkout.removeItems({
          cartId: cart.id,
          removeItems: itemsToRemove,
          cartItems: cart.items,
        });

        return response as { success: boolean; data: any } | undefined; */
        return {
          success: false,
          data: {},
        };
      },
      updateItems: async (itemsToUpdate: any) => {
        /* const cart = $cart?.get() || {};
        const response = await CommerceService.checkout.updateItems({
          cartId: cart.id,
          items: itemsToUpdate,
          utmParams,
        });

        return response as { success: boolean; data: any } | undefined; */
        return {
          success: false,
          data: {},
        };
      },
      addItems: async (props: any) => {
        const data = {
          cartId: await getCartCookieValueUniversal(),
          items: props.items,
          utmParams: utmParams,
        };
        /* const response = await CommerceService.checkout.addItems({
          cartId: await getCartCookieValueUniversal(),
          items: props.items,
          utmParams: utmParams,
        });
        return response as { success: boolean; data: any } | undefined; */
        fetch(`${window.location.host}/api/add-cart-items`, {
          cache: "no-store",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        console.log("foi o fetch");

        return {
          success: false,
          data: {},
        };
      },
    },
  };
}
const $commerceServiceCart = createCommerceServiceCart();

function createCartStore() {
  const $remoteState = map({
    items: [] as any[],
    id: "",
    total: 0,
    currency: "BRL",
    couponCode: "",
    postalCode: "",
    checkoutUrl: "",
    activeCouponCode: "",
    selectedPaymentSystem: "",
  });

  const $store = computed($remoteState, (state) => {
    const isGift = (item: any) => item.price === 0;

    const gifts = state.items?.filter((item) => isGift(item));
    const items = state.items.filter((item) => !isGift(item));
    return {
      ...state,
      gifts,
      items,
      totalUniqueItems: state.items.length,
      totalItems: state.items.reduce(
        (acc, curr: any) => acc + curr?.quantity,
        0
      ),
      subTotal: items.reduce(
        (acc, curr) => acc + (curr.listPrice || curr.price) * curr.quantity,
        0
      ),
      total: items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0),
    };
  });

  return {
    instance: $store,
    use: useStore.bind(null, $store),
    get: () => $store.get(),
    set: (updated: any) => {
      $remoteState.set(updated);
    },

    methods: {
      /**
       * Remove skus do carrinho
       *
       * @param itemsToRemove - Array de objetos com os skus a serem removidos
       * @returns Promise com o resultado da remoção
       */
      removeSku: async (itemsToRemove: any) => {
        try {
          const response = await $commerceServiceCart.action.removeItems(
            itemsToRemove
          );

          if (response?.success) {
            $remoteState.set(response.data as any);
          }
        } catch (error) {
          console.error("Error removing item from cart:", error);
        }
      },
      /**
       * atualiza skus do carrinho, como quantidade de itens
       *
       * @param itemsToUpdate - Array de objetos com os skus a serem atualizados
       * @returns Promise com o resultado da atualização
       */
      updatedSku: async (itemsToUpdate: any) => {
        try {
          const response = await $commerceServiceCart.action.updateItems(
            itemsToUpdate
          );

          const { success, data } = response ?? {};

          /* if (success) {
            $remoteState.set({
              ...data,
              checkoutUrl: data.checkoutUrl || $remoteState.get().checkoutUrl,
            } as any);

            return data?.items.find((item: any) =>
              itemsToUpdate.some(
                ({ variantId }: any) => variantId === item.variantId
              )
            );
          } */
        } catch (error) {
          console.error("Error adding item to cart:", error);
        }
      },
      /**
       * adiciona um novo skus ao carrinho
       *
       * @param itemsToAdd - Array de objetos com os novos skus a serem adicionados
       * @returns Promise com o resultado da adição
       */
      addItems: async (itemsToAdd: any) => {
        const updated = itemsToAdd;
        console.log("lalala", updated);
        try {
          const response = await $commerceServiceCart.action.addItems({
            items: updated,
          });

          const { success, data } = response ?? {};

          /* if (success) {
            $remoteState.set(data);
            //openCart();
          }
          return data.items.find((cartItem: any) =>
            updated.some((item: any) => item.variantId === cartItem.variantId)
          ); */
        } catch (error) {
          console.error("Error adding item to cart:", error);
        }
      },
    },
  };
}

const $cart = createCartStore();

if (typeof window !== "undefined") {
  window.RetailHub = window.RetailHub || {};
  window.RetailHub.states = window.RetailHub.states || {};
  window.RetailHub.states.$cart = $cart;

  window.RetailHub = window.RetailHub || {};
  window.RetailHub.states = window.RetailHub.states || {};
  window.RetailHub.states.$commerceServiceCart = $commerceServiceCart;
}

export { $cart, $commerceServiceCart };
