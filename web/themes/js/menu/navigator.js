var myNavigatorRequest=getHTMLHTTPRequest();function callNavigatorAjax(c){myMoveAction.reInit();internalWindow.closeAll();myHelpWindowReloadState=true;var b=parseInt(Math.random()*99999999);var a=myServerAddress+"Navigator?rand="+b+"&path="+c;myNavigatorRequest.open("GET",a,true);myNavigatorRequest.onreadystatechange=drawNavAction;writeWaitMsg(div,"themes/icons/ajax_loading/8.gif","");myNavigatorRequest.send(null)}var div="breadcrumb";function drawNavAction(){if(myNavigatorRequest.readyState==4){if(myNavigatorRequest.status==200){var a='&nbsp;Navigation: <font color="#345678"><i>'+myNavigatorRequest.responseText+"</i></font>";var b='<table cellpadding="0" cellspacing="0" border="1" width=100%><tr><td>'+a+"</td></tr></table>";drawNav(myNavigatorRequest.responseText,div)}else{alert("Connection Problem:"+myNavigatorRequest.statusText)}}}function drawNav(a,b){document.getElementById(b).innerHTML=null;document.getElementById(b).innerHTML=a};