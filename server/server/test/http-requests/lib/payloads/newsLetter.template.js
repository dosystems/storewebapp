
function NewsLetterPayload() {
  return {
   
    getPostNewsLetter(newsletter) {
      return {
        name: newsletter.getName(),
        subject: newsletter.getSubject(),
        data: newsletter.getData(),
        type: newsletter.getType(),
      }
    }
  }
}


export default NewsLetterPayload;
