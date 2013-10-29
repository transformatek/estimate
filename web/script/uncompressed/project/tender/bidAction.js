/**********************************************************
 * Creates basic routines for Preparation of vendor Quotations
 * Copyright (C) 2010, 2011  Amit Kumar(amitkriit@gmail.com)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 ***********************************************************/
/*
 * Global vars
 */
//var estimateId;
var bidderTableparent=1;	//Up one level
var bidderTableTop=1;		//Top Level
var bidderTableCurrentParent=1;			//parent of current level(Estimate ID)
var bidderTablecontainer="blankContent";	//this DIV will contain our bill
//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="bidderSample";			//Should be named in HTML
var DIV_NAV_NAME="bidderNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="BIDDER_TTHEAD123";				
var ctx_TBODY="BIDDER_TTBODY123";
var currentTenderId=0;					//Save Tender ID for future reference
/*
 * For Search in CONTACTS sub-window
 */
var key1='qwerty';
var searchFlag1=false;
/* ============================================================= */
/*
 * Context Menu Items
 */
//Tender document for which the bid-window has been opened
var currentTenderDocId=0;
//DHTMLSuite.commonObj.setCssCacheStatus(false);
//Init Context Menu Object; One object for current page
var contextMenu=null;
contextMenu = new DHTMLSuite.contextMenu();
//DHTMLSuite.commonObj.setCssCacheStatus(false);
contextMenu.setWidth(140);


/* ============================================================= */


var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			callBidderAjax(currentTenderDocId);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeBidderTable=function(id,tenderId)
{
	myCurrentMenuParent=id;
	writeWaitMsg(bidderTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");
	currentTenderDocId=tenderId;
	callContextMenuAjax(id, callBack);
};
var menu2=function()
{
	return configureContextMenuModel();
};

contextMenu.modifyMenu=function() {
	var srcObj=this.srcElement;
	currentMenuBar=this.menuBar;
	var tmp;
	while(true)
	{
		tmp=srcObj.parentNode;
		if(tmp.tagName!="TR") {
			srcObj=tmp;
			continue;
		}
		else break;
	}
	clickOnTableRowContext(tmp);
	//TR->TBODY/THEAD->TABLE
	var tbl=tmp.parentNode.parentNode;
	var div=tbl.parentNode;
	
	if(tmp.myRow==null) {
		setMenuItemState(213620,'disabled');
		setMenuItemState(213630,'disabled');
	}
	else {
		setMenuItemState(213620,'regular');
		setMenuItemState(213630,'regular');
	}
	//Impose Menu Permissions
	setMenuPermissions(currentMenuBar);
};
/**********************************************************/
/*
 * Ajax call to populate Bidders List at level $id$
 */
function callBidderAjax(tenderId) {
	currentTenderId=tenderId;
	if(document.getElementById(bidderTablecontainer)==null)
		return;
	if(document.getElementById(bidderTablecontainer)==null) return;
	var myBidderRequest=getHTMLHTTPRequest();
	bidderTableCurrentParent=tenderId;
	
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+23020+"&tenderId="+tenderId+"&method="+"get";
	myBidderRequest.open("GET",url,true);
	myBidderRequest.onreadystatechange=function()
	{
		if(myBidderRequest.readyState==4) {
			if(myBidderRequest.status==200) {
				renderBidders(myBidderRequest);
			}
			else {
				alert("Connection Problem:"+myBidderRequest.statusText);
			}
		}
	};
	writeWaitMsg(bidderTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myBidderRequest.send(null);
}


function renderBidders(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(bidderTablecontainer,systemMsg);
	if(errorFlag==0) return;
	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='100%'>Description</td><td>D</td><td>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(bidderTablecontainer).innerHTML=str;
	//Update the bill navigation bar
	updateBidderNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
}
/*
 * Update navigation bar for Bidder Table according to current level
 */
var updateBidderNav=function (xmlDoc,element) {
	var str="<table class='innerNavTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initContactsWin(\""+TABLE_NAME+"\");'>Add Bidder</a></td>";
	//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myBillEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='openQuotationWin(\""+TABLE_NAME+"\");'>Prepare Quotation[E]</a></td>";
	str+="<td>Filter: <input name='filter' onKeyUp='filter(this, \""+TABLE_NAME+"\")' type='text'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("bidder");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;	//Contact ID
		param[1]=content[i].childNodes[1].firstChild.data;	//Name
		param[2]=content[i].childNodes[2].firstChild.data;	//Description
		param[3]=content[i].childNodes[3].firstChild.data;	//Bidder ID
		addRowToTable1(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
};

/**********************************************************/
/*
 * Table Manipulation functions
 * This object stores all row elements for reference
 */
var myRowObject=function (content) {
	this.content=Array();
	for(var i=0;i<content.length;i++)
	{
		this.content[i]=content[i];
	}
};

/*
 * Filters Table rows for phrase
 */
function filter (phrase, _id){
	var words = phrase.value.toLowerCase().split(" ");
	var table = document.getElementById(_id);
	//alert(_id);
	var ele;
	for (var r = 0; r < table.tBodies[0].rows.length; r++){
		ele = table.tBodies[0].rows[r].innerHTML.replace(/<[^>]+>/g,"");
	        var displayStyle = 'none';
	        for (var i = 0; i < words.length; i++) {
		    if (ele.toLowerCase().indexOf(words[i])>=0)
			displayStyle = '';
		    else {
			displayStyle = 'none';
			break;
		    }
	        }
		table.tBodies[0].rows[r].style.display = displayStyle;
	}
}


/*
 * add a new row at index $num$ using params $param$ into table $tbl$
 */
var addRowToTable1=function (tbl,num,param) {
	var nextRow = tbl.tBodies[0].rows.length;
	var iteration = nextRow + ROW_BASE;
	if(num==-1) {
		num = nextRow;
	}
	else {
		iteration = num + ROW_BASE;
	}

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	row.className='styleB'+(iteration % 2);
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	cell[0].innerHTML="<img src='images/project/tender/bidders1.png' border='0'>";

	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: Name
	cell[2]=row.insertCell(2);
	var name=document.createTextNode(param[1]);
	cell[2].appendChild(name);

	//Cell3: Description
	cell[3]=row.insertCell(3);
	var description=document.createTextNode(param[2]);
	cell[3].appendChild(description);

	//Cell8: Checkbox
	cell[4]=row.insertCell(4);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[4].appendChild(checkBox);

	//cell9:Radio Button
	cell[5] = row.insertCell(5);
	var radio;
	try {
		radio = document.createElement('<input type="radio" name="' + RADIO_NAME + '" value="' + iteration + '">');
		var failIfNotIE = radio.name.length;
	} catch(ex) {
		radio = document.createElement('input');
		radio.setAttribute('type', 'radio');
		radio.setAttribute('name', RADIO_NAME);
		radio.setAttribute('value', iteration);
	}
	cell[5].appendChild(radio);

	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=radio;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	rowContents[4]=name;
	rowContents[5]=description;
	rowContents[6]=param[0];			//ID
	rowContents[7]=param[3];			//VENDOR ID
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Items Asynchronously using Ajax
 */

function callDeleteBidderAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myDelTable;
	var myDelRowsArray=Array();
	var myDelrIndex;
	var myBidderDeleteRequest=getHTMLHTTPRequest();
	myDelTable=tbl;
	myDelRowsArray=obj;
	myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	for(var i=0; i<obj.length; i++) {
		if(i==0) {
			id+=obj[i].myRow.content[7];
		}
		else
			id+=","+obj[i].myRow.content[7];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+23030+"&id="+id+"&method="+"delete";
	myBidderDeleteRequest.open("GET",url,true);
	myBidderDeleteRequest.onreadystatechange=function()
	{
		if(myBidderDeleteRequest.readyState==4) {
			if(myBidderDeleteRequest.status==200) {
				var xmlDoc=myBidderDeleteRequest.responseXML;
				var statusFlag=0;
				if(xmlDoc==null) {alert("Data Error");}
				else
				{
					var systemMsg=xmlDoc.getElementsByTagName("status");
					statusFlag=systemStatus(null,systemMsg);
				}
				if(statusFlag==1) {
					deleteRows(myDelRowsArray);
					reorderRows(myDelTable, myDelrIndex);
				}
				else if(statusFlag==2) {
					alert("DELETE: System Error");
				}
			}
			else {
				alert("Connection Problem:"+myBidderDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myBidderDeleteRequest.send(null);
}


/*
 * deletes checked rows
 */
var deleteChecked=function (tblId) {
	var tbl=document.getElementById(tblId);
	var checkedObjArray = new Array();
	var cCount = 0;

	for (var i=0; i<tbl.tBodies[0].rows.length; i++)
	{
		if(tbl.tBodies[0].rows[i].myRow.content[0].checked) {
			checkedObjArray[cCount] = tbl.tBodies[0].rows[i];
			//tbl.tBodies[0].rows[i].myRow.content[0].checked=false;
			cCount++;
		}
	}
	if (checkedObjArray.length > 0) {
		var rIndex = checkedObjArray[0].sectionRowIndex;
		callDeleteBidderAjax(tbl,checkedObjArray,rIndex);
	}
};

var deleteRows=function (rowObjArray) {
	for (var i=0; i<rowObjArray.length; i++) {
		var rIndex = rowObjArray[i].sectionRowIndex;
		rowObjArray[i].parentNode.deleteRow(rIndex);
	}
};

var reorderRows=function (tbl, startingIndex) {
	if (tbl.tBodies[0].rows[startingIndex]) {
		var count = startingIndex + ROW_BASE;
		for (var i=startingIndex; i<tbl.tBodies[0].rows.length; i++) {
			tbl.tBodies[0].rows[i].myRow.content[3].data = count; // text
			count++;
		}
	}
};

/*
 * this will be called from context menu
 */
var deleteContextChecked=function () {
	var checkedObjArray = new Array();
	var srcObj=contextMenu.srcElement;
	while(true)
	{
		checkedObjArray[0]=srcObj.parentNode;
		if(checkedObjArray[0].tagName!="TR") {
			srcObj=checkedObjArray[0];
			continue;
		}
		else break;
	}
	var tbl=checkedObjArray[0].parentNode.parentNode;
	var rIndex = checkedObjArray[0].sectionRowIndex;
	callDeleteBidderAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Add new Contact to Bidders List, open Assembly selection window
 */

//var asmBillId;
var contactManagerContainer="blankHidden1";	//Main div containing the DHTML window
var ContactOptionsContainer='contactOptions';			//Contains link to assembly/item menu
var ContactInnnerContainer="innerCONTACTContainer";		//Main inner window
var contactOptionsWindow;
var contactOptionsWindowId="contactOptionsWindowId";

var CONTACT_INNER_TABLE_NAME="contactInnerSample";			//Should be named in HTML
var CONTACT_INNER_DIV_NAV_NAME="contactInnerNavDiv";		//Navigation Bar
var biddersTable;
var initContactsWin=function(tableName) {
	biddersTable=tableName;
	var div=document.getElementById(contactManagerContainer);
	div.innerHTML="<div id='"+ContactInnnerContainer+"' class='smallText'>Loading.....</div>";
	openAssemblyOptionsWindow();
};

var openAssemblyOptionsWindow=function() {
	contactOptionsWindow=internalWindow.open(contactOptionsWindowId, 'div', contactManagerContainer, 'Add Bidder', 'width=600px,height=400px,left=5px,top=5px,resize=1,scrolling=1');
	openContactTable();
};

/*
 * Open Contacts Window for adding new Bidders to the tender
 */

var contCatTableparent=1;	//Up one level
var contCatTableTop=1;		//Top Level
var contCatTableCurrentParent=1;			//parent of current level
var contCatTablecontainer=ContactInnnerContainer;	//this DIV will contain our contCat

var openContactTable=function() {
	callContCatAjax(1);
};

/*
 * Ajax call to populate assembly at level $id$
 */

function callContCatAjax(id) {
	if(document.getElementById(contCatTablecontainer)==null) return;
	var myContCatRequest=getHTMLHTTPRequest();
	contCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+23040+"&parent="+id+"&method="+"get";
	myContCatRequest.open("GET",url,true);
	myContCatRequest.onreadystatechange=function()
	{
		if(myContCatRequest.readyState==4) {
			if(myContCatRequest.status==200) {
				renderContCat(myContCatRequest);
			}
			else {
				alert("Connection Problem:"+myContCatRequest.statusText);
			}
		}
	};
	writeWaitMsg(contCatTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myContCatRequest.send(null);
}


function renderContCat(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(contCatTablecontainer,systemMsg);
	if(errorFlag==0) return;
	
	var str="";
	str+="<div id='"+CONTACT_INNER_DIV_NAV_NAME+"'></div>";
	str+="<table id='"+CONTACT_INNER_TABLE_NAME+"' width='100%' class='contentTable'><thead id='CONTTHEAD'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='45%'>Description</td><td width='15%'>Address</td><td width='15%'>Number</td><td>-</td></thead>";
	str+="<tbody id='CONTTTBODY'></tbody></table>";
	document.getElementById(contCatTablecontainer).innerHTML=str;
	//Update the contCat navigation bar
	updateContCatNav(xmlDoc,CONTACT_INNER_DIV_NAV_NAME);
	populateContactsTable(xmlDoc,CONTACT_INNER_TABLE_NAME);
	addTableRolloverEffect(CONTACT_INNER_TABLE_NAME,'tableRollOverEffect2','tableRowClickEffect2');
	//contextMenu.attachTo(ctx_THEAD,menu2());
	//contextMenu.attachTo(ctx_TBODY,menu2());
}

/*
 * Update navigation bar for ContCat Table according to current level
 */
var updateContCatNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		contCatTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callContCatAjax("+contCatTableparent+")'><img src='images/utilities/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callContCatAjax("+contCatTableTop+")'><img src='images/utilities/top.png' border='0' alt='Top level'></a></td>";
	}
	else if(searchFlag1==false)
	{
		str+="<td><img src='images/utilities/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/utilities/top1.png' alt='Top level'></td>";
		searchFlag1=false;
		contCatTableparent=1;
	}
	else
	{
		str+="<td><img src='images/utilities/up1.png' alt='Up one level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callContCatAjax("+contCatTableTop+")'><img src='images/utilities/top.png' border='0' alt='Top level'></a></td>";
		contCatTableparent=1;
		searchFlag1=false;
	}
	str+="<td><label>Enter keyword:</label></td><td><input size='40' type='text' id='searchKeyForContact' value=''></td><td><input type='button' value='GO' onclick='vaildateKey2();'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateContactsTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("contactCat");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="contactCat";		//Row type is contCat
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToTable2(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("contact");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="contact";		//Row type is contCat
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		param[6]=content[i].childNodes[5].firstChild.data;
		param[7]=content[i].childNodes[6].firstChild.data;
		param[8]=content[i].childNodes[7].firstChild.data;
		param[9]=content[i].childNodes[8].firstChild.data;
		addRowToTable2(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
};

/*
 * add a new row at index $num$ using params $param$ into table $tbl$
 */
var addRowToTable2=function (tbl,num,param) {
	var nextRow = tbl.tBodies[0].rows.length;
	var iteration = nextRow + ROW_BASE;
	if(num==-1) {
		num = nextRow;
	}
	else {
		iteration = num + ROW_BASE;
	}

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	if(param[0]=="contactCat")
		row.className='classContCat';
	else
		row.className='classContact';
	
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[0]=="contactCat")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callContCatAjax("+param[1]+")'><img src='images/utilities/folder.gif' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick=''><img src='images/utilities/contact.png' border='0'></a>";
	cell[0].className='iconCbImage';
	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: Name
	cell[2]=row.insertCell(2);
	var name=document.createTextNode(param[2]);
	cell[2].appendChild(name);

	//Cell3: Description
	cell[3]=row.insertCell(3);
	var description=document.createTextNode(param[3]);
	cell[3].appendChild(description);

	//Cell4: Address
	cell[4]=row.insertCell(4);
	var address;
	if(param[0]=="contactCat")
		address=document.createTextNode("--");
	else
		address=document.createTextNode(param[4]);
	cell[4].appendChild(address);
	
	//Cell4: Number
	cell[5]=row.insertCell(5);
	var number;
	if(param[0]=="contactCat")
		number=document.createTextNode("--");
	else
		number=document.createTextNode(param[5]);
	cell[5].appendChild(number);
	
	//Cell6: Image
	cell[6] = row.insertCell(6);
	cell[6].className='classAedit';
	if(param[0]=="contactCat")
		cell[6].innerHTML="&nbsp;&nbsp;&nbsp;";
	else
		cell[6].innerHTML="<a href='javascript:void(0);' onclick='callAddBidderAjax(\""+tbl.getAttribute("id")+"\","+row.sectionRowIndex+");'><img src='images/common/tick.gif' border='0'></a>";

	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=0;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	rowContents[4]=name;
	rowContents[5]=description;
	rowContents[6]=param[1];			//ID
	rowContents[7]=param[0];			//Type
	if(param[0]=="contactCat")
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	else
	{
		rowContents[8]=param[8];	//Remarks
		rowContents[9]=param[9];	//Parent
		rowContents[10]=address;	
		rowContents[11]=number;	    
		rowContents[12]=param[6];	//website
		rowContents[13]=param[7];	//email
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};



var myBidderAddRequest=getHTMLHTTPRequest();
var myBidderTable;
var myBidderRow;
var callAddBidderAjax=function(tableName,rowNum) {
	var myBidderTable=document.getElementById(tableName);
	var row=myBidderTable.tBodies[0].rows[rowNum];
	var id=row.myRow.content[6];
	myBidderRow=row;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+23050+"&contactId="+id+"&tenderId="+currentTenderId+"&method="+"addBidderToTender";
	//alert(url);
	myBidderAddRequest.open("GET",url,true);
	myBidderAddRequest.onreadystatechange=addBidderToTenderAction;
	openSplashScreen();
	myBidderAddRequest.send(null);
};

var addBidderToTenderAction=function() {
	if(myBidderAddRequest.readyState==4) {
		if(myBidderAddRequest.status==200) {
			var xmlDoc=myBidderAddRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				var newId=xmlDoc.getElementsByTagName("key")[0].getAttribute("value");
				var param=Array();
								
				param[0]=myBidderRow.myRow.content[6];			//CONTACT ID
				param[1]=myBidderRow.myRow.content[4].data;		//Name
				param[2]=myBidderRow.myRow.content[5].data;		//Description
				param[3]=""+newId;								//BIDDER ID
				
				addRowToTable1(document.getElementById(TABLE_NAME),-1,param);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
		}
		else {
			alert("Connection Problem:"+myBidderAddRequest.statusText);
		}
		closeSplashScreen();
	}
};
/**************** Search in Contacts Sub-Window **********************************/
function vaildateKey2()
{
    key1=document.getElementById('searchKeyForContact').value;
	if(key1.length<3){
		alert("Enter Minimum 3 Character");
	return;
	}else{
		callSearchContactsAjax();
		//alert(key1);
	}
}

function callSearchContactsAjax(id) {
	if(document.getElementById(contCatTablecontainer)==null) return;
	var myContCatRequest=getHTMLHTTPRequest();
	contCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key1);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+23040+"&key="+searchString+"&method="+"get";
	myContCatRequest.open("GET",url,true);
	myContCatRequest.onreadystatechange=function()
	{
		if(myContCatRequest.readyState==4) {
			if(myContCatRequest.status==200) {
				searchFlag1=true;
				renderContCat(myContCatRequest);
			}
			else {
				alert("Connection Problem:"+myContCatRequest.statusText);
			}
		}
	};
	writeWaitMsg(contCatTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myContCatRequest.send(null);
}

/*********************************************************************************/
/*
 * Manage Quotations
 */

var quoteContainerDiv="blankHidden4";
var quoteInnerDivPrefix="quoteInnerDivPrefix";
var quoteWindowIdPrefix="quoteWindowIdPrefix";
var INNER_TABLE_NAME_QUOTE_PREFIX="innerTableNameQuotePrefix";
var INNER_QUOTATION_NAV_DIV_PREFIX="innerQuotationNavDivPrefix";
var currentBidderIdForQuotation=0;

var openQuotationWin=function(tblId) {
	
	var tbl=document.getElementById(tblId);
	var indexOfBidderRow=-1;
	var rowOfBidder=null;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow && tbl.tBodies[0].rows[i].myRow.content[1].getAttribute('type') == 'radio' && tbl.tBodies[0].rows[i].myRow.content[1].checked) {
			indexOfBidderRow=i;
			rowOfBidder=tbl.tBodies[0].rows[i];	//Global Scope
		}
	}

	if(rowOfBidder!=null)
	{
		var tenderId=currentTenderId;
		var bidderName=rowOfBidder.myRow.content[4].data;
		var bidderId=rowOfBidder.myRow.content[7];
		currentBidderIdForQuotation=bidderId;
		var innerStr="<div id='"+INNER_QUOTATION_NAV_DIV_PREFIX+"'>Loading content, please wait...</div><div id='"+quoteInnerDivPrefix+"' class='smallText'></div>";
		document.getElementById(quoteContainerDiv).innerHTML=innerStr;
		internalWindow.open(quoteWindowIdPrefix, 'div', quoteContainerDiv, 'Quote for #'+bidderName, 'width=850px,height=500px,left=5px,top=5px,resize=1,scrolling=1');
		callShowQuoteAjax(bidderId,tenderId);
	}
	//populateCbCatEditWin();
	//callShowQuoteAjax(conTenderId,tenderId);
};

var openContextQuotationWin=function() {
	indexOfBidderRow=-1;
	rowOfBidder=null;
	var srcObj=contextMenu.srcElement;
	while(true)
	{
		rowOfBidder=srcObj.parentNode;
		if(rowOfBidder.tagName!="TR") {
			srcObj=rowOfBidder;
			continue;
		}
		else break;
	}
	if(rowOfBidder!=null)
	{
		var tenderId=currentTenderId;
		var bidderName=rowOfBidder.myRow.content[4].data;
		var bidderId=rowOfBidder.myRow.content[7];
		currentBidderIdForQuotation=bidderId;
		var innerStr="<div id='"+INNER_QUOTATION_NAV_DIV_PREFIX+"'>Loading content, please wait...</div><div id='"+quoteInnerDivPrefix+"' class='smallText'></div>";
		document.getElementById(quoteContainerDiv).innerHTML=innerStr;
		internalWindow.open(quoteWindowIdPrefix, 'div', quoteContainerDiv, 'Quote for #'+bidderName, 'width=850px,height=500px,left=5px,top=5px,resize=1,scrolling=1');
		callShowQuoteAjax(bidderId,tenderId);
	}
};

var callShowQuoteAjax=function(bidderId,tenderId) {
	//alert("BIDDER: "+bidderId+" TENDER: "+tenderId);
	
	if(document.getElementById(INNER_QUOTATION_NAV_DIV_PREFIX)==null) return;
	var myShowQuoteRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+23060+"&bidderId="+bidderId+"&tenderId="+tenderId+"&method="+"getQuotations";
	myShowQuoteRequest.open("GET",url,true);
	myShowQuoteRequest.onreadystatechange=function() {
		if(myShowQuoteRequest.readyState==4) {
			if(myShowQuoteRequest.status==200) {
				renderQuote(myShowQuoteRequest);
			}
			else {
				alert("Connection Problem:"+myShowQuoteRequest.statusText);
			}
		}
	};
	myShowQuoteRequest.send(null);
};

var renderQuote=function(myShowQuoteRequest) {
	var xmlDoc=myShowQuoteRequest.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	
	var consDiv=document.getElementById(quoteInnerDivPrefix);
	
    var str="<table width='97%' class='contentTable' id='"+INNER_TABLE_NAME_QUOTE_PREFIX+"'><thead><tr><td width='1%'>Sl</td><td width='10%'>Name</td><td width='30%'>Description</td><td width='10%'>Unit</td><td width='10%'>Price</td><td width='8%'>Premium</td><td width='13%'>Quantity</td><td width='5%'>Basis</td><td width='15%'>Quote Price</td><td>&nbsp;</td><td>&nbsp;</td></tr></thead><tbody></tbody></table>";
    consDiv.innerHTML=str;
	
	updateQuoteNav(xmlDoc,INNER_QUOTATION_NAV_DIV_PREFIX);
	populateQuoteTable(xmlDoc,INNER_TABLE_NAME_QUOTE_PREFIX);
	addTableRolloverEffect(INNER_TABLE_NAME_QUOTE_PREFIX,'tableRollOverEffect1','tableRowClickEffect1');
};

var updateQuoteNav=function(xmlDoc,divPrefix) {
	/*var str="<table class='innerNavTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initContractorWin("+TenId+");'>Add New</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteQuoteChecked(\""+tableNamePrefix+TenId+"\");'>Delete[D]</a></td>";
	str+="</tr></table>";*/
	var str="<table class='innerNavTable'><tr>";
	str+="<td>Filter: <input name='filter1' onKeyUp='filter(this, \""+INNER_TABLE_NAME_QUOTE_PREFIX+"\")' type='text'></td>";
	str+="</tr></table>";
	document.getElementById(divPrefix).innerHTML=str;
};

var populateQuoteTable=function(xmlDoc,tableNamePrefix){
	var tableName=tableNamePrefix;
	var content=xmlDoc.getElementsByTagName("quotation");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;
		param[1]=content[i].childNodes[1].firstChild.data;
		param[2]=content[i].childNodes[2].firstChild.data;
		param[3]=content[i].childNodes[3].firstChild.data;
		param[4]=content[i].childNodes[4].firstChild.data;
		param[5]=content[i].childNodes[5].firstChild.data;
		//param[6]=content[i].childNodes[6].firstChild.data;
		param[6]=content[i].childNodes[6].firstChild.data;
		param[7]=content[i].childNodes[7].firstChild.data;
		
		param[8]=content[i].childNodes[8].firstChild.data;
		param[9]=content[i].childNodes[9].firstChild.data;
		param[10]=content[i].childNodes[10].firstChild.data;
		addRowToTable5(tbl,rowToInsertAt,param);
		//reorderRows(tbl, rowToInsertAt);
	}
};

/*
 * add a new row at index $num$ using params $param$ into table $tbl$
 */
var addRowToTable5=function (tbl,num,param) {
	var nextRow = tbl.tBodies[0].rows.length;
	var iteration = nextRow + ROW_BASE;
	if(num==-1) {
		num = nextRow;
	}
	else {
		iteration = num + ROW_BASE;
	}

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	row.className='styleB'+(iteration % 2);
	
	var cell=Array();
	
	//Cell0: Sl No.
	cell[0]=row.insertCell(0);
	var slNo = document.createTextNode(iteration);
	cell[0].appendChild(slNo);

	//Cell1: Name
	cell[1]=row.insertCell(1);
	var name=document.createTextNode(param[1]);
	cell[1].appendChild(name);

	//Cell2: Description
	cell[2]=row.insertCell(2);
	var description=document.createTextNode(param[2]);
	cell[2].appendChild(description);

	//Cell3: unit
	cell[3]=row.insertCell(3);
	var unit=document.createTextNode(param[3]);
	cell[3].appendChild(unit);
	
	//Cell4: price
	cell[4]=row.insertCell(4);
	cell[4].setAttribute("align","right");
	var price=document.createTextNode(param[5]);
	cell[4].appendChild(price);
	
	//Cell5: premium
	cell[5]=row.insertCell(5);
	cell[5].setAttribute("align","right");
	var premium=document.createTextNode(param[6]);
	cell[5].appendChild(premium);
	
	//Cell6: quantity
	cell[6]=row.insertCell(6);
	var quantity=document.createTextNode(param[7]+" "+param[4]);
	cell[6].appendChild(quantity);
	
	//Cell7: basis
	cell[7]=row.insertCell(7);
	var basis="<select id='basis'>";
	basis+="<option value='0' "+(param[9]=='0'?"selected='selected'":"")+">Percent</option>";
	basis+="<option value='1' "+(param[9]=='1'?"selected='selected'":"")+">Price</option>";
	cell[7].innerHTML=basis;
	
	//Cell8: quote
	cell[8]=row.insertCell(8);
	var quote=document.createElement('input');
	quote.setAttribute('type', 'text');
	quote.setAttribute('size', '7');
	//quote.setAttribute('id', 'box'+param[0]);
	quote.setAttribute('value', param[10]);
	//quote.setAttribute('onkeypress', 'return maskKeyPress(event,'+row.sectionRowIndex+')');
	cell[8].appendChild(quote);
	var qspan=document.createElement('span');
	qspan.appendChild(document.createTextNode(param[10]));
	qspan.style.display='none';
	cell[8].appendChild(qspan);
	
	//Cell9: Image(Update)
	cell[9] = row.insertCell(9);
	cell[9].innerHTML="<a href='javascript:void(0);' onclick='callUpdateQuoteAjax(\""+row.sectionRowIndex+"\",\"update\")'><img src='images/common/tick.gif' border='0'></a>";
	
	//Cel10: Image(discard)
	cell[10] = row.insertCell(10);
	cell[10].innerHTML="<a href='javascript:void(0);' onclick='callUpdateQuoteAjax(\""+row.sectionRowIndex+"\",\"discard\")'><img src='images/common/cross.gif' border='0'></a>";
	
	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=slNo;
	rowContents[1]=name;
	rowContents[2]=description;
	rowContents[3]=unit;			
	rowContents[4]=price;	
	rowContents[5]=premium;
	rowContents[6]=quantity;	
	rowContents[7]=cell[7];	 //BASIS CELL
	rowContents[8]=quote;    //QUOTE
	rowContents[9]=qspan;    //HIDDEN SPAN for QUOTE
	rowContents[10]=param[9]; //BASIS FLAG
	rowContents[11]=param[8];//QUOTATION ID	    
	rowContents[12]=param[0];	//TENDER_ITEM_ID
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

/**********************************************************/
/*
 * Edit Quote for a bill item Asynchronously using Ajax
 */
var myUpdateQuoteRequest=getHTMLHTTPRequest();
var quotRowtoEdit;
var callUpdateQuoteAjax=function(row,flag) {
	var tbl=document.getElementById(INNER_TABLE_NAME_QUOTE_PREFIX);
	quotRowtoEdit=tbl.tBodies[0].rows[row];
	if(flag=='discard') {
		quotRowtoEdit.myRow.content[8].value=quotRowtoEdit.myRow.content[9].firstChild.data;
		var basis="<select id='basis'>";
		basis+="<option value='0' "+(quotRowtoEdit.myRow.content[10]=='0'?"selected='selected'":"")+">Percent</option>";
		basis+="<option value='1' "+(quotRowtoEdit.myRow.content[10]=='1'?"selected='selected'":"")+">Price</option>";
		quotRowtoEdit.myRow.content[7].innerHTML=basis;
		return;
	}
	
	var myRandom=parseInt(Math.random()*99999999);
	var url="";
	var itemId=quotRowtoEdit.myRow.content[12];
	var bidderId=currentBidderIdForQuotation;
	var quote=quotRowtoEdit.myRow.content[8].value;
	var basis=quotRowtoEdit.myRow.content[7].firstChild.value;
	//if(chk.checked)quote=quotRowtoEdit.myRow.content[13].firstChild.data;
	url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+23070+"&itemId="+itemId+"&bidderId="+bidderId+"&quote="+quote+"&basis="+basis+"&method="+"updateQuote"+"&flag="+flag;
	//alert(url);
	myUpdateQuoteRequest.open("GET",url,true);
	myUpdateQuoteRequest.onreadystatechange=updateQuoteAction;
	openSplashScreen();
	myUpdateQuoteRequest.send(null);
};

var updateQuoteAction=function() {
	if(myUpdateQuoteRequest.readyState==4) {
		if(myUpdateQuoteRequest.status==200) {
			var xmlDoc=myUpdateQuoteRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1)
			{
				var refreshValue=xmlDoc.getElementsByTagName("refreshValue");
				if(refreshValue!=null && refreshValue.length>0)
				{
					quotRowtoEdit.myRow.content[8].value=refreshValue[0].getAttribute("quote");
					quotRowtoEdit.myRow.content[9].firstChild.data=refreshValue[0].getAttribute("quote");
					quotRowtoEdit.myRow.content[10]=refreshValue[0].getAttribute("basis");
					var basis="<select id='basis'>";
					basis+="<option value='0' "+(quotRowtoEdit.myRow.content[10]=='0'?"selected='selected'":"")+">Percent</option>";
					basis+="<option value='1' "+(quotRowtoEdit.myRow.content[10]=='1'?"selected='selected'":"")+">Price</option>";
					quotRowtoEdit.myRow.content[7].innerHTML=basis;
					//return;
					
					//quotRowtoEdit.myRow.content[9].value=refreshValue[0].getAttribute("quote");
					//quotRowtoEdit.myRow.content[11].firstChild.data=quotRowtoEdit.myRow.content[9].value;
				}
			}
			else if(statusFlag==2)
			{
				alert("UPDATE: System Error");
			}
		}
		else {
			alert("Connection Problem:"+myUpdateQuoteRequest.statusText);
		}
		closeSplashScreen();
	}
};