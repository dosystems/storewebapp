
function BrandPayload() {
  return {
   
    getPostBrand(brand) {
      return {
        name: brand.getName(),
      }
    }
  }
}


export default BrandPayload;
