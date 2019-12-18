
function AttributePayload() {
  return {
   
    getPostAttribute(attribute) {
      return {
        name: attribute.getName(),
      }
    }
  }
}


export default AttributePayload;
