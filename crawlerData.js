import * as cheerio from 'cheerio';
import { getCachedPage, writeToFile } from './getPageFromWeb.js';

const saveData = (data,path) => {
  const promiseCallback = async(resolve,reject) => {
    if(!data || data.length === 0) resolve(true);
    const dataToStore = JSON.stringify({data: data},null,2);
    const created = await writeToFile(dataToStore,path);
    resolve(true);
}
return new Promise(promiseCallback);
};
const formatText = (text) => {
  if(text){
    return text.split(':')[1].split('.').slice(0,-1).toString();
  }
};
const formatText2 = (text) => {
  if(text){
    const format = text.split(':');
    format.splice(0,1)
    return format.toString().split('.').slice(0,-1).toString();
  }
};
const getPageItems = (html) => {
  const $ = cheerio.load(html);
  const promiseCallback = (resolve,reject) => {

    const plants = [];
    const selector = `#content`;
    const articles = $(selector).find('article.post');
    $(articles).each((i, element) => {
      const cheerioSelector = (contain) => {
        const result = $(`div.content.clearfix > p:contains("${contain}")`,element).nextUntil('p > strong').addBack();
        return formatText(result.text());
      }
      const id = $(element).attr('id').split('-')[1];
      const aTitle = $('h2 > a',element);
      const title = aTitle.text();

      const img = $('div.content.clearfix > p > a > img',element)
      const imgUrl = img.attr('src');
      const pFamily = $(`div.content.clearfix > p:nth-child(3)`,element);
      const family = pFamily.text();
      const popularName = cheerioSelector('Nomes populares:');
      const habitat = cheerioSelector('Origem ou Habitat:');
      const botanicalCharacteristics = cheerioSelector('Características botânicas:');
      const usedParts = cheerioSelector('Partes usadas:');
      const popularUse = cheerioSelector('Uso popular:');
      const chemicalComposition = cheerioSelector('Composição química:');
      
      const pPharmacologicalActions = $(`div.content.clearfix > p:contains("Ações farmacológicas:")`,element)
        .next('p > strong')
        .addBack();
      const pharmacologicalActions = formatText2(pPharmacologicalActions.text());
      
      const drugInteractions = cheerioSelector('Interações medicamentosas:');
      const adverseEffects = cheerioSelector('Efeitos adversos e/ou tóxicos:');
      const contraindications = cheerioSelector('Contra-indicações:');
      const dosageAndUse = cheerioSelector('Posologia e modo de uso:');
      const comments = cheerioSelector('Observações');
      const tagsSelector = $(element).find('a.tag-button');
      let tags = [];
      $(tagsSelector).each((i, element) => {
        const tag = $(element).text();
        tags.push(tag)
      })

      const plant = {
        id,
        name: title,
        imgUrl: imgUrl || '',
        family: family || '',
        popularName: popularName || '',
        habitat: habitat || '',
        botanicalCharacteristics: botanicalCharacteristics || '',
        usedParts: usedParts || '',
        popularUse: popularUse || '',
        chemicalComposition: chemicalComposition || '',
        pharmacologicalActions: pharmacologicalActions || '',
        drugInteractions: drugInteractions || '',
        adverseEffects: adverseEffects || '',
        contraindications: contraindications || '',
        dosageAndUse: dosageAndUse || '',
        comments: comments || '',
        tags: tags
      }
      //(plant);
      plants.push(plant);
    });
      resolve(plants);
}
return new Promise(promiseCallback);
};
export const getAllPages = async (start, finish, alphabet) => {
  let pageLetter = start;

  for(pageLetter; pageLetter < finish; pageLetter++) {
    const path = `/category/banco-de-plantas/${alphabet[pageLetter]}/`;
    const htmlPage = await getCachedPage(path);

    if(htmlPage){
      const $ = cheerio.load(htmlPage);
      const aTotalPages = $('#content > ul.pagination > li:last-child > a');
      const totalPages = Number(aTotalPages.text());
      
      let countPage = totalPages === 0 ? 0 : 1;
      for(countPage; countPage <= totalPages; countPage++){
        await getCachedPage(`${path}page/${countPage}`)
          .then(getPageItems)
          .then(data => saveData(data,`./data-tmp/db${alphabet[pageLetter]}-${countPage}.json`))
          .then(console.log)
          .catch(console.error);
      }
    }
  }
}


    // const path = `/category/banco-de-plantas/b/`;
    //  getCachedPage(path)
    // .then(TESTgetPageItems)
    // .then(data => saveData(data,`./db.json`))
    // .then(console.log)
    // .catch(console.error);