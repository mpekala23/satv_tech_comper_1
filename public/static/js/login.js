let prev_onload = window.onload;

// taken from https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
function getParam(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null) {
       return null;
    }
    return decodeURI(results[1]) || 0;
}

window.onload = (e) => {
  if(prev_onload) {
    prev_onload(e);
  }

  if(getParam("failed")) {
    $("#failed-box").show();
  }
}
