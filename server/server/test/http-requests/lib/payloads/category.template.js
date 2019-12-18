
function CategoryPayload() {
  return {
   
    getPostCategory(category) {
      return {
        name: category.getName(),
        categories: category.getCategories(),

      }
    }
  }
}


export default CategoryPayload;
