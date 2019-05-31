//https://zetawiki.com/wiki/UUID_%EC%83%9D%EC%84%B1_%ED%95%A8%EC%88%98_uuidgen()
function uuidgen() {
  function s4() { return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1); }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}