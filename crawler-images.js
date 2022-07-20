require('dotenv/config');
const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const axios = require('axios');
const fs = require('fs');

const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
const CUSTOM_SEARCH_API_KEY = process.env.CUSTOM_SEARCH_API_KEY;

const searchImagesInGoogle = async () => {
  const response = await customSearch.cse.list({
    auth: CUSTOM_SEARCH_API_KEY,
    cx: SEARCH_ENGINE_ID,
    q: 'Araruta Planta free',
    searchType: 'image',
    num: 3
  });
  const urlImages = response.data.items.map(item => item.link);
  console.log(urlImages);
}
//searchImagesInGoogle();
const download_image = (url, image_path) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
  );
//const image = download_image('http://hortomedicinal.paginas.ufsc.br/files/2019/12/ARNICA-DA-SERRA3.jpg', 'test.jpg');
