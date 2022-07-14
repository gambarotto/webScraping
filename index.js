const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://gamefaqs.gamespot.com';
const browserHeaders = {
"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
'accept-encoding': 'gzip, deflate, br',
'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
'cache-control': 'max-age=0',
'cookie': 'gf_dvi=ZjYyZDA1MGJlMDBkMDEzMDM0Y2RhNDU3YmQ4YzFlMWRjYWUzMGM1MjJhNDNiYWYxMWJjMjY3OWZmMTEyNjJkMDUwYmU%3D; gf_geo2=MTg3Ljk1LjYzLjcvNzYvNzI2; fv20220715=1; _BB.bs=c|1; AMCVS_3C66570E5FE1A4AB0A495FFC%40AdobeOrg=1; s_vnum=1660411329323%26vn%3D1; s_invisit=true; s_lv_undefined_s=First%20Visit; tglr_anon_id=b19530b0-4a8c-4904-99ab-573a5dede397; tglr_sess_id=7397fe96-56fb-432a-99b6-2284f4cc9962; tglr_ref=https://www.google.com/; tglr_req=https://gamefaqs.gamespot.com/; tglr_sess_count=1; tglr_tenant_id=src_1kYs5kGF0gH8ObQlZU8ldA7KFYZ; cohsn_xs_id=c5cbb757-d745-4424-be4a-c740c407e2c6; AMCV_3C66570E5FE1A4AB0A495FFC%40AdobeOrg=1585540135%7CMCIDTS%7C19188%7CMCMID%7C43772001261482864851144919625736568409%7CMCAAMLH-1658424129%7C4%7CMCAAMB-1658424129%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1657826529s%7CNONE%7CMCSYNCSOP%7C411-19195%7CMCAID%7CNONE%7CvVersion%7C4.4.0; s_cc=true; _BB.enr=pm_4%2Cpm_2; aam_uuid=39175396786984261250360437036960377153; __gads=ID=b27e72e85735871c:T=1657819332:S=ALNI_MZpIRqf06ljJVYbRuLXdsoo1Ku33w; __gpi=UID=00000764d03e4e8c:T=1657819332:RT=1657819332:S=ALNI_MZzHtCqHzinz65P7_gTvZFbtzyiUA; usprivacy=1---; ad_clicker=false; _pw_fingerprint=%224f3d3b4346d7c09c09b7a7e22c97d640%22; _pbjs_userid_consent_data=3524755945110770; _sharedid=4746da04-85bf-4397-89ed-639ac13a50dc; panoramaId_expiry=1658424466423; _cc_id=1d5a42872fcc2fa60e6384d8307c565; panoramaId=9975051a65b9eddf4b02c5ca50664945a70287e86877cd744f7d941bb5e72502; pwUID=715725164959910; dw-tag=mantle_skin%3Bcontent; OptanonConsent=isIABGlobal=false&datestamp=Thu+Jul+14+2022+14%3A29%3A02+GMT-0300+(Hor%C3%A1rio+Padr%C3%A3o+de+Bras%C3%ADlia)&version=6.7.0&hosts=&consentId=361b3ed5-582f-401e-9221-51aa5bc6716b&interactionCount=1&landingPath=NotLandingPage&groups=C0002%3A1%2CC0003%3A1%2CC0004%3A1%2CC0005%3A1&AwaitingReconsent=false&geolocation=BR%3BSP; OptanonAlertBoxClosed=2022-07-14T17:29:02.410Z; _BB.d=0|||6; chsn_cnsnt=gamefaqs.gamespot.com%3AC0002%2CC0003%2CC0004%2CC0005; prevPageType=platform_game_list; s_getNewRepeat=1657819742720-New; s_lv_undefined=1657819742720; playwirePageViews=3; s_sq=%5B%5BB%5D%5D; utag_main=v_id:0181fdbb72910009c4abf196c3cc05065001e05d00bd0$_sn:1$_se:12$_ss:0$_st:1657821543663$ses_id:1657819329170%3Bexp-session$_pn:6%3Bexp-session$vapi_domain:gamespot.com; RT="z=1&dm=gamefaqs.gamespot.com&si=54371efd-8eee-492c-b863-8940aa9d2d94&ss=l5lato3n&sl=6&tt=ken&bcn=%2F%2F17de4c1c.akstat.io%2F&ld=8wz5&ul=ajgb"',
'referer': 'https://gamefaqs.gamespot.com/',
'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
'sec-ch-ua-mobile': '?0',
'sec-ch-ua-platform':' "Linux"',
'sec-fetch-dest': 'document',
'sec-fetch-mode': 'navigate',
'sec-fetch-site': 'same-origin',
'sec-fetch-user': '?1',
'upgrade-insecure-requests': '1',
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
const getPageItems = (html) => {
  const $ = cheerio.load(html);
  const promiseCallback = (resolve,reject) => {

    const selector = `#content > div.post_content.row > div > div:nth-child(1) > div.body > table > tbody > tr`;
    const games = [];
    $(selector).each((i, element) => {
      const a = $('td.rtitle > a',element);
      const title = a.text();
      const href = a.attr('href');
      const id = href.split('/').pop();
      games.push({id, title, path: href})
    });
      resolve(games);
}
return new Promise(promiseCallback);
};
const getAllPages = async (start, finish) => {
  let page = start;
  do {
    const path = `/n64/category/999-all?page=${page}`;
    await getCachedPage(path)
    .then(getPageItems)
    .then(data => saveData(data,`./db${page}.json`))
    .then(console.log)
    .catch(console.error);

    page++;
  }while(page < finish);
}
getAllPages(0,10);