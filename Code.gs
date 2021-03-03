function checkIRPF() {
  var userProperties = PropertiesService.getUserProperties();
  
  var toCheck = [
    {
    "CodigoAcesso": "",
    "Senha": "",
    "NI": "cpf"     
    },{
    "CodigoAcesso": "",
    "Senha": "",
    "NI": "cpf"
    }
    ];
  
  var payload = {
    "ExibeCaptcha": "False",
    "id": "-1",
    "ExibiuImagem": "true",
  };
  
 
  for (let person of toCheck) {
    Object.assign(payload, person);
    var response = UrlFetchApp.fetch('https://cav.receita.fazenda.gov.br/autenticacao/Login/CodigoAcesso', {'method': 'post', 'contentType': 'application/x-www-form-urlencoded', 'payload': payload, 'validateHttpsCertificates': false, 'followRedirects': false});
    var cookie = response.getAllHeaders()['Set-Cookie'][2];
    cookie = cookie.split(";")[0];
    var header = {"Cookie": "infoMultiAcesso=true; " + cookie}                    
    response = UrlFetchApp.fetch("https://www3.cav.receita.fazenda.gov.br/extratodirpf/api/appinit/ecac", {'validateHttpsCertificates': false, "headers":header});
    var jwt_token = JSON.parse(JSON.parse(response.getContentText()).token);
    header['Authorization'] = 'JWT ' + jwt_token.key;
    var timeline = UrlFetchApp.fetch("https://www3.cav.receita.fazenda.gov.br/extratodirpf/api/loadtimeline", {'validateHttpsCertificates': false, "headers":header});
    timeline = JSON.parse(timeline.getContentText());
    var currentIncomeTaxDec = timeline.declaracoesResponse.declaracoes[0];
    var situation = currentIncomeTaxDec.situacaoDeclaracaoExtrato;
    if (situation != userProperties.getProperty('situation' + person.NI))
      GmailApp.sendEmail("email@gmail.com", "Alteração no IRPF " + person.NI, "Novo status de processamento: " + situation);
    userProperties.setProperty('situation' + person.NI, situation);
  }
  
}
