const download = require('image-downloader');

const options = {
  url: 'https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001.jpg',
  dest: './upload/'                  
};

let imageArr = [
  "https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001.jpg",
  "https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001_01.jpg",
  "https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001_02.jpg",
  "https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001_03.jpg", 
  "https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001_04.jpg", 
  "https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001_05.jpg", 
  "https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001_06.jpg", 
  "https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001_07.jpg", 
  "https://www.craftsaga.com/wp-content/uploads/2012/08/p-150-APLW001_08.jpg"
];
 
async function downloadIMG() {
  try {
    for (let val of imageArr) {
        options.url = val;
        const { filename, image } = await download.image(options);
        console.log(filename);
    }
  } catch (e) {
    console.error(e);
  }
}
 
downloadIMG();