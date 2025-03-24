// Install ODBC:
// https://sourceforge.net/projects/firebird/files/firebird-ODBC-driver/2.0.5-Release/Firebird_ODBC_2.0.5.156_Win32.exe/download

function init()
{
  X_API_KEY = getParameter('config.ini', 1);
  END_POINT = getParameter('config.ini', 2);
  FRONTOL_DB_PATH = getParameter('config.ini', 3);
}

//KmInfo:
// cis: str
// valid: bool
// printView: str
// gtin: str
// groupsId: [int]
// verified: bool
// found: bool
// realizable: bool
// utilised: bool
// isBlocked: bool
// expireDate: date
// productionDate: date
// isOwner: bool
// errorCode: int
// isTracking: bool
// sold: bool
// packageType: str
// producerInn: str
// grayZone: bool
// soldunitCount: float
// innerUnitCount: float
function getExpirationDate(KmInfo)
{
    expireDateStr = KmInfo.expireDate;
    expireDateStr = expireDateStr.substring(0, 10).replace(/-/g, '.');
    expireDateParts = expireDateStr.split('.');
    expireDateStr = expireDateParts[2] + '.' + expireDateParts[1] + "." + expireDateParts[0];

    return expireDateStr;
}

function getParameter(filename, lineNumber)
{
  var fso = new ActiveXObject('Scripting.FileSystemObject');
  var file = fso.OpenTextFile(filename, 1);
  for (var i = 0; i < (parseInt(lineNumber) - 1); i++) {
    file.SkipLine();
  }
  value = file.ReadLine();
  file.Close();
  return value;
}
function getMarkStatus(KM)
{
    codes = [
        KM
    ];
    body = {
         'codes': codes
    }
    result = sendRequest('/api/v4/true-api/codes/check', 'POST', body);  
    
    //DUBUG
    //print JSON string readable
    var jsonString = JSON.stringify(JSON.parse(result), null, 2);
    frontol.actions.showMessage(jsonString.replace(/\n/g, '\r\n'));    
    resultObj = JSON.parse(result);
    if(resultObj.code == 0){
        return resultObj.codes[0];
    }
}

function sendRequest(path, method, body)
{
  xmlhttp = new ActiveXObject("MsXml2.ServerXMLHTTP");
  xmlhttp.setOption(2, 13056); // для обхода ошибки самоподписного сертификата
  try
    {
     //   frontol.actions.showMessage("DEBUG");
        xmlhttp.open(method, END_POINT + path, false);

    }
    catch (E)
    {
         frontol.actions.showError("Ошибка получения данных: " + E.description);
        return -1;
    }      
    xmlhttp.setRequestHeader("Accept", "application/json");
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader("Accept-Charset", "utf-8");
    xmlhttp.setRequestHeader("x-api-key", X_API_KEY);

    try
    {
        //frontol.actions.showMessage(JSON.stringify(body));
        xmlhttp.send(JSON.stringify(body));
    }
    catch (E)    
    {
        frontol.actions.showError("Не удалось получить данные: " + E.description);
        return -999;
    }

    //DEBUG
    //frontol.actions.showMessage(xmlhttp.responseText);

    return xmlhttp.responseText;
}

//getBeerTapMark: str -> str
//  Возвращает КМ, привязанной к крану с кодом tapCode.
//  Если отсутствует кран с указанным кодом, возвращает -1.
function getBeerTapMark(tapCode)
{
    db = "DRIVER=Firebird/InterBase(r) driver; DBNAME=localhost:" + FRONTOL_DB_PATH + ";UID=sysdba;PWD=masterkey;CHARSET=WIN1251;";        
    var conn = new ActiveXObject("ADODB.Connection");
    conn.Provider = "MSDASQL.1";
      
    conn.Open(db);
    var rs = new ActiveXObject("ADODB.Recordset");
    rs.Open("SELECT label FROM beer_tap WHERE code = '" + tapCode + "'", conn);
    if (rs.EOF)
    {
        return -1;
    }
    var result = rs.Fields.Item(0).Value;
    rs.Close();
    conn.Close();
    
    km = unescape(encodeURIComponent(result).replace(/%u/g, '\\u'));

    return km;
}

// для работы с json
"object"!=typeof JSON&&(JSON={}),function(){"use strict";function f(e){return 10>e?"0"+e:e}function this_value(){return this.valueOf()}function quote(e){return rx_escapable.lastIndex=0,rx_escapable.test(e)?'"'+e.replace(rx_escapable,function(e){var t=meta[e];return"string"==typeof t?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function str(e,t){var r,n,u,f,o,a=gap,p=t[e];switch(p&&"object"==typeof p&&"function"==typeof p.toJSON&&(p=p.toJSON(e)),"function"==typeof rep&&(p=rep.call(t,e,p)),typeof p){case"string":return quote(p);case"number":return isFinite(p)?String(p):"null";case"boolean":case"null":return String(p);case"object":if(!p)return"null";if(gap+=indent,o=[],"[object Array]"===Object.prototype.toString.apply(p)){for(f=p.length,r=0;f>r;r+=1)o[r]=str(r,p)||"null";return u=0===o.length?"[]":gap?"[\n"+gap+o.join(",\n"+gap)+"\n"+a+"]":"["+o.join(",")+"]",gap=a,u}if(rep&&"object"==typeof rep)for(f=rep.length,r=0;f>r;r+=1)"string"==typeof rep[r]&&(n=rep[r],u=str(n,p),u&&o.push(quote(n)+(gap?": ":":")+u));else for(n in p)Object.prototype.hasOwnProperty.call(p,n)&&(u=str(n,p),u&&o.push(quote(n)+(gap?": ":":")+u));return u=0===o.length?"{}":gap?"{\n"+gap+o.join(",\n"+gap)+"\n"+a+"}":"{"+o.join(",")+"}",gap=a,u}}var rx_one=/^[\],:{}\s]*$/,rx_two=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,rx_three=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,rx_four=/(?:^|:|,)(?:\s*\[)+/g,rx_escapable=/[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,rx_dangerous=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta,rep;"function"!=typeof JSON.stringify&&(meta={"\b":"\\b","    ":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(e,t,r){var n;if(gap="",indent="","number"==typeof r)for(n=0;r>n;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if(rep=t,t&&"function"!=typeof t&&("object"!=typeof t||"number"!=typeof t.length))throw new Error("JSON.stringify");return str("",{"":e})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){function walk(e,t){var r,n,u=e[t];if(u&&"object"==typeof u)for(r in u)Object.prototype.hasOwnProperty.call(u,r)&&(n=walk(u,r),void 0!==n?u[r]=n:delete u[r]);return reviver.call(e,t,u)}var j;if(text=String(text),rx_dangerous.lastIndex=0,rx_dangerous.test(text)&&(text=text.replace(rx_dangerous,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})),rx_one.test(text.replace(rx_two,"@").replace(rx_three,"]").replace(rx_four,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();
