
function OrderPayload() {
  return {
    getPostOrder(order) {
      return {
         entityName: order.getEntityName(),
         entityId: order.getEntityId(),
         quantity: order.getQuantity(),
         status: order.getStatus(),
         shippingFrom: order.getShippingFrom(),
         inventory: order.getInventory(),
         category: order.getCategory(),
         currencies: order.getCurrencies(),
      }
    }
  }
}


export default OrderPayload;
