var contCatTableparent=1;var contCatTableTop=1;var contCatTableCurrentParent=1;var contCatTablecontainer="blankContent";var contCatPropertiesWindow=null;var INPUT_NAME_PREFIX="inputName";var RADIO_NAME="radName";var TABLE_NAME="contactCatSample";var DIV_NAV_NAME="contactCatNavDiv";var ROW_BASE=1;var hasLoaded=false;var ctx_THEAD="CONT_TTHEAD123";var ctx_TBODY="CONT_TTBODY123";var key="qwerty";var sid=0;var callBack=function(){if(myContextMenuRequest.readyState==4){if(myContextMenuRequest.status==200){configureContextMenu();callContactsAjax(1)}else{alert("Connection Problem:"+myContextMenuRequest.statusText)}}};var initializeContactsTable=function(a){myCurrentMenuParent=a;writeWaitMsg(contCatTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");callContextMenuAjax(a,callBack)};var menu2=function(){return configureContextMenuModel()};contextMenu.modifyMenu=function(){var a=this.srcElement;currentMenuBar=this.menuBar;var b;while(true){b=a.parentNode;if(b.tagName!="TR"){a=b;continue}else{break}}clickOnTableRowContext(b);if(b.myRow==null){setMenuItemState(212880,"disabled");setMenuItemState(212890,"disabled");setMenuItemState(212910,"disabled");setMenuItemState(212950,"disabled")}else{setMenuItemState(212950,"regular");setMenuItemState(212880,"regular");setMenuItemState(212890,"regular");setMenuItemState(212910,"regular")}if(myMoveAction.movableItemType==null){setMenuItemState(212930,"disabled")}else{setMenuItemState(212930,"regular")}if(contCatTableCurrentParent==1){setMenuItemState(212810,"disabled");setMenuItemState(212820,"disabled")}else{setMenuItemState(212810,"regular");setMenuItemState(212820,"regular")}setMenuPermissions(currentMenuBar)};function callContactsAjax(d){if(document.getElementById(contCatTablecontainer)==null){return}if(contCatPropertiesWindow!=null){contCatPropertiesWindow.close()}var b=getHTMLHTTPRequest();contCatTableCurrentParent=d;var c=parseInt(Math.random()*99999999);var a=myServerAddress+"MyXMLDispatcher?rand="+c+"&path="+30020+"&parent="+d+"&method=get";b.open("GET",a,true);b.onreadystatechange=function(){if(b.readyState==4){if(b.status==200){renderContCat(b)}else{alert("Connection Problem:"+b.statusText)}}};writeWaitMsg(contCatTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");b.send(null)}function renderContCat(b){var c=b.responseXML;if(c==null){alert("Data Error");return}var d=c.getElementsByTagName("status");var a=systemStatus(contCatTablecontainer,d);if(a==0){return}var e="";e+="<div id='"+DIV_NAV_NAME+"'></div>";e+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='45%'>Description</td><td width='15%'>Address</td><td width='15%'>Number</td><td>D</td><td>E</td></tr></thead>";e+="<tbody id='"+ctx_TBODY+"'></tbody></table>";document.getElementById(contCatTablecontainer).innerHTML=e;updateContCatNav(c,DIV_NAV_NAME);initiateTableRollover(TABLE_NAME,"tableRollOverEffect1","tableRowClickEffect1");populateTable(c,TABLE_NAME);contextMenu.attachTo(ctx_THEAD,menu2());contextMenu.attachTo(ctx_TBODY,menu2())}var updateContCatNav=function(b,a){var d=b.getElementsByTagName("levelParent");var c="<table class='navTable'><tr>";if(d!=null&&d.length>=1){contCatTableparent=d[0].getAttribute("id");c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callContactsAjax("+contCatTableparent+")'><img src='images/utilities/up.png' border='0' alt='Up one level'></a></td>";c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callContactsAjax("+contCatTableTop+")'><img src='images/utilities/top.png' border='0' alt='Top level'></a></td>";c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatAddWindow(\""+TABLE_NAME+'","contactCat");\'>Add Directory</a></td>';c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatAddWindow(\""+TABLE_NAME+'","contact");\'>Add Contact</a></td>';c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>"}else{c+="<td><img src='images/utilities/up1.png' alt='Up one level'></td>";c+="<td><img src='images/utilities/top1.png' alt='Top level'></td>";c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatAddWindow(\""+TABLE_NAME+'","contactCat");\'>Add Directory</a></td>';c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatAddWindow(\""+TABLE_NAME+'","contact");\'>Add Contact</a></td>';c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";c+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";contCatTableparent=1}c+="<td>&nbsp;</td><td align='right'><input type='button' name='search' value='Search' onclick='populateSearchWin();'/></td></tr></table>";document.getElementById(a).innerHTML=c};var populateTable=function(e,b){var d=e.getElementsByTagName("contactCat");var a;var f;var g;for(var c=0;c<d.length;c++){f=document.getElementById(b);a=f.tBodies[0].rows.length;g=Array();g[0]="contactCat";g[1]=d[c].childNodes[0].firstChild.data;g[2]=d[c].childNodes[1].firstChild.data;g[3]=d[c].childNodes[2].firstChild.data;g[4]=d[c].childNodes[3].firstChild.data;g[5]=d[c].childNodes[4].firstChild.data;addRowToTable1(f,a,g);reorderRows(f,a)}d=e.getElementsByTagName("contact");for(c=0;c<d.length;c++){f=document.getElementById(b);a=f.tBodies[0].rows.length;g=Array();g[0]="contact";g[1]=d[c].childNodes[0].firstChild.data;g[2]=d[c].childNodes[1].firstChild.data;g[3]=d[c].childNodes[2].firstChild.data;g[4]=d[c].childNodes[3].firstChild.data;g[5]=d[c].childNodes[4].firstChild.data;g[6]=d[c].childNodes[5].firstChild.data;g[7]=d[c].childNodes[6].firstChild.data;g[8]=d[c].childNodes[7].firstChild.data;g[9]=d[c].childNodes[8].firstChild.data;addRowToTable1(f,a,g);reorderRows(f,a)}};var myRowObject=function(b){this.content=Array();for(var a=0;a<b.length;a++){this.content[a]=b[a]}};var addRowToTable1=function(g,k,j){var m=g.tBodies[0].rows.length;var b=m+ROW_BASE;if(k==-1){k=m}else{b=k+ROW_BASE}var i=g.tBodies[0].insertRow(k);if(j[1]==sid){i.className="searchClass"}var d=Array();d[0]=i.insertCell(0);if(j[0]=="contactCat"){d[0].innerHTML="<a href='javascript:void(0);' onclick='callContactsAjax("+j[1]+")'><img src='images/utilities/folder.gif' border='0'></a>"}else{d[0].innerHTML="<img src='images/utilities/contact.png' border='0'>"}d[1]=i.insertCell(1);var c=document.createTextNode(b);d[1].appendChild(c);d[2]=i.insertCell(2);var r=document.createTextNode(j[2]);d[2].appendChild(r);d[3]=i.insertCell(3);var n=document.createTextNode(j[3]);d[3].appendChild(n);d[4]=i.insertCell(4);var f;if(j[0]=="contactCat"){f=document.createTextNode("--")}else{f=document.createTextNode(j[4])}d[4].appendChild(f);d[5]=i.insertCell(5);var e;if(j[0]=="contactCat"){e=document.createTextNode("--")}else{e=document.createTextNode(j[5])}d[5].appendChild(e);d[6]=i.insertCell(6);var q=document.createElement("input");q.setAttribute("type","checkbox");d[6].appendChild(q);d[7]=i.insertCell(7);var l;try{l=document.createElement('<input type="radio" name="'+RADIO_NAME+'" value="'+b+'">');var o=l.name.length}catch(p){l=document.createElement("input");l.setAttribute("type","radio");l.setAttribute("name",RADIO_NAME);l.setAttribute("value",b)}d[7].appendChild(l);var h=Array();h[0]=q;h[1]=l;h[2]=d[0].innerHTML;h[3]=c;h[4]=r;h[5]=n;h[6]=j[1];h[7]=j[0];if(j[0]=="contactCat"){h[8]=j[4];h[9]=j[5]}else{h[8]=j[8];h[9]=j[9];h[10]=f;h[11]=e;h[12]=j[6];h[13]=j[7]}var a=new myRowObject(h);i.myRow=a;addRowRolloverEffect(i)};function callDeleteContCatAjax(g,h,d){if(!confirmDelete()){return}var l=getHTMLHTTPRequest();var k=g;var c=h;var e=d;var j=parseInt(Math.random()*99999999);var b="";var m="";for(var f=0;f<h.length;f++){if(h[f].myRow.content[7]=="contactCat"&&b==""){b+=h[f].myRow.content[6]}else{if(h[f].myRow.content[7]=="contact"&&m==""){m+=h[f].myRow.content[6]}else{if(h[f].myRow.content[7]=="contactCat"){b+=","+h[f].myRow.content[6]}else{m+=","+h[f].myRow.content[6]}}}}var a=myServerAddress+"MyXMLDispatcher?rand="+j+"&path="+30030+"&contactCatId="+URLEncode(b)+"&contactId="+URLEncode(m)+"&method=delete";l.open("GET",a,true);l.onreadystatechange=function(){if(l.readyState==4){if(l.status==200){var n=l.responseXML;var i=0;if(n==null){alert("Data Error")}else{var o=n.getElementsByTagName("status");i=systemStatus(null,o)}if(i==1){deleteRows(c);reorderRows(k,e)}else{if(i==2){alert("DELETE: System Error")}}}else{alert("Connection Problem:"+l.statusText)}closeSplashScreen()}};openSplashScreen();l.send(null)}var deleteChecked=function(d){var f=document.getElementById(d);var a=new Array();var b=0;for(var c=0;c<f.tBodies[0].rows.length;c++){if(f.tBodies[0].rows[c].myRow.content[0].checked){a[b]=f.tBodies[0].rows[c];b++}}if(a.length>0){var e=a[0].sectionRowIndex;callDeleteContCatAjax(f,a,e)}};var deleteRows=function(c){for(var a=0;a<c.length;a++){var b=c[a].sectionRowIndex;c[a].parentNode.deleteRow(b)}};var reorderRows=function(d,c){if(d.tBodies[0].rows[c]){var b=c+ROW_BASE;for(var a=c;a<d.tBodies[0].rows.length;a++){d.tBodies[0].rows[a].myRow.content[3].data=b;b++}}};var deleteContextChecked=function(){var a=new Array();var b=contextMenu.srcElement;while(true){a[0]=b.parentNode;if(a[0].tagName!="TR"){b=a[0];continue}else{break}}var d=a[0].parentNode.parentNode;var c=a[0].sectionRowIndex;callDeleteContCatAjax(d,a,c)};var contCatPropertiesWindowDiv="blankHidden";var contCatPropertiesWindowTitle="Properties";var contCatPropertiesWindowId="contCatPropertiesWindowId";var indexOfRowToEdit=-1;var rowToEdit=null;var myContextContCatEditWindow=function(){indexOfRowToEdit=-1;rowToEdit=null;var a=contextMenu.srcElement;while(true){rowToEdit=a.parentNode;if(rowToEdit.tagName!="TR"){a=rowToEdit;continue}else{break}}if(rowToEdit!=null){populateContCatEditWin()}};var myContCatEditWindow=function(b){var c=document.getElementById(b);indexOfRowToEdit=-1;rowToEdit=null;for(var a=0;a<c.tBodies[0].rows.length;a++){if(c.tBodies[0].rows[a].myRow&&c.tBodies[0].rows[a].myRow.content[1].getAttribute("type")=="radio"&&c.tBodies[0].rows[a].myRow.content[1].checked){indexOfRowToEdit=a;rowToEdit=c.tBodies[0].rows[a]}}if(rowToEdit!=null){populateContCatEditWin()}};var populateContCatEditWin=function(){var a="<table>";if(rowToEdit!=null){if(rowToEdit.myRow.content[7]=="contactCat"){a+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";a+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";a+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";a+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditContCatAjax();'>Update</a>&nbsp;&nbsp;";a+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Discard</a></td></tr>"}else{a+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";a+="<tr><td><label>Description:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";a+="<tr><td><label>Address:</label></td><td><textarea rows='6' cols='30' id='editAddress'>"+rowToEdit.myRow.content[10].data+"</textarea></td></tr>";a+="<tr><td><label>Number:</label></td><td><input size='40' type='text' id='editNumber' value='"+rowToEdit.myRow.content[11].data+"'></td></tr>";a+="<tr><td><label>Website:</label></td><td><input size='40' type='text' id='editWebsite' value='"+rowToEdit.myRow.content[12]+"'></td></tr>";a+="<tr><td><label>E-Mail:</label></td><td><input size='40' type='text' id='editEmail' value='"+rowToEdit.myRow.content[13]+"'></td></tr>";a+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";a+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditContCatAjax();'>Update</a>&nbsp;&nbsp;";a+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Discard</a></td></tr>"}}a+="</table>";var b=document.getElementById(contCatPropertiesWindowDiv);b.innerHTML=a;openMyContCatPropertiesWin()};var openMyContCatPropertiesWin=function(){contCatPropertiesWindow=internalWindow.open("contCatPropertiesWindowId","div",contCatPropertiesWindowDiv,"#Properties Window","width=450px,height=350px,left=200px,top=150px,resize=1,scrolling=1")};var myContCatUpdateData="";var myContCatEditRequest=getHTMLHTTPRequest();var callEditContCatAjax=function(){var b=parseInt(Math.random()*99999999);var d="";var c;if(rowToEdit.myRow.content[7]=="contactCat"){c="updateContactCat";d="id="+rowToEdit.myRow.content[6];d+="&name="+URLEncode(document.getElementById("editName").value);d+="&description="+URLEncode(document.getElementById("editDescription").value);d+="&remarks="+URLEncode(document.getElementById("editRemarks").value)}else{c="updateContact";d="id="+rowToEdit.myRow.content[6];d+="&name="+URLEncode(document.getElementById("editName").value);d+="&description="+URLEncode(document.getElementById("editDescription").value);d+="&address="+URLEncode(document.getElementById("editAddress").value);d+="&number="+URLEncode(document.getElementById("editNumber").value);d+="&website="+URLEncode(document.getElementById("editWebsite").value);d+="&email="+URLEncode(document.getElementById("editEmail").value);d+="&remarks="+URLEncode(document.getElementById("editRemarks").value)}var a=myServerAddress+"MyXMLDispatcher?rand="+b+"&path="+30040+"&method="+c;myContCatEditRequest.open("POST",a,true);myContCatEditRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");myContCatEditRequest.setRequestHeader("Content-length",d.length);myContCatEditRequest.onreadystatechange=updateContCatAction;openSplashScreen();myContCatEditRequest.send(d)};function updateContCatAction(){if(myContCatEditRequest.readyState==4){if(myContCatEditRequest.status==200){var b=myContCatEditRequest.responseXML;var a=0;if(b==null){alert("Data Error")}else{var c=b.getElementsByTagName("status");a=systemStatus(null,c)}if(a==1){if(rowToEdit.myRow.content[7]=="contactCat"){rowToEdit.myRow.content[4].data=document.getElementById("editName").value;rowToEdit.myRow.content[5].data=document.getElementById("editDescription").value;rowToEdit.myRow.content[8]=document.getElementById("editRemarks").value}else{rowToEdit.myRow.content[4].data=document.getElementById("editName").value;rowToEdit.myRow.content[5].data=document.getElementById("editDescription").value;rowToEdit.myRow.content[10].data=document.getElementById("editAddress").value;rowToEdit.myRow.content[11].data=document.getElementById("editNumber").value;rowToEdit.myRow.content[12]=document.getElementById("editWebsite").value;rowToEdit.myRow.content[13]=document.getElementById("editEmail").value;rowToEdit.myRow.content[8]=document.getElementById("editRemarks").value}}else{if(a==2){alert("EDIT: System Error")}}contCatPropertiesWindow.close()}else{alert("Connection Problem:"+myContCatEditRequest.statusText);contCatPropertiesWindow.close()}closeSplashScreen()}}var myContCatTable=null;var myContCatAddWindow=function(a,b){var c=document.getElementById(a);myContCatTable=c;populateContCatAddWin(b)};var populateContCatAddWin=function(b){var a="<table>";if(b=="contactCat"){a+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";a+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";a+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";a+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddContCatAjax(\""+b+"\");'>Add</a>&nbsp;&nbsp;";a+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Discard</a></td></tr>"}else{a+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";a+="<tr><td><label>Description:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";a+="<tr><td><label>Address:</label></td><td><textarea rows='6' cols='30' id='editAddress'>-</textarea></td></tr>";a+="<tr><td><label>Number:</label></td><td><input size='40' type='text' id='editNumber' value='-'></td></tr>";a+="<tr><td><label>Website:</label></td><td><input size='40' type='text' id='editWebsite' value='-'></td></tr>";a+="<tr><td><label>E-Mail:</label></td><td><input size='40' type='text' id='editEmail' value='-'></td></tr>";a+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";a+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddContCatAjax(\""+b+"\");'>Add</a>&nbsp;&nbsp;";a+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Discard</a></td></tr>"}a+="</table>";var c=document.getElementById(contCatPropertiesWindowDiv);c.innerHTML=a;openMyContCatPropertiesWin()};var myContCatAddData="";var myContCatAddRequest=getHTMLHTTPRequest();var callAddContCatAjax=function(b){var c=parseInt(Math.random()*99999999);if(b=="contactCat"){method="addContactCat";myContCatAddData="id="+contCatTableCurrentParent;myContCatAddData+="&name="+URLEncode(document.getElementById("editName").value);myContCatAddData+="&description="+URLEncode(document.getElementById("editDescription").value);myContCatAddData+="&remarks="+URLEncode(document.getElementById("editRemarks").value)}else{method="addContact";myContCatAddData="id="+contCatTableCurrentParent;myContCatAddData+="&name="+URLEncode(document.getElementById("editName").value);myContCatAddData+="&description="+URLEncode(document.getElementById("editDescription").value);myContCatAddData+="&address="+URLEncode(document.getElementById("editAddress").value);myContCatAddData+="&number="+URLEncode(document.getElementById("editNumber").value);myContCatAddData+="&website="+URLEncode(document.getElementById("editWebsite").value);myContCatAddData+="&email="+URLEncode(document.getElementById("editEmail").value);myContCatAddData+="&remarks="+URLEncode(document.getElementById("editRemarks").value)}var a=myServerAddress+"MyXMLDispatcher?rand="+c+"&path="+30050+"&method="+method;myContCatAddRequest.open("POST",a,true);myContCatAddRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");myContCatAddRequest.setRequestHeader("Content-length",myContCatAddData.length);myContCatAddRequest.onreadystatechange=addContCatAction;openSplashScreen();myContCatAddRequest.send(myContCatAddData)};function addContCatAction(){if(myContCatAddRequest.readyState==4){if(myContCatAddRequest.status==200){var d=myContCatAddRequest.responseXML;var a=0;if(d==null){alert("Data Error")}else{var e=d.getElementsByTagName("status");a=systemStatus(null,e)}if(a==1){var b=d.getElementsByTagName("key")[0].getAttribute("value");var c=d.getElementsByTagName("key")[0].getAttribute("type");var g=Array();var f=0;if(c=="contactCat"){g[0]="contactCat";g[1]=""+b;g[2]=document.getElementById("editName").value;g[3]=document.getElementById("editDescription").value;g[4]=document.getElementById("editRemarks").value;g[5]=""+contCatTableCurrentParent;f=getMaxContCatRow()}else{g[0]="contact";g[1]=""+b;g[2]=document.getElementById("editName").value;g[3]=document.getElementById("editDescription").value;g[4]=document.getElementById("editAddress").value;g[5]=document.getElementById("editNumber").value;g[6]=document.getElementById("editWebsite").value;g[7]=document.getElementById("editEmail").value;g[8]=document.getElementById("editRemarks").value;g[9]=""+contCatTableCurrentParent;f=getMaxContRow()}addRowToTable1(myContCatTable,f,g);reorderRows(myContCatTable,f)}else{if(a==2){alert("ADD: System Error")}}contCatPropertiesWindow.close()}else{alert("Connection Problem:"+myContCatAddRequest.statusText);contCatPropertiesWindow.close()}closeSplashScreen()}}var getMaxContRow=function(){var b=myContCatTable;var c=-1;for(var a=0;a<b.tBodies[0].rows.length;a++){if(b.tBodies[0].rows[a].myRow.content[7]=="contact"&&c<=a){c=a}}if(c==-1){for(a=0;a<b.tBodies[0].rows.length;a++){if(b.tBodies[0].rows[a].myRow.content[7]=="contactCat"&&c<=a){c=a}}}return c+1};var getMaxContCatRow=function(){var b=myContCatTable;var c=-1;for(var a=0;a<b.tBodies[0].rows.length;a++){if(b.tBodies[0].rows[a].myRow.content[7]=="contactCat"&&c<=a){c=a}}return c+1};var myParamsForMovableItem=new Array();var cutContextSelected=function(){myMoveAction.reInit();var c=null;var b=contextMenu.srcElement;while(true){c=b.parentNode;if(c.tagName!="TR"){b=c;continue}else{break}}var a=new Array();if(c.myRow.content[7]=="contactCat"){myMoveAction.cut("contactCat",c.myRow.content[6],c.myRow.content[9]);a[0]="contactCat";a[1]=""+c.myRow.content[6];a[2]=""+c.myRow.content[4].data;a[3]=""+c.myRow.content[5].data;a[4]=""+c.myRow.content[8];a[5]=""+c.myRow.content[9]}else{if(c.myRow.content[7]=="contact"){myMoveAction.cut("contact",c.myRow.content[6],c.myRow.content[9]);a[0]="contact";a[1]=""+c.myRow.content[6];a[2]=""+c.myRow.content[4].data;a[3]=""+c.myRow.content[5].data;a[4]=""+c.myRow.content[10].data;a[5]=""+c.myRow.content[11].data;a[6]=""+c.myRow.content[12];a[7]=""+c.myRow.content[13];a[8]=""+c.myRow.content[8];a[9]=""+c.myRow.content[9]}}myMoveAction.initParams(a)};var callPasteToLocationAjax=function(){myMoveAction.verify=function(){if(this.movableItemType=="contactCat"){if(this.movableItemId==this.movableToParentId){alert("Cannot move selected to it's own subtree");return false}if(this.movableFromCurrentParentId==this.movableToParentId){alert("Please chose a different location");return false}}else{if(this.movableItemType=="contact"){if(this.movableFromCurrentParentId==this.movableToParentId){alert("Please chose a different location");return false}}}return true};if(myMoveAction.paste(contCatTableCurrentParent)==false){return}var h=""+myMoveAction.movableItemId;var c=""+myMoveAction.movableItemType;var a=""+myMoveAction.movableFromCurrentParentId;var d=""+myMoveAction.movableToParentId;var g=myMoveAction.paramArray;if(c=="contact"){g[9]=d}else{if(c=="contactCat"){g[5]=d}}var f=getHTMLHTTPRequest();var e=parseInt(Math.random()*99999999);var b=myServerAddress+"MyXMLDispatcher?rand="+e+"&path="+20680+"&id="+h+"&pid="+a+"&newPid="+d+"&method="+c;f.open("GET",b,true);f.onreadystatechange=function(){if(f.readyState==4){if(f.status==200){var j=f.responseXML;var i=0;if(j==null){alert("Data Error")}else{var k=j.getElementsByTagName("status");i=systemStatus(null,k)}if(i==1){myContCatTable=document.getElementById(TABLE_NAME);if(c=="contact"){addRowToTable1(document.getElementById(TABLE_NAME),getMaxContRow(),g)}else{if(c=="contactCat"){addRowToTable1(document.getElementById(TABLE_NAME),getMaxContCatRow(),g)}}}else{if(i==2){alert("Move: System Error")}}}else{alert("Connection Problem:"+f.statusText)}myMoveAction.reInit();closeSplashScreen()}};openSplashScreen();f.send(null)};var rowToDetail=null;var myContextContCatDetailWindow=function(){rowToDetail=null;var a=contextMenu.srcElement;while(true){rowToDetail=a.parentNode;if(rowToDetail.tagName!="TR"){a=rowToDetail;continue}else{break}}if(rowToDetail!=null){populateContCatDetailWin()}};function populateContCatDetailWin(){var a="<table width='80%' height='80%' align='center'>";if(rowToDetail!=null){if(rowToDetail.myRow.content[7]=="contactCat"){a+="<tr><td><label>Name:</label></td><td>"+rowToDetail.myRow.content[4].data+"</td></tr>";a+="<tr><td><label>Specification:</label></td><td>"+rowToDetail.myRow.content[5].data+"</td></tr>";a+="<tr><td><label>Remarks:</label></td><td>"+rowToDetail.myRow.content[8]+"</td></tr>";a+="<tr><td colspan='2' align='center'>";a+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Ok</a></td></tr>"}else{a+="<tr><td><label>Name:</label></td><td>"+rowToDetail.myRow.content[4].data+"</td></tr>";a+="<tr><td><label>Description:</label></td><td>"+rowToDetail.myRow.content[5].data+"</td></tr>";a+="<tr><td><label>Address:</label></td><td>"+rowToDetail.myRow.content[10].data+"</td></tr>";a+="<tr><td><label>Number:</label></td><td>"+rowToDetail.myRow.content[11].data+"</td></tr>";a+="<tr><td><label>Website:</label></td><td>"+rowToDetail.myRow.content[12]+"</td></tr>";a+="<tr><td><label>E-Mail:</label></td><td>"+rowToDetail.myRow.content[13]+"</td></tr>";a+="<tr><td><label>Remarks:</label></td><td>"+rowToDetail.myRow.content[8]+"</td></tr>";a+="<tr><td colspan='2' align='center'>";a+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Ok</a></td></tr>"}}a+="</table>";var b=document.getElementById(contCatPropertiesWindowDiv);b.innerHTML=a;openMyContCatPropertiesWin()}var populateSearchWin=function(){var a="<table>";a+="<tr><td><label>Enter keyword:</label></td><td><input size='40' type='text' id='searchKey' value=''></td><td><input type='button' value='GO' onclick='vaildateKey();'></td></tr>";a+="</table>";a+="<div id='searchResult'>&nbsp;</div>";var b=document.getElementById("blankHidden1");b.innerHTML=a;openSearchWin()};var openSearchWin=function(){projectPropertiesWindow=internalWindow.open("searchWindow","div","blankHidden1","Search Contacts","width=600px,height=400px,left=200px,top=150px,resize=1,scrolling=1")};function vaildateKey(){key=document.getElementById("searchKey").value;if(key.length<3){alert("Enter Minimum 3 Character");return}else{callSearchContactAjax()}}function callSearchContactAjax(){var c=getHTMLHTTPRequest();contCatTableCurrentParent=id;var d=parseInt(Math.random()*99999999);var b=URLEncode(key);var a=myServerAddress+"MyXMLDispatcher?rand="+d+"&path="+30020+"&key="+b+"&method=searchContact";c.open("GET",a,true);c.onreadystatechange=function(){if(c.readyState==4){if(c.status==200){renderContSearch(c)}else{alert("Connection Problem:"+c.statusText)}}};writeWaitMsg("searchResult","themes/icons/ajax_loading/22.gif","Processing request, please wait...");c.send(null)}function renderContSearch(b){var c=b.responseXML;if(c==null){alert("Data Error");return}var e=c.getElementsByTagName("status");var a=systemStatus("searchResult",e);if(a==0){return}var f="";f+="<table id='searchTable' width='100%' class='contentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='45%'>Description</td><td width='15%'>Address</td><td width='15%'>Number</td></tr></thead>";f+="<tbody></tbody></table>";document.getElementById("searchResult").innerHTML=f;populateContactTable(c,"searchTable");var d=document.getElementById("searchResult").innerHTML;document.getElementById("searchResult").innerHTML=doHighlight(d,key);addTableRolloverEffect("searchTable","tableRollOverEffect2","tableRowClickEffect2")}var populateContactTable=function(e,b){var d=e.getElementsByTagName("contactCat");var a;var f;var g;for(var c=0;c<d.length;c++){f=document.getElementById(b);a=f.tBodies[0].rows.length;g=Array();g[0]="contactCat";g[1]=d[c].childNodes[0].firstChild.data;g[2]=d[c].childNodes[1].firstChild.data;g[3]=d[c].childNodes[2].firstChild.data;g[4]=d[c].childNodes[3].firstChild.data;g[5]=d[c].childNodes[4].firstChild.data;addRowToContactTable(f,a,g);reorderRows(f,a)}d=e.getElementsByTagName("contact");for(c=0;c<d.length;c++){f=document.getElementById(b);a=f.tBodies[0].rows.length;g=Array();g[0]="contact";g[1]=d[c].childNodes[0].firstChild.data;g[2]=d[c].childNodes[1].firstChild.data;g[3]=d[c].childNodes[2].firstChild.data;g[4]=d[c].childNodes[3].firstChild.data;g[5]=d[c].childNodes[4].firstChild.data;g[6]=d[c].childNodes[5].firstChild.data;g[7]=d[c].childNodes[6].firstChild.data;g[8]=d[c].childNodes[7].firstChild.data;g[9]=d[c].childNodes[8].firstChild.data;addRowToContactTable(f,a,g);reorderRows(f,a)}};var addRowToContactTable=function(f,g,c){var m=f.tBodies[0].rows.length;var b=m+1;if(g==-1){g=m}else{b=g+1}var n=f.tBodies[0].insertRow(g);var l=Array();l[0]=n.insertCell(0);if(c[0]=="contactCat"){l[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+c[1]+";callContactsAjax("+c[5]+")'><img src='images/utilities/folder.gif' border='0'></a>"}else{l[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+c[1]+";callContactsAjax("+c[9]+")'><img src='images/utilities/contact.png' border='0'></a>"}l[1]=n.insertCell(1);var h=document.createTextNode(b);l[1].appendChild(h);l[2]=n.insertCell(2);var a=document.createTextNode(c[2]);l[2].appendChild(a);l[3]=n.insertCell(3);var k=document.createTextNode(c[3]);l[3].appendChild(k);l[4]=n.insertCell(4);var j;if(c[0]=="contactCat"){j=document.createTextNode("--")}else{j=document.createTextNode(c[4])}l[4].appendChild(j);l[5]=n.insertCell(5);var d;if(c[0]=="contactCat"){d=document.createTextNode("--")}else{d=document.createTextNode(c[5])}l[5].appendChild(d);var e=Array();e[0]="";e[1]="";e[2]=l[0].innerHTML;e[3]=h;e[4]=a;e[5]=k;e[6]=c[1];e[7]=c[0];if(c[0]=="contactCat"){e[8]=c[4];e[9]=c[5]}else{e[8]=c[8];e[9]=c[9];e[10]=j;e[11]=d;e[12]=c[6];e[13]=c[7]}var i=new myRowObject(e);n.myRow=i};initializeContactsTable(10130);