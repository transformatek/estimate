var menuBarContainer="menuBarContainer";var menuBar;var sideMenuContainer="sideMenuContainer";var sideMenuBar;var uniqueMenuIdAdder=3000000;var repeatedAjaxRequest=false;var myMenuRequest=getHTMLHTTPRequest();function callMenuAjax(){var b=parseInt(Math.random()*99999999);var a=myServerAddress+"MenuXml?method=getmainmenu&rand="+b;myMenuRequest.open("GET",a,true);myMenuRequest.onreadystatechange=drawMenuAction;writeWaitMsg(menuBarContainer,"themes/icons/ajax_loading/21.gif","Loading Main Menu, Please wait...");myMenuRequest.send(null)}function drawMenuAction(){if(myMenuRequest.readyState==4){if(myMenuRequest.status==200){menuBar=createMenubar(menuBar,myMenuRequest,"top",menuBarContainer,0);setupPermissions(myMenuRequest)}else{alert("Connection Problem:"+myMenuRequest.statusText)}}}var menuCssDir="css/";function createMenubar(d,f,h,c,e){document.getElementById(c).innerHTML="";var j=f.responseXML;var b=j.getElementsByTagName("menuitem");var g=b.length;var i=null;i=new DHTMLSuite.menuModel();if(h=="sub"){i.setSubMenuType(1,"sub")}DHTMLSuite.commonObj.setCssCacheStatus(false);var a=0;for(a=0;a<g;a++){setMenuParameters(b[a],i,e)}if(h=="sub"){i.setMainMenuGroupWidth(200)}i.init();d=null;d=new DHTMLSuite.menuBar();d.addMenuItems(i);d.setTarget(c);if(h=="sub"){d.setActiveSubItemsOnMouseOver(true)}d.init();return d}function setMenuParameters(e,g,f){var i=e.getAttribute("id");var d=e.getAttribute("parent");var c=e.getAttribute("name");var a=e.getAttribute("description");var j=e.getAttribute("image");var h=e.getAttribute("action");var k=e.getAttribute("link");var b=e.getAttribute("width");if(d==1){d=false}else{d=f+parseInt(d)}if(i==1){return}else{i=f+parseInt(i)}if(c=="-"){if(d==false){g.addSeparator()}else{g.addSeparator(d)}return}if(c!="-"){g.addItem(i,c,j,k,d,a,h);if(b!=0){g.setSubMenuWidth(i,b)}}}function setupPermissions(f){var d=f.responseXML;var b=d.getElementsByTagName("access");var c=b.length;var a=0;for(a=0;a<c;a++){var e=b[a].getAttribute("id");menuBar.setMenuItemState(e,"disabled")}}var myFavouritesRequest=getHTMLHTTPRequest();function callFavouriteAjax(){var b=parseInt(Math.random()*99999999);var a=myServerAddress+"Favourites?rand="+b+"&count="+6;myFavouritesRequest.open("GET",a,true);myFavouritesRequest.onreadystatechange=drawFavouritesAction;myFavouritesRequest.send(null);writeWaitMsg(sideMenuContainer,"themes/icons/ajax_loading/19.gif","")}function drawFavouritesAction(){if(myFavouritesRequest.readyState==4){if(myFavouritesRequest.status==200){document.getElementById(sideMenuContainer).innerHTML=myFavouritesRequest.responseText}else{alert("Connection Problem:"+myFavouritesRequest.statusText)}}}var myCurrentMenuParent=0;var currentMenuBar=null;var currentContextModel=null;var myContextMenuArray=new Array();var myContextMenuBlockedList=new Array();var myContextMenuObject=function(b){this.content=Array();for(var a=0;a<b.length;a++){this.content[a]=""+b[a]}};var myContextMenuRequest=getHTMLHTTPRequest();function callContextMenuAjax(d,b){myCurrentMenuParent=d;currentMenuBar=null;currentContextModel=null;myContextMenuArray=null;myContextMenuBlockedList=null;var c=parseInt(Math.random()*99999999);var a=myServerAddress+"MenuXml?method=getmenu&id="+d+"&rand="+c;myContextMenuRequest.open("GET",a,true);if(b==null){b=contextMenuCallBack}myContextMenuRequest.onreadystatechange=b;myContextMenuRequest.send(null)}var contextMenuCallBack=function(){if(myContextMenuRequest.readyState==4){if(myContextMenuRequest.status==200){configureContextMenu()}else{alert("Connection Problem:"+myContextMenuRequest.statusText)}}};var configureContextMenu=function(b){var c=myContextMenuRequest;var d=c.responseXML;if(d==null){alert("Data Error");return}var e=d.getElementsByTagName("status");var a=systemStatus(b,e);if(a==0){return}populateContextMenuConfig(d)};var populateContextMenuConfig=function(d){myContextMenuArray=new Array();myContextMenuBlockedList=new Array();var c=d.getElementsByTagName("menuitem");var a=0;for(var b=0;b<c.length;b++){var e=Array();e[0]=c[b].getAttribute("id");e[1]=c[b].getAttribute("parent");e[2]=c[b].getAttribute("name");e[3]=c[b].getAttribute("description");e[4]=c[b].getAttribute("image");e[5]=c[b].getAttribute("action");e[6]=c[b].getAttribute("link");e[7]=c[b].getAttribute("status");e[8]=c[b].getAttribute("width");e[9]=c[b].getAttribute("permission");myContextMenuArray[b]=e;if(parseInt(e[9])!=0){myContextMenuBlockedList[a]=parseInt(e[0]);a++}}};var configureContextMenuModel=function(){if(currentContextModel!=null){return currentContextModel}var a=new DHTMLSuite.menuModel();for(var b=0;b<myContextMenuArray.length;b++){setContextMenuItem(myContextMenuArray[b],a,0)}a.init();currentContextModel=a;return currentContextModel};var setContextMenuItem=function(e,g,f){var i=e[0];var d=e[1];var c=e[2];var a=e[3];var j=e[4];var h=e[5];var k=e[6];var b=e[8];var l=e[9];if(parseInt(d)==myCurrentMenuParent){d=false}else{d=f+parseInt(d)}if(parseInt(i)==myCurrentMenuParent){return}else{i=f+parseInt(i)}if(c=="-"){if(d==false){g.addSeparator()}else{g.addSeparator(d)}return}if(c!="-"){g.addItem(i,c,j,k,d,a,h);if(b!=0){g.setSubMenuWidth(i,b)}}};var isInBlockedList=function(e,d){var a=false;var c=parseInt(""+e);for(var b=0;b<d.length;b++){if(d[b]==e){a=true;break}}return a};var enableMenuItem=function(c,b,a){a.setMenuItemState(c,"regular")};var disableMenuItem=function(c,b,a){a.setMenuItemState(c,"disabled")};var showMenuItem=function(b,a){if(a==null){a=currentMenuBar}a.showMenuItem(b)};var hideMenuItem=function(b,a){if(a==null){a=currentMenuBar}a.hideMenuItem(b)};var setMenuItemState=function(c,b,a){if(a==null){a=currentMenuBar}if(b=="disabled"){disableMenuItem(c,null,a)}else{if(b=="regular"){enableMenuItem(c,null,a)}}};var setMenuPermissions=function(c,b){if(b==null){b=myContextMenuBlockedList}for(var a=0;a<b.length;a++){c.setMenuItemState(b[a],"disabled")}};