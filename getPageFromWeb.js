import axios from 'axios';
import fs from 'fs';

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
export const writeToFile = (data, path) => {
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
const getPage = async (path) => {
  const url = BASE_URL + path;
  const options = {
    headers: browserHeaders,
  };
    const response = await axios.get(url, options);
  return response.data;
}
export const getCachedPage = (path) => {
  const filename =`cache/${slug(path)}.html`;

  const promiseCallback = async(resolve,reject) => {
    const cachedHTML = await readFromFile(filename);

    if(!cachedHTML){
      try {
        const html = await getPage(path);
          await writeToFile(html,filename);
          resolve(html);
          return
      } catch (error) {
        resolve(false);
        return;
      }
    }
    resolve(cachedHTML);
  }
  return new Promise(promiseCallback);
  
}
