
function EntityPayload() {
  return {
    getPostEntity(entity) {
      return {
         name: entity.getName(),
         longDesc: entity.getLongDesc(),
         shortDesc: entity.getShortDesc(),
         visibleDate: entity.getVisibleDate(),
         expiryDate: entity.getExpiryDate(),
         inventories: entity.getInventories(),
         images: entity.getImages(),
         categories: entity.getCategories(),
      }
    }
  }
}


export default EntityPayload;
