var billTablecontainer="blankContent";var TABLE_NAME="controlBillSample";var DIV_NAV_NAME="controlBillNavDiv";var ROW_BASE=1;var controlEstimateId=0;var contextMenu=null;contextMenu=new DHTMLSuite.contextMenu();contextMenu.setWidth(140);var myCurrentControlEstimateId=0;var myCurrentEstimateId=0;var callBack=function(){if(myContextMenuRequest.readyState==4){if(myContextMenuRequest.status==200){configureContextMenu();callControlBillAjax(myCurrentControlEstimateId,myCurrentEstimateId)}else{alert("Connection Problem:"+myContextMenuRequest.statusText)}}};var initializeControlBillTable=function(c,b,a){myCurrentMenuParent=c;myCurrentControlEstimateId=b;myCurrentEstimateId=a;writeWaitMsg(billTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");callContextMenuAjax(c,callBack)};var menu2=function(){return configureContextMenuModel()};contextMenu.modifyMenu=function(){var a=this.srcElement;currentMenuBar=this.menuBar;var b;while(true){b=a.parentNode;if(b.tagName!="TR"){a=b;continue}else{break}}clickOnTableRowContext(b);var c=b.parentNode.parentNode;var d=c.parentNode;if(d.getAttribute("entryRef")!=null&&d.getAttribute("entryRef")!=""){hideMenuItem(212310);hideMenuItem(212330);showMenuItem(212340);showMenuItem(212350);if(b.myRow==null){setMenuItemState(212350,"disabled")}else{if(b.myRow.content[21]==0){setMenuItemState(212350,"disabled")}else{setMenuItemState(212350,"regular")}}}else{hideMenuItem(212340);hideMenuItem(212350);showMenuItem(212310);showMenuItem(212330);if(b.myRow==null){setMenuItemState(212310,"disabled");setMenuItemState(212330,"disabled")}else{if(b.myRow.content[4]=="plannedJobs"){setMenuItemState(212310,"regular");if(b.myRow.content[5]=="1"){setMenuItemState(212330,"regular")}else{setMenuItemState(212330,"disabled")}}}}setMenuPermissions(currentMenuBar)};function callControlBillAjax(e,a){if(document.getElementById(billTablecontainer)==null){return}controlEstimateId=e;var c=getHTMLHTTPRequest();var d=parseInt(Math.random()*99999999);var b=myServerAddress+"MyXMLDispatcher?rand="+d+"&path="+21120+"&id="+e+"&estimateId="+a+"&method=get";c.open("GET",b,true);c.onreadystatechange=function(){if(c.readyState==4){if(c.status==200){renderControlBill(c)}else{alert("Connection Problem:"+c.statusText)}}};writeWaitMsg(billTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");c.send(null)}function renderControlBill(b){var c=b.responseXML;if(c==null){alert("Data Error");return}var d=c.getElementsByTagName("status");var a=systemStatus(billTablecontainer,d);if(a==0){return}var e="";e+="<div id='"+DIV_NAV_NAME+"'></div>";e+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead><tr><td width='10px'>&nbsp;</td><td width='1%'>Sl</td><td width='15%'>Name</td><td width='100%'>Description</td><td width='16px'>&nbsp;</td></tr></thead>";e+="<tbody></tbody></table>";document.getElementById(billTablecontainer).innerHTML=e;updateBillNav(c,DIV_NAV_NAME);populateTable(c,TABLE_NAME);initiateTableRollover(TABLE_NAME,"tableRollOverEffect1","tableRowClickEffect1")}var updateBillNav=function(b,a){var c="<table class='innerNavTable'><tr>";c+="<td>Filter: <input name='filter' onKeyUp='filter(this, \""+TABLE_NAME+"\")' type='text'></td>";c+="</tr></table>";document.getElementById(a).innerHTML=c};var populateTable=function(e,b){var d=e.getElementsByTagName("bill");for(var c=0;c<d.length;c++){var f=document.getElementById(b);var a=f.tBodies[0].rows.length;var g=Array();g[0]=d[c].childNodes[0].firstChild.data;g[1]=d[c].childNodes[1].firstChild.data;g[2]=d[c].childNodes[2].firstChild.data;addRowToTable1(f,a,g);addHiddenRowToTable(f,a+1,g[0])}};var myRowObject=function(b){this.content=Array();for(var a=0;a<b.length;a++){this.content[a]=b[a]}};var addRowToTable1=function(e,f,c){var k=e.tBodies[0].rows.length;var b=k+ROW_BASE;if(f==-1){f=k}else{b=(f+ROW_BASE+1)/2}var l=e.tBodies[0].insertRow(f);var j=Array();j[0]=l.insertCell(0);j[0].innerHTML="<img src='images/project/entry.png' border='0'>";j[1]=l.insertCell(1);var g=document.createTextNode(b);j[1].appendChild(g);j[2]=l.insertCell(2);var a=document.createTextNode(c[1]);j[2].appendChild(a);j[3]=l.insertCell(3);var i=document.createTextNode(c[2]);j[3].appendChild(i);j[4]=l.insertCell(4);j[4].innerHTML="<a style='text-decoration: none;' href='javascript:void(0);' onclick='showBillDetail("+c[0]+");'>Show</a>";j[4].id="td"+c[0];var d=Array();d[0]=g;d[1]=c[0];var h=new myRowObject(d);l.myRow=h;addRowRolloverEffect(l)};function filter(b,f){var e=b.value.toLowerCase().split(" ");var h=document.getElementById(f);var j;for(var a=0;a<h.tBodies[0].rows.length;a+=2){j=h.tBodies[0].rows[a].innerHTML.replace(/<[^>]+>/g,"");var g="none";for(var c=0;c<e.length;c++){if(j.toLowerCase().indexOf(e[c])>=0){g=""}else{g="none";break}}if(g==""&&h.tBodies[0].rows[a].style.display=="none"){var d=h.tBodies[0].rows[a].myRow.content[1];if(h.tBodies[0].rows[a].style.display=="none"){h.tBodies[0].rows[a].cells[4].innerHTML="<a style='text-decoration: none;' href='javascript:void(0);' onclick='showBillDetail("+d+");'>Show</a>"}}h.tBodies[0].rows[a].style.display=g;if(g=="none"&&h.tBodies[0].rows[a+1].style.display==""){h.tBodies[0].rows[a+1].style.display=g}else{if(g==""&&h.tBodies[0].rows[a+1].style.display=="none"){h.tBodies[0].rows[a+1].style.display="none"}}}}var addHiddenRowToTable=function(e,c,g){var f=e.tBodies[0].insertRow(c);f.id="jobsRow"+g;f.style.display="none";contextMenu.attachTo(f.id,menu2());var b=Array();b[1]=f.insertCell(0);b[1].colSpan=7;b[1].width="100%";var d=document.createElement("table");d.id="table"+g;d.className="ControlJobtable";d.cellPadding="0";d.cellSpacing="0";var a=d.insertRow(0);a.className="classControlHeader";appendCell(a,"3%","Sl",0);appendCell(a,"4%","ID",1);appendCell(a,"20%","Description",2);appendCell(a,"9%","Number",3);appendCell(a,"9%","Length",4);appendCell(a,"9%","Breadth",5);appendCell(a,"9%","Height",6);appendCell(a,"9%","Weight",7);appendCell(a,"7%","Total",8);appendCell(a,"8%","Start",9);appendCell(a,"8%","Finish",10);appendCell(a,"5%","Status",11);b[1].appendChild(d);initiateTableRollover("table"+g,"tableRollOverEffect2","tableRowClickEffect2")};var appendCell=function(d,b,c,a){tmpCell=d.insertCell(a);tmpCell.width=b;tmpCell.appendChild(document.createTextNode(c))};var showBillDetail=function(f){showBillTable(f);var e=document.getElementById("table"+f);var a=e.tBodies[0].rows.length;if(a<=1){var c=getHTMLHTTPRequest();var d=parseInt(Math.random()*99999999);var b=myServerAddress+"MyXMLDispatcher?rand="+d+"&path="+21130+"&id="+f+"&method=get";c.open("GET",b,true);c.onreadystatechange=function(){if(c.readyState==4){if(c.status==200){renderBillDetail(c)}else{alert("Connection Problem:"+c.statusText)}closeSplashScreen()}};openSplashScreen();c.send(null)}};var showBillTable=function(a){if(document.getElementById("jobsRow"+a).style.display=="none"){document.getElementById("jobsRow"+a).style.display="";document.getElementById("td"+a).innerHTML="<a style='text-decoration: none;' href='javascript:void(0);' onclick='showBillDetail("+a+");'>Hide</a>"}else{document.getElementById("jobsRow"+a).style.display="none";document.getElementById("td"+a).innerHTML="<a style='text-decoration: none;' href='javascript:void(0);' onclick='showBillDetail("+a+");'>Show</a>"}};var renderBillDetail=function(c){var d=c.responseXML;if(d==null){alert("Data Error");return}var e=d.getElementsByTagName("status");var a=systemStatus(null,e);if(a==0){return}var b=d.getElementsByTagName("Key");if(b!=null&&b.length>0){var f=d.getElementsByTagName("Key")[0].getAttribute("id");populateDetailTable(d,"table"+f)}};var populateDetailTable=function(e,b){var d=e.getElementsByTagName("entry");for(var c=0;c<d.length;c++){var f=document.getElementById(b);var a=f.tBodies[0].rows.length;var g=Array();g[0]=d[c].childNodes[0].firstChild.data;g[1]=d[c].childNodes[1].firstChild.data;g[2]=d[c].childNodes[2].firstChild.data;g[3]=d[c].childNodes[3].firstChild.data;g[4]=d[c].childNodes[4].firstChild.data;g[5]=d[c].childNodes[5].firstChild.data;g[6]=d[c].childNodes[6].firstChild.data;g[7]=d[c].childNodes[7].firstChild.data;g[8]=d[c].childNodes[8].firstChild.data;g[9]=d[c].childNodes[9].firstChild.data;g[10]=d[c].childNodes[10].firstChild.data;g[11]=b;addRowToDetailTable(f,a,g)}};var addRowToDetailTable=function(g,l,j){var q=g.tBodies[0].rows.length;var b=q+ROW_BASE;if(l==-1){l=q}else{b=l+ROW_BASE-1}var i=g.tBodies[0].insertRow(l);var d=Array();d[0]=i.insertCell(0);var c=document.createTextNode(b);d[0].appendChild(c);d[1]=i.insertCell(1);var e=document.createTextNode(j[0]);d[1].appendChild(e);d[2]=i.insertCell(2);var r=document.createTextNode(j[1]);d[2].appendChild(r);d[3]=i.insertCell(3);var k=document.createTextNode(j[2]);d[3].appendChild(k);d[4]=i.insertCell(4);var f=document.createTextNode(j[3]);d[4].appendChild(f);d[5]=i.insertCell(5);var n=document.createTextNode(j[4]);d[5].appendChild(n);d[6]=i.insertCell(6);var o=document.createTextNode(j[5]);d[6].appendChild(o);d[7]=i.insertCell(7);var m=document.createTextNode(j[6]);d[7].appendChild(m);d[8]=i.insertCell(8);var v=document.createTextNode(j[7]);d[8].appendChild(v);d[9]=i.insertCell(9);var t=document.createTextNode(j[8]);d[9].appendChild(t);d[10]=i.insertCell(10);var s=document.createTextNode(j[9]);d[10].appendChild(s);d[11]=i.insertCell(11);var u="";if(j[10]=="0"){u="Planned"}else{if(j[10]=="1"){u="Running"}else{if(j[10]=="2"){u="Halted"}else{if(j[10]=="3"){u="Finished"}else{u="Undefined"}}}}var p=document.createTextNode(u);d[11].appendChild(p);var h=Array();h[0]=j[0];h[1]=t;h[2]=s;h[3]=p;h[4]="plannedJobs";h[5]=j[10];var a=new myRowObject(h);i.myRow=a;addRowRolloverEffect(i)};var jobPropertiesWindowDiv="blankHidden1";var jobPropertiesWindowId="jobPropertiesWindowId";var jobPropertiesWindow=null;var rowToEdit=null;var planShcedule=function(){var a=contextMenu.srcElement;var b;while(true){b=a.parentNode;if(b.tagName!="TR"){a=b;continue}else{break}}if(b!=null&&b.myRow!=null&&b.myRow.content[4]=="plannedJobs"){rowToEdit=b;populateShceduleEditWin(b)}else{return}};var populateShceduleEditWin=function(c){var a="<table>";a+="<tr><td><label>Planned Start:</label></td><td><input size='40' type='text' id='editStartDate' value='"+c.myRow.content[1].data+"' onclick='pickDate(this,this,0);' readonly='readonly'> dd/mm/yyyy</td></tr>";a+="<tr><td><label>Planned Finish:</label></td><td><input size='40' type='text' id='editFinishDate' value='"+c.myRow.content[2].data+"' onclick='pickDate(this,this,0);' readonly='readonly'> dd/mm/yyyy</td></tr>";a+="<tr><td><label>Job Status:</label></td>";a+="<td><select id='editStatus'>";a+="<option value='0' "+(rowToEdit.myRow.content[5]=="0"?"selected='selected'":"")+">Planned</option>";a+="<option value='1' "+(rowToEdit.myRow.content[5]=="1"?"selected='selected'":"")+">Running</option>";a+="<option value='2' "+(rowToEdit.myRow.content[5]=="2"?"selected='selected'":"")+">Halted</option>";a+="<option value='3' "+(rowToEdit.myRow.content[5]=="3"?"selected='selected'":"")+">Finished</option>";a+="</select></td></tr>";a+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditScheduleAjax();'>Update</a>&nbsp;&nbsp;";a+="<a href='javascript:void(0)' onclick='jobPropertiesWindow.close()'>Discard</a></td></tr>";a+="</table>";var b=document.getElementById(jobPropertiesWindowDiv);b.innerHTML=a;openScheduleEditWin()};var openScheduleEditWin=function(){jobPropertiesWindow=internalWindow.open(jobPropertiesWindowId,"div",jobPropertiesWindowDiv,"#Schedule Window","width=450px,height=350px,left=200px,top=150px,resize=1,scrolling=1");jobPropertiesWindow.onclose=function(){if(calendarObjForForm.isVisible()){calendarObjForForm.hide()}return true}};var callEditScheduleAjax=function(){var d="";var f=getHTMLHTTPRequest();var g=parseInt(Math.random()*99999999);var c=document.getElementById("editStartDate").value;var e=document.getElementById("editFinishDate").value;var b=document.getElementById("editStatus").value;d="id="+rowToEdit.myRow.content[0];d+="&start="+URLEncode(c);d+="&finish="+URLEncode(e);d+="&status="+b;var a=myServerAddress+"MyXMLDispatcher?rand="+g+"&path="+21140+"&method=updateJobSchedule";f.open("POST",a,true);f.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");f.setRequestHeader("Content-length",d.length);f.onreadystatechange=function(){if(f.readyState==4){if(f.status==200){var i=f.responseXML;var h=0;if(i==null){alert("Data Error")}else{var k=i.getElementsByTagName("status");h=systemStatus(null,k)}if(h==1){rowToEdit.myRow.content[1].data=c;rowToEdit.myRow.content[2].data=e;var j="";if(b=="0"){j="Planned"}else{if(b=="1"){j="Running"}else{if(b=="2"){j="Halted"}else{if(b=="3"){j="Finished"}else{j="Undefined"}}}}rowToEdit.myRow.content[3].data=j;rowToEdit.myRow.content[5]=b}else{if(h==2){alert("EDIT: System Error")}}jobPropertiesWindow.close()}else{alert("Connection Problem:"+f.statusText);jobPropertiesWindow.close()}closeSplashScreen()}};openSplashScreen();f.send(d)};var worksContainerDiv="blankHidden1";var worksInnerDivPrefix="worksInnerDivPrefix";var worksWindowIdPrefix="worksWindowIdPrefix";var INNER_TABLE_NAME_PREFIX="innerTableNamePrefix";var INNER_NAV_DIV_PREFIX="innerNavDivPrefix";var showWorkDone=function(){var a=contextMenu.srcElement;var b;while(true){b=a.parentNode;if(b.tagName!="TR"){a=b;continue}else{break}}if(b!=null&&b.myRow!=null&&b.myRow.content[4]=="plannedJobs"){rowToEdit=b;openWorksWindow(b.myRow.content[0])}else{return}};var openWorksWindow=function(b){var a="<div id='"+INNER_NAV_DIV_PREFIX+b+"'>Loading content for"+b+" , please wait...</div><div id='"+worksInnerDivPrefix+b+"' class='smallText'></div>";document.getElementById(worksContainerDiv).innerHTML=a;worksWindow=internalWindow.open(worksWindowIdPrefix+b,"div",worksContainerDiv,"Works for # "+b,"width=850px,height=500px,left=5px,top=5px,resize=1,scrolling=1");worksWindow.onclose=function(){if(calendarObjForForm.isVisible()){calendarObjForForm.hide()}return true};callShowWorksAjax(b)};var callShowWorksAjax=function(b){if(document.getElementById(INNER_NAV_DIV_PREFIX+b)==null){return}if(document.getElementById(worksInnerDivPrefix+b)==null){return}var d=getHTMLHTTPRequest();var c=parseInt(Math.random()*99999999);var a=myServerAddress+"MyXMLDispatcher?rand="+c+"&path="+21150+"&entryId="+b+"&controlEstimateId="+controlEstimateId+"&method=getWorksList";d.open("GET",a,true);d.onreadystatechange=function(){if(d.readyState==4){if(d.status==200){renderWorks(d)}else{alert("Connection Problem:"+d.statusText)}}};d.send(null)};var renderWorks=function(g){var d=g.responseXML;if(d==null){alert("Data Error");return}var e=d.getElementsByTagName("status");var c=d.getElementsByTagName("entry");var b=0;if(c!=null&&c.length>0){b=c[0].getAttribute("id");var h=document.getElementById(worksInnerDivPrefix+b);h.setAttribute("entryRef",b);var f="<table width='97%' class='innerContentTable' id='"+INNER_TABLE_NAME_PREFIX+b+"'><thead id='WORKTHEAD"+b+"'><tr><td width='16px'>&nbsp;</td><td width='16px'>Sl</td><td width='20%'>Description</td><td>Numbers</td><td>Length</td><td>Breadth</td><td>Height</td><td>Weight</td><td width='7%'>Started</td><td width='7%'>Finished</td><td align='right'>Total</td><td>D</td></tr></thead><tbody id='WORKTBODY"+b+"'></tbody></table>";h.innerHTML=f;contextMenu.attachTo("WORKTHEAD"+b,menu2());contextMenu.attachTo("WORKTBODY"+b,menu2());updateWorksNav(d,INNER_NAV_DIV_PREFIX,INNER_TABLE_NAME_PREFIX,b);populateWorksTable(d,INNER_TABLE_NAME_PREFIX,b);addTableRolloverEffect(INNER_TABLE_NAME_PREFIX+b,"tableRollOverEffect1","tableRowClickEffect1")}else{var a=systemStatus(null,e);if(a==0){return}}};var updateWorksNav=function(c,e,a,b){var d="<table class='innerNavTable'><tr>";d+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='addNewWorkBox(\""+a+'",'+b+");'>Add New</a></td>";d+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteWorksChecked(\""+a+b+"\");'>Delete[D]</a></td>";d+="</tr></table>";document.getElementById(e+b).innerHTML=d};var populateWorksTable=function(j,f,b){var g=f+b;var e=j.getElementsByTagName("works");for(var d=0;d<e.length;d++){var c=document.getElementById(g);var h=c.tBodies[0].rows.length;var a=Array();a[0]=e[d].childNodes[0].firstChild.data;a[1]=e[d].childNodes[2].firstChild.data;a[2]=e[d].childNodes[3].firstChild.data;a[3]=e[d].childNodes[4].firstChild.data;a[4]=e[d].childNodes[5].firstChild.data;a[5]=e[d].childNodes[6].firstChild.data;a[6]=e[d].childNodes[7].firstChild.data;a[7]=e[d].childNodes[8].firstChild.data;a[8]=e[d].childNodes[1].firstChild.data;a[9]=e[d].childNodes[9].firstChild.data;a[10]=e[d].childNodes[10].firstChild.data;addRowToTable3(c,h,a)}};var addRowToTable3=function(g,n,l){var v=g.tBodies[0].rows.length;var b=v+ROW_BASE;if(n==-1){n=v}else{b=n+ROW_BASE}var k=g.tBodies[0].insertRow(n);var d=Array();d[0]=k.insertCell(0);d[0].innerHTML="<img src='images/project/job.gif' border='0'>";d[1]=k.insertCell(1);var c=document.createTextNode(b);d[1].appendChild(c);d[2]=k.insertCell(2);var s=getTextBox(20,l[1]);s.style.display="none";var x=document.createTextNode(l[1]);d[2].appendChild(s);d[2].appendChild(x);d[3]=k.insertCell(3);var w=getTextBox(10,l[2]);w.style.display="none";var m=document.createTextNode(l[2]);d[3].appendChild(w);d[3].appendChild(m);d[4]=k.insertCell(4);var i=getTextBox(10,l[3]);i.style.display="none";var e=document.createTextNode(l[3]);d[4].appendChild(i);d[4].appendChild(e);d[5]=k.insertCell(5);var o=getTextBox(10,l[4]);o.style.display="none";var q=document.createTextNode(l[4]);d[5].appendChild(o);d[5].appendChild(q);d[6]=k.insertCell(6);var B=getTextBox(10,l[5]);B.style.display="none";var r=document.createTextNode(l[5]);d[6].appendChild(B);d[6].appendChild(r);d[7]=k.insertCell(7);var A=getTextBox(10,l[6]);A.style.display="none";var p=document.createTextNode(l[6]);d[7].appendChild(A);d[7].appendChild(p);d[8]=k.insertCell(8);var j=getTextBox(10,l[9]);j.style.display="none";var f=document.createTextNode(l[9]);d[8].appendChild(j);d[8].appendChild(f);d[9]=k.insertCell(9);var t=getTextBox(10,l[10]);t.style.display="none";var u=document.createTextNode(l[10]);d[9].appendChild(t);d[9].appendChild(u);d[10]=k.insertCell(10);d[10].setAttribute("align","right");var z=document.createTextNode(l[7]);d[10].appendChild(z);d[11]=k.insertCell(11);var y=document.createElement("input");y.setAttribute("type","checkbox");d[11].appendChild(y);var h=Array();h[0]=y;h[1]=0;h[2]=d[0].innerHTML;h[3]=c;h[4]=x;h[5]=s;h[6]=m;h[7]=w;h[8]=e;h[9]=i;h[10]=q;h[11]=o;h[12]=r;h[13]=B;h[14]=p;h[15]=A;h[16]=f;h[17]=j;h[18]=u;h[19]=t;h[20]=z;h[21]=l[0];h[22]=l[8];var a=new myRowObject(h);k.myRow=a};var getTextBox=function(b,c){var a=document.createElement("input");a.setAttribute("type","text");a.setAttribute("size",b);a.setAttribute("value",c);return a};function callDeleteWorksAjax(g,f,c){if(!confirmDelete()){return}var e=getHTMLHTTPRequest();var d=parseInt(Math.random()*99999999);var h="";for(var b=0;b<f.length;b++){if(b==0){h+=f[b].myRow.content[21]}else{h+=","+f[b].myRow.content[21]}}var a=myServerAddress+"MyXMLDispatcher?rand="+d+"&path="+21160+"&id="+URLEncode(h)+"&method=deleteSelectedWorks";e.open("GET",a,true);e.onreadystatechange=function(){if(e.readyState==4){if(e.status==200){var j=e.responseXML;var i=0;if(j==null){alert("Data Error")}else{var k=j.getElementsByTagName("status");i=systemStatus(null,k)}if(i==1){deleteWorkRows(f);reorderWorkRows(g,c)}else{if(i==2){alert("DELETE: System Error")}}}else{alert("Connection Problem:"+e.statusText)}closeSplashScreen()}};openSplashScreen();e.send(null)}var getWorksChecked=function(d){var e=document.getElementById(d);var a=new Array();var b=0;for(var c=0;c<e.tBodies[0].rows.length;c++){if(e.tBodies[0].rows[c].myRow.content[0].checked){a[b]=e.tBodies[0].rows[c];b++}}return a};var deleteWorksChecked=function(d){var f=document.getElementById(d);var a=new Array();var b=0;for(var c=0;c<f.tBodies[0].rows.length;c++){if(f.tBodies[0].rows[c].myRow.content[0].checked){a[b]=f.tBodies[0].rows[c];b++}}if(a.length>0){var e=a[0].sectionRowIndex;callDeleteWorksAjax(f,a,e)}};var deleteWorkRows=function(c){for(var a=0;a<c.length;a++){var b=c[a].sectionRowIndex;c[a].parentNode.deleteRow(b)}};var reorderWorkRows=function(d,c){if(d.tBodies[0].rows[c]){var b=c+ROW_BASE;for(var a=c;a<d.tBodies[0].rows.length;a++){d.tBodies[0].rows[a].myRow.content[3].data=b;b++}}};var deleteContextWorksChecked=function(){var a=new Array();var b=contextMenu.srcElement;while(true){a[0]=b.parentNode;if(a[0].tagName!="TR"){b=a[0];continue}else{break}}var d=a[0].parentNode.parentNode;var c=a[0].sectionRowIndex;callDeleteWorksAjax(d,a,c)};var addContextWorksBox=function(){var a=contextMenu.srcElement;var d;while(true){d=a.parentNode;if(d.tagName!="TR"){a=d;continue}else{break}}var c=d.parentNode.parentNode;var e=c.parentNode;var b=e.getAttribute("entryRef");addNewWorkBox(INNER_TABLE_NAME_PREFIX,b)};var addNewWorkBox=function(p,e){var h=document.getElementById(p+e);var x=h.tBodies[0].rows.length;var n=0;var b=n+ROW_BASE;var l=h.tBodies[0].insertRow(n);var d=Array();d[0]=l.insertCell(0);d[0].innerHTML="<a href='javascript:void(0);' onclick='addNewWork(event,"+e+",\"add\");'><img src='images/common/tick.gif' border='0'></a>";d[1]=l.insertCell(1);var c=document.createTextNode(b);d[1].innerHTML="<a href='javascript:void(0);' onclick='addNewWork(event,"+e+",\"discard\");'><img src='images/common/cross.gif' border='0'></a>";d[2]=l.insertCell(2);var u=getTextBox(20,"-");var z=document.createTextNode("");d[2].appendChild(u);d[2].appendChild(z);d[3]=l.insertCell(3);var y=getTextBox(10,"-");var m=document.createTextNode("");d[3].appendChild(y);d[3].appendChild(m);d[4]=l.insertCell(4);var j=getTextBox(8,"-");var f=document.createTextNode("");d[4].appendChild(j);d[4].appendChild(f);d[5]=l.insertCell(5);var o=getTextBox(8,"-");var s=document.createTextNode("");d[5].appendChild(o);d[5].appendChild(s);d[6]=l.insertCell(6);var H=getTextBox(8,"-");var t=document.createTextNode("");d[6].appendChild(H);d[6].appendChild(t);d[7]=l.insertCell(7);var G=getTextBox(8,"-");var r=document.createTextNode("");d[7].appendChild(G);d[7].appendChild(r);var B=new Date();var E=B.getMonth()+1;var A=B.getDate();var q=B.getFullYear();var D=((A<10?"0"+A:""+A)+"/"+(E<10?"0"+E:""+E)+"/"+q);d[8]=l.insertCell(8);var k=getTextBox(8,D);k.readOnly=true;k.onclick=new Function("pickDate(this,this,-120);");var g=document.createTextNode("");d[8].appendChild(k);d[8].appendChild(g);d[9]=l.insertCell(9);var v=getTextBox(8,D);v.readOnly=true;v.onclick=new Function("pickDate(this,this,-120);");var w=document.createTextNode("");d[9].appendChild(v);d[9].appendChild(w);d[10]=l.insertCell(10);d[10].setAttribute("align","right");var F=document.createTextNode("-");d[10].appendChild(F);d[11]=l.insertCell(11);var C=document.createElement("input");C.setAttribute("type","checkbox");C.disabled=true;d[11].appendChild(C);var i=Array();i[0]=C;i[1]=0;i[2]=d[0].innerHTML;i[3]=c;i[4]=z;i[5]=u;i[6]=m;i[7]=y;i[8]=f;i[9]=j;i[10]=s;i[11]=o;i[12]=t;i[13]=H;i[14]=r;i[15]=G;i[16]=g;i[17]=k;i[18]=w;i[19]=v;i[20]=F;i[21]=0;i[22]=e;var a=new myRowObject(i);l.myRow=a;addRowRolloverEffect(l)};var addNewWork=function(s,c,q){var t=s;var i;var g;if(t.target){i=t.target.parentNode.parentNode.parentNode}else{if(t.srcElement){i=t.srcElement.parentNode.parentNode.parentNode}}var j=i.sectionRowIndex;g=i.parentNode.parentNode;if(q=="discard"){discardRowsArray=Array();discardRowsArray[0]=g.tBodies[0].rows[j];deleteWorkRows(discardRowsArray)}else{if(q=="add"){var r=getHTMLHTTPRequest();var a=parseInt(Math.random()*99999999);var p=URLEncode(i.myRow.content[5].value);var b=URLEncode(i.myRow.content[7].value);var d=URLEncode(i.myRow.content[9].value);var l=URLEncode(i.myRow.content[11].value);var n=URLEncode(i.myRow.content[13].value);var k=URLEncode(i.myRow.content[15].value);var h=URLEncode(i.myRow.content[17].value);var o=URLEncode(i.myRow.content[19].value);var m="entryId="+c;m+="&description="+p;m+="&number="+b;m+="&length="+d;m+="&breadth="+l;m+="&height="+n;m+="&weight="+k;m+="&start="+h;m+="&finish="+o;m+="&controlEstimateId="+controlEstimateId;var f=myServerAddress+"MyXMLDispatcher?rand="+a+"&path="+21170+"&method=addNewWork";r.open("POST",f,true);r.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");r.setRequestHeader("Content-length",r.length);r.onreadystatechange=function(){if(r.readyState==4){if(r.status==200){var x=r.responseXML;var e=0;if(x==null){alert("Data Error")}else{var y=x.getElementsByTagName("status");e=systemStatus(null,y)}if(e==1){var u=x.getElementsByTagName("key")[0].getAttribute("value");var w=x.getElementsByTagName("key")[0].getAttribute("total");i.myRow.content[4].data=i.myRow.content[5].value;i.myRow.content[6].data=i.myRow.content[7].value;i.myRow.content[8].data=i.myRow.content[9].value;i.myRow.content[10].data=i.myRow.content[11].value;i.myRow.content[12].data=i.myRow.content[13].value;i.myRow.content[14].data=i.myRow.content[15].value;i.myRow.content[16].data=i.myRow.content[17].value;i.myRow.content[18].data=i.myRow.content[19].value;i.myRow.content[20].data=""+w;i.myRow.content[21]=""+u;i.myRow.content[22]=""+c;for(var v=5;v<=19;v+=2){i.myRow.content[v].style.display="none"}i.cells[0].innerHTML="";i.cells[0].innerHTML="<img src='images/common/url.gif' border='0'>";i.myRow.content[2]=i.cells[0].innerHTML;i.cells[1].innerHTML="";i.cells[1].appendChild(i.myRow.content[3]);i.myRow.content[0].disabled=false}else{if(e==2){alert("ADD: System Error")}}}else{alert("Connection Problem:"+r.statusText)}reorderWorkRows(g,0);closeSplashScreen()}};openSplashScreen();r.send(m)}}};