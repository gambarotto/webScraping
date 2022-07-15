const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
const BASE_URL = 'https://hortodidatico.ufsc.br';
const browserHeaders = {
'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
'Accept-Encoding': 'gzip, deflate, br',
'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
'Cache-Control': 'max-age=0',
'Connection': 'keep-alive',
'Cookie':' PHPSESSID=4ptu0gi7er23l4nf39293anae5; __utmc=189798962; __utmz=189798962.1657818310.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=189798962.1085488040.1657818310.1657818310.1657818310.1; __utmc=189798962; __utmz=189798962.1657818310.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); style=null; __utmb=189798962.0.10.1657828802; __utmb=189798962.1.10.1657828802; __utma=189798962.1085488040.1657818310.1657818310.1657818310.1; __utmt=1',
'Host': 'hortodidatico.ufsc.br',
'sec-ch-ua':' ".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
'sec-ch-ua-mobile': '?0',
'sec-ch-ua-platform': '"Linux"',
'Sec-Fetch-Dest': 'document',
'Sec-Fetch-Mode': 'navigate',
'Sec-Fetch-Site': 'none',
'Sec-Fetch-User': '?1',
'Upgrade-Insecure-Requests': '1',
'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
};

const slug = (str) => {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}
const writeToFile = (data, path) => {
  const promiseCallback = (resolve,reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(true);
      }
    });
  }
  return new Promise(promiseCallback);
}
const readFromFile = (filename) => {
  const promiseCallback = (resolve,reject) => {
    fs.readFile(filename, 'utf8',(err, contents) => {
      if (err) {
        resolve(null);
        return;
      }
      resolve(contents);
    })
  }
  return new Promise(promiseCallback); 
}
const getPage = (path) => {
  const url = BASE_URL + path;
  const options = {
    headers: browserHeaders,
  };
  console.log(url);
  return axios.get(url,options).then(response => response.data);
}
const getCachedPage = (path) => {
  const filename =`cache/${slug(path)}.html`;

  const promiseCallback = async(resolve,reject) => {
    const cachedHTML = await readFromFile(filename);

    if(!cachedHTML){
      const html = await getPage(path);
      await writeToFile(html,filename);
      resolve(html);
      return;
    }
    resolve(cachedHTML);
  }
  return new Promise(promiseCallback);
  
}
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
      const aTitle = $('h2 > a',element);
      const title = aTitle.text();

      const pFamily = $(`div.content.clearfix > p:nth-child(3)`,element);
      const family = pFamily.text();
      const popularName = cheerioSelector('Nomes populares:');
      const habitat = cheerioSelector('Origem ou Habitat:');
      const botanicalCharacteristics = cheerioSelector('Características botânicas:');
      const usedParts = cheerioSelector('Partes usadas:');
      const popularUse = cheerioSelector('Uso popular:');
      const chemicalComposition = cheerioSelector('Composição química:');
      const pharmacologicalActions = cheerioSelector('Ações farmacológicas:'); // TODO verificar
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
        name: title,
        family,
        popularName:popularName.split(','),
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
      console.log(plant);
      //plants.push(plant);
    });
      resolve(true);
}
return new Promise(promiseCallback);
};
const getAllPages = async (start, finish) => {

  let page = start;
  do {
    const path = `/category/banco-de-plantas/${alphabet[page]}/page/1`;
    await getCachedPage(path)
    .then(getPageItems)
    .then(data => saveData(data,`./db${alphabet[page]}.json`))
    .then(console.log)
    .catch(console.error);

    page++;
  }while(page < finish);
}
//getAllPages(0,alphabet.length);
    const path = `/category/banco-de-plantas/a/`;
     getCachedPage(path)
    .then(getPageItems)
    .then(data => saveData(data,`./db.json`))
    .then(console.log)
    .catch(console.error);