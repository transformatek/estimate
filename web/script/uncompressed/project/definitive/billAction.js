/**********************************************************
 * Creates basic routines for Preparation of detailed cost-sheet
 * Copyright (C) 2009, 2010  Amit Kumar(amitkriit@gmail.com)
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
var billTableparent=1;	//Up one level
var billTableTop=1;		//Top Level
var billTableCurrentParent=1;			//parent of current level(Estimate ID)
var billTablecontainer="blankContent";	//this DIV will contain our bill
var costBookId=0;						//Currently used CostBook
//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="billSample";			//Should be named in HTML
var DIV_NAV_NAME="billNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="BILL_TTHEAD123";				
var ctx_TBODY="BILL_TTBODY123";

/*
 * For Search in Assembly sub-window
 */
var key1='qwerty';
var searchFlag1=false;
/* ============================================================= */
/*
 * Initializes Context Menu for Bill Window
 * and then populates the table
 */
//For Initialization, set in the jsp file
var currentEstimateId=0;
var currentCostBookId=0;
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
			callBillAjax(currentEstimateId,currentCostBookId);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeBillTable=function(id,estimateId,cbId)
{
	myCurrentMenuParent=id;
	writeWaitMsg(billTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");
	currentEstimateId=estimateId;
	currentCostBookId=cbId;
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
	//If context menu has been opened inside jobs sub window
	if(div.getAttribute("billRef")!=null && div.getAttribute("billRef")!="")
	{
		//alert(div.getAttribute("billRef"));
		hideMenuItem(211110);		//ADD ASSEMBLY
		hideMenuItem(211130);		//DELETE ASSEMBLY
		hideMenuItem(211140);		//ADD JOB

		showMenuItem(211150);		//ADD NEW(JOB)
		showMenuItem(211160);		//EDIT(JOB)
		showMenuItem(211170);		//DELETE(JOB)

		if(tmp.myRow==null)
		{
			//hideMenuItem(150002);
			hideMenuItem(211160);
			hideMenuItem(211170);
		}
		else
		{
			if(tmp.myRow.content[17]!=0 && tmp.myRow.content[4].parentNode.childNodes[2]==null)
			{
				showMenuItem(211160);
			}
			else
			{
				hideMenuItem(211160);
			}
			//showMenuItem(211160);
			showMenuItem(211170);
		}
	}

	//If context menu has been opened in bill sub window
	else
	{
		//alert("Bill Window");
		showMenuItem(211110);
		showMenuItem(211130);
		showMenuItem(211140);

		hideMenuItem(211150);
		hideMenuItem(211160);
		hideMenuItem(211170);

		if(tmp.myRow==null)
		{
			//hideMenuItem(150002);
			hideMenuItem(211130);
			hideMenuItem(211140);
		}
		else
		{
			//showMenuItem(150002);
			showMenuItem(211130);
			showMenuItem(211140);
		}
	}

	//Impose Menu Permissions
	setMenuPermissions(currentMenuBar,null);
};

/**********************************************************/
/*
 * Ajax call to populate bill at level $id$
 */
function callBillAjax(id,cbId) {
	if(document.getElementById(billTablecontainer)==null)
		return;
	if(document.getElementById(billTablecontainer)==null) return;
	var myBillRequest=getHTMLHTTPRequest();
	billTableCurrentParent=id;
	costBookId=cbId;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20420+"&estimateId="+id+"&method="+"get";
	myBillRequest.open("GET",url,true);
	myBillRequest.onreadystatechange=function()
	{
		if(myBillRequest.readyState==4) {
			if(myBillRequest.status==200) {
				renderBill(myBillRequest);
			}
			else {
				alert("Connection Problem:"+myBillRequest.statusText);
			}
		}
	};
	writeWaitMsg(billTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myBillRequest.send(null);
}


function renderBill(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(billTablecontainer,systemMsg);
	if(errorFlag==0) return;
	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='15%'>Name</td><td width='50%'>Description</td><td>Price</td><td>Premium(%)</td><td width='16px'>&nbsp;</td><td width='16px'>&nbsp;</td><td>D</td><td>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(billTablecontainer).innerHTML=str;
	//Update the bill navigation bar
	updateBillNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
}
/*
 * Update navigation bar for Bill Table according to current level
 */
var updateBillNav=function (xmlDoc,element) {
	var str="<table class='innerNavTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initAssemblyWin(\""+TABLE_NAME+"\");'>Add Assembly</a></td>";
	//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myBillEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initItemWin(false,\""+TABLE_NAME+"\");'>Add Job[E]</a></td>";
	str+="<td>Filter: <input name='filter' onKeyUp='filter(this, \""+TABLE_NAME+"\")' type='text'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("bill");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;	//Bill ID
		param[1]=content[i].childNodes[1].firstChild.data;	//Estimate ID
		param[2]=content[i].childNodes[2].firstChild.data;	//Assembly ID
		param[3]=content[i].childNodes[3].firstChild.data;	//Bill PREMIUM
		param[4]=content[i].childNodes[4].firstChild.data;	//Bill Remarks
		param[5]=content[i].childNodes[5].firstChild.data;	//Assembly Name
		param[6]=content[i].childNodes[6].firstChild.data;	//Assembly Description
		param[7]=content[i].childNodes[7].firstChild.data;	//Assembly Unit
		var price=(content[i].childNodes[10].firstChild.data=="-"?content[i].childNodes[8].firstChild.data:content[i].childNodes[10].firstChild.data);
		param[8]=price;										//Price Quoted in Bill
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
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	cell[0].innerHTML="<img src='images/project/entry.png' border='0'>";

	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: Name
	cell[2]=row.insertCell(2);
	var name=document.createTextNode(param[5]);
	cell[2].appendChild(name);

	//Cell3: Description
	cell[3]=row.insertCell(3);
	var description=document.createTextNode(param[6]);
	cell[3].appendChild(description);

	//Cell4: price
	cell[4]=row.insertCell(4);
	var unit=document.createTextNode(param[7]);
	var sep=document.createTextNode("/");
	var price=document.createTextNode(param[8]);
	cell[4].appendChild(price);
	cell[4].appendChild(sep);
	cell[4].appendChild(unit);

	//Cell5: Premium
	cell[5]=row.insertCell(5);
	var premium=document.createElement('input');
	premium.setAttribute('type', 'text');
	premium.setAttribute('size', '10');
	premium.setAttribute('value', param[3]);
	//document.createTextNode(param[3]);
	cell[5].appendChild(premium);
	var pSpan=document.createElement('span');
	pSpan.appendChild(document.createTextNode(param[3]));
	pSpan.style.display='none';
	cell[5].appendChild(pSpan);

	//Cell6: Image(update)
	cell[6] = row.insertCell(6);
	cell[6].innerHTML="<a href='javascript:void(0);' onclick='callUpdatePremiumAjax(\""+row.sectionRowIndex+"\",\"update\")'><img src='images/common/tick.gif' border='0'></a>";

	//Cel7: Image(discard)
	cell[7] = row.insertCell(7);
	cell[7].innerHTML="<a href='javascript:void(0);' onclick='callUpdatePremiumAjax(\""+row.sectionRowIndex+"\",\"discard\")'><img src='images/common/cross.gif' border='0'></a>";

	//Cell8: Checkbox
	cell[8]=row.insertCell(8);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[8].appendChild(checkBox);

	//cell9:Radio Button
	cell[9] = row.insertCell(9);
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
	cell[9].appendChild(radio);

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
	rowContents[7]=unit;				//UNIT
	rowContents[8]=price;				//PRICE
	rowContents[9]=premium;				//PREMIUM
	rowContents[10]=param[4];			//REMARKS
	rowContents[11]=param[1];			//Estimate ID
	rowContents[12]=pSpan;				//HIDDEN SPAN for PREMIUM
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Items Asynchronously using Ajax
 */

function callDeleteBillAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myDelTable;
	var myDelRowsArray=Array();
	var myDelrIndex;
	var myBillDeleteRequest=getHTMLHTTPRequest();
	myDelTable=tbl;
	myDelRowsArray=obj;
	myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	for(var i=0; i<obj.length; i++) {
		if(i==0) {
			id+=obj[i].myRow.content[6];
		}
		else
			id+=","+obj[i].myRow.content[6];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20430+"&id="+URLEncode(id)+"&method="+"delete";
	myBillDeleteRequest.open("GET",url,true);
	myBillDeleteRequest.onreadystatechange=function()
	{
		if(myBillDeleteRequest.readyState==4) {
			if(myBillDeleteRequest.status==200) {
				var xmlDoc=myBillDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myBillDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myBillDeleteRequest.send(null);
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
		callDeleteBillAjax(tbl,checkedObjArray,rIndex);
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
	callDeleteBillAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Edit Premium for a bill item Asynchronously using Ajax
 */
var myUpdatePremiumRequest=getHTMLHTTPRequest();
var premRowtoEdit;
var callUpdatePremiumAjax=function(row,flag) {
	var tbl=document.getElementById(TABLE_NAME);
	premRowtoEdit=tbl.tBodies[0].rows[row];
	if(flag=='discard') {
		premRowtoEdit.myRow.content[9].value=premRowtoEdit.myRow.content[12].firstChild.data;
		return;
	}
	var myRandom=parseInt(Math.random()*99999999);
	var url="";
	var id=premRowtoEdit.myRow.content[6];
	var premium=premRowtoEdit.myRow.content[9].value;
	url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20440+"&id="+id+"&premium="+premium+"&method="+"updateBillPremium"+"&flag="+flag;
	myUpdatePremiumRequest.open("GET",url,true);
	myUpdatePremiumRequest.onreadystatechange=updatePremiumAction;
	openSplashScreen();
	myUpdatePremiumRequest.send(null);
};

var updatePremiumAction=function() {
	if(myUpdatePremiumRequest.readyState==4) {
		if(myUpdatePremiumRequest.status==200) {
			var xmlDoc=myUpdatePremiumRequest.responseXML;
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
					premRowtoEdit.myRow.content[9].value=refreshValue[0].getAttribute("premium");
					premRowtoEdit.myRow.content[12].firstChild.data=premRowtoEdit.myRow.content[9].value;
				}
			}
			else if(statusFlag==2)
			{
				alert("UPDATE: System Error");
			}
		}
		else {
			alert("Connection Problem:"+myUpdatePremiumRequest.statusText);
		}
		closeSplashScreen();
	}
};


/**********************************************************/
/*
 * Add new Assembly to bill, open Assembly selection window
 */

//var asmBillId;
var assemblyManagerContainer="blankHidden1";	//Main div containing the DHTML window
var ASMOptionsContainer='asmOptions';			//Contains link to assembly/item menu
var ASMInnnerContainer="innerASMContainer";		//Main inner window
var asmOptionsWindow;
var asmOptionsWindowId="asmOptionsWindowId";

var ASM_INNER_TABLE_NAME="asmInnerSample";			//Should be named in HTML
var ASM_INNER_DIV_NAV_NAME="asmInnerNavDiv";		//Navigation Bar
var billTable;
var initAssemblyWin=function(tableName) {
	billTable=tableName;
	var div=document.getElementById(assemblyManagerContainer);
	div.innerHTML="<div id='"+ASMInnnerContainer+"' class='smallText'>Please click on one of the options above</div>";
	openAssemblyOptionsWindow();
};

var openAssemblyOptionsWindow=function() {
	asmOptionsWindow=internalWindow.open(asmOptionsWindowId, 'div', assemblyManagerContainer, 'Add Assembly', 'width=600px,height=400px,left=5px,top=5px,resize=1,scrolling=1');
	openAssemblyTable();
};

/*
 * Open Assemblies Window for adding new Assembly to the bill
 */

var assemblyTableparent=1;	//Up one level
var assemblyTableTop=1;		//Top Level
var assemblyTableCurrentParent=1;				//parent of current level
var assemblyTablecontainer=ASMInnnerContainer;	//this DIV will contain our assembly

var openAssemblyTable=function() {
	callAssemblyAjax(1);
};

/*
 * Ajax call to populate assembly at level $id$
 */

function callAssemblyAjax(id) {
	if(document.getElementById(assemblyTablecontainer)==null) return;
	var myAssemblyRequest=getHTMLHTTPRequest();
	assemblyTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20450+"&parent="+id+"&cbId="+costBookId+"&method="+"getAssembly";

	myAssemblyRequest.open("GET",url,true);
	myAssemblyRequest.onreadystatechange=function()
	{
		if(myAssemblyRequest.readyState==4) {
			if(myAssemblyRequest.status==200) {
				renderAssembly(myAssemblyRequest);
			}
			else {
				alert("Connection Problem:"+myAssemblyRequest.statusText);
			}
		}
	};
	writeWaitMsg(assemblyTablecontainer,"themes/icons/ajax_loading/24.gif","Loading page, please wait...");

	myAssemblyRequest.send(null);
}


function renderAssembly(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(assemblyTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+ASM_INNER_DIV_NAV_NAME+"'></div>";
	str+="<table id='"+ASM_INNER_TABLE_NAME+"' width='97%' class='innerContentTable'><thead id='ASMTThead'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='15%'>Name</td><td width='45%'>Description</td><td>Price</td><td>Premium</td><td width='16px'>&nbsp;</td></tr></thead>";
	str+="<tbody id='ASMTTbody'></tbody></table>";
	document.getElementById(assemblyTablecontainer).innerHTML=str;
	//Update the assembly navigation bar
	updateAssemblyNav(xmlDoc,ASM_INNER_DIV_NAV_NAME);
	populateAssemblyTable(xmlDoc,ASM_INNER_TABLE_NAME);
	addTableRolloverEffect(ASM_INNER_TABLE_NAME,'tableRollOverEffect2','tableRowClickEffect2');
}
/*
 * Update navigation bar for Assembly Table according to current level
 */
var updateAssemblyNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='innerNavTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		assemblyTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableparent+")'><img src='images/assembly/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableTop+")'><img src='images/assembly/top.png' border='0' alt='Top level'></a></td>";
	}
	else if(searchFlag1==false)
	{
		str+="<td><img src='images/assembly/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/assembly/top1.png' alt='Top level'></td>";
		assemblyTableparent=1;
	}
	else
	{
		str+="<td><img src='images/assembly/up1.png' alt='Up one level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableTop+")'><img src='images/assembly/top.png' border='0' alt='Top level'></a></td>";
		searchFlag1=false;
		assemblyTableparent=1;
	}
	str+="<td><label>Enter keyword:</label></td><td><input size='40' type='text' id='searchKeyForAssembly' value=''></td><td><input type='button' value='GO' onclick='vaildateKey2();'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateAssemblyTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("item");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;
		param[1]=content[i].childNodes[1].firstChild.data;
		param[2]=content[i].childNodes[2].firstChild.data;
		param[3]=content[i].childNodes[3].firstChild.data;
		var isFolder=(param[3]=="--");
		param[4]=(content[i].childNodes[8].firstChild.data=="-"?content[i].childNodes[4].firstChild.data:content[i].childNodes[8].firstChild.data);
		param[5]=(content[i].childNodes[9].firstChild.data=="-"?content[i].childNodes[5].firstChild.data:content[i].childNodes[9].firstChild.data);
		param[6]=content[i].getAttribute("remarks");
		param[7]=content[i].getAttribute("parent");
		param[8]=isFolder;
		addRowToTable2(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
};

/**********************************************************/
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
	var isFolder=param[8];
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(isFolder)
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callAssemblyAjax("+param[0]+")'><img src='images/assembly/folder.gif' border='0' width='16' height='16'></a>";
	else
		//cell[0].innerHTML="<a href='javascript:void(0);' onclick='callAssemblyAjax("+param[0]+")'><img src='images/assembly/item.png' border='0' width='16' height='16'></a>";
		cell[0].innerHTML="<img src='images/assembly/item.png' border='0' width='16' height='16'>";
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

	//Cell4: price
	cell[4]=row.insertCell(4);
	var unit;
	var sep;
	var price;
	if(isFolder)
	{
		unit=document.createTextNode("");
		sep=document.createTextNode("");
		price=document.createTextNode("-");
	}
	else
	{
		unit=document.createTextNode(param[3]);
		sep=document.createTextNode("/");
		price=document.createTextNode(param[4]);
	}
	cell[4].appendChild(price);
	cell[4].appendChild(sep);
	cell[4].appendChild(unit);

	//Cell5: Premium
	cell[5]=row.insertCell(5);
	var premium;
	if(isFolder)
		premium=document.createTextNode("-");
	else
		premium=document.createTextNode(param[5]);
	cell[5].appendChild(premium);

	//Cell6: Image
	cell[6] = row.insertCell(6);
	if(!isFolder)
		cell[6].innerHTML="<a href='javascript:void(0);' onclick='callAddAssemblyAjax(\""+tbl.getAttribute("id")+"\","+row.sectionRowIndex+")'><img src='images/common/tick.gif' border='0'></a>";
	else
		cell[6].innerHTML="&nbsp;&nbsp;&nbsp;";
	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=0;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	rowContents[4]=name;
	rowContents[5]=description;
	rowContents[6]=param[0];			//ID
	rowContents[7]=unit;				//UNIT
	rowContents[8]=price;				//PRICE
	rowContents[9]=premium;				//PREMIUM
	rowContents[10]=param[6];			//REMARKS
	rowContents[11]=param[7];			//PARENT
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	//addRowRolloverEffect(row);
};

var myAssemblyAddRequest=getHTMLHTTPRequest();
var myAssemblyTable;
var myAssemblyRow;
var callAddAssemblyAjax=function(tableName,rowNum) {
	var myAssemblyTable=document.getElementById(tableName);
	var row=myAssemblyTable.tBodies[0].rows[rowNum];
	var id=row.myRow.content[6];
	var premium=row.myRow.content[9].data;
	myAssemblyRow=row;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20460+"&id="+id+"&estimateId="+billTableCurrentParent+"&premium="+premium+"&method="+"addAssemblyToBill";

	myAssemblyAddRequest.open("GET",url,true);
	myAssemblyAddRequest.onreadystatechange=addAssemblyToBillAction;
	openSplashScreen();
	myAssemblyAddRequest.send(null);
};

var addAssemblyToBillAction=function() {
	if(myAssemblyAddRequest.readyState==4) {
		if(myAssemblyAddRequest.status==200) {
			var xmlDoc=myAssemblyAddRequest.responseXML;
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

				param[0]=""+newId;									//Bill ID
				param[1]=billTableCurrentParent;					//Estimate ID
				param[2]=myAssemblyRow.myRow.content[6];			//Assembly ID
				param[3]=myAssemblyRow.myRow.content[9].data;		//Bill PREMIUM
				param[4]="remarks";									//Bill Remarks
				param[5]=myAssemblyRow.myRow.content[4].data;		//Assembly Name
				param[6]=myAssemblyRow.myRow.content[5].data;		//Assembly Description
				param[7]=myAssemblyRow.myRow.content[7].data;		//Assembly Unit
				param[8]=myAssemblyRow.myRow.content[8].data;		//Price Quoted in Bill

				addRowToTable1(document.getElementById(TABLE_NAME),-1,param);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
		}
		else {
			alert("Connection Problem:"+myAssemblyAddRequest.statusText);
		}
		closeSplashScreen();
	}
};

/**********************************************************/
/*
 * add new job to selected bill entry
 */
var myBillRow;
var initItemWin=function(context,arg) {
	myBillRow=null;
	if(context==true)
	{
		var srcObj=contextMenu.srcElement;
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
		myBillRow=tmp;
	}
	else
	{
		var tbl=document.getElementById(arg);
		for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
			if(tbl.tBodies[0].rows[i].myRow && tbl.tBodies[0].rows[i].myRow.content[1].getAttribute('type') == 'radio' && tbl.tBodies[0].rows[i].myRow.content[1].checked) {
				myBillRow=tbl.tBodies[0].rows[i];
			}
		}
	}
	if(myBillRow!=null)
		openAddJobsWin();
};

var jobsContainerDiv="blankHidden1";
var jobsInnerDivPrefix="jobsInnerDivPrefix";
var jobsWindowIdPrefix="jobsWindowIdPrefix";
var INNER_TABLE_NAME_PREFIX="innerTableNamePrefix";
var INNER_NAV_DIV_PREFIX="innerNavDivPrefix";
var openAddJobsWin=function() {
	var jobBillId=myBillRow.myRow.content[6];
	var entryNumber=myBillRow.myRow.content[3].data;
	var innerStr="<div id='"+INNER_NAV_DIV_PREFIX+jobBillId+"'>Loading content, please wait...</div><div id='"+jobsInnerDivPrefix+jobBillId+"' class='smallText'></div>";
	document.getElementById(jobsContainerDiv).innerHTML=innerStr;
	internalWindow.open(jobsWindowIdPrefix+jobBillId, 'div', jobsContainerDiv, 'Jobs for #'+entryNumber, 'width=850px,height=500px,left=5px,top=5px,resize=1,scrolling=1');
	callShowJobsAjax(jobBillId);
};

var callShowJobsAjax=function(billId) {
	if(document.getElementById(INNER_NAV_DIV_PREFIX+billId)==null) return;
	if(document.getElementById(jobsInnerDivPrefix+billId)==null) return;
	var myShowJobsRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20470+"&billId="+billId+"&method="+"getJobsList";
	myShowJobsRequest.open("GET",url,true);
	myShowJobsRequest.onreadystatechange=function() {
		if(myShowJobsRequest.readyState==4) {
			if(myShowJobsRequest.status==200) {
				renderJobs(myShowJobsRequest);
			}
			else {
				alert("Connection Problem:"+myShowJobsRequest.statusText);
			}
		}
	};
	myShowJobsRequest.send(null);
};

var renderJobs=function(myShowJobsRequest) {
	var xmlDoc=myShowJobsRequest.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");

	var billTags=xmlDoc.getElementsByTagName("bill");
	var billId=0;
	if(billTags!=null && billTags.length>0)
	{
		billId=billTags[0].getAttribute("id");

		var jobsDiv=document.getElementById(jobsInnerDivPrefix+billId);
		jobsDiv.setAttribute("billRef", billId);

		var str="<table width='97%' class='innerContentTable' id='"+INNER_TABLE_NAME_PREFIX+billId+"'><thead id='JOBTHEAD"+billId+"'><tr><td width='16px'>&nbsp;</td><td width='16px'>Sl</td><td width='20%'>Description</td><td>Numbers</td><td>Length</td><td>Breadth</td><td>Height</td><td>Weight</td><td align='right'>Total</td><td>D</td></tr></thead><tbody id='JOBTBODY"+billId+"'></tbody></table>";
		jobsDiv.innerHTML=str;
		contextMenu.attachTo('JOBTHEAD'+billId,menu2());
		contextMenu.attachTo('JOBTBODY'+billId,menu2());
		updateJobsNav(xmlDoc,INNER_NAV_DIV_PREFIX,INNER_TABLE_NAME_PREFIX,billId);
		populateJobsTable(xmlDoc,INNER_TABLE_NAME_PREFIX,billId);
		addTableRolloverEffect(INNER_TABLE_NAME_PREFIX+billId,'tableRollOverEffect1','tableRowClickEffect1');
	}
	else
	{
		var errorFlag=systemStatus(null,systemMsg);
		if(errorFlag==0) return;
	}

};

var updateJobsNav=function(xmlDoc,divPrefix,tableNamePrefix,billId) {
	var str="<table class='innerNavTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='addNewJobBox(\""+tableNamePrefix+"\","+billId+");'>Add New</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='editCheckedJobsBox(\""+tableNamePrefix+"\","+billId+");'>Edit[D]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteJobsChecked(\""+tableNamePrefix+billId+"\");'>Delete[D]</a></td>";

	str+="</tr></table>";
	document.getElementById(divPrefix+billId).innerHTML=str;
};

var populateJobsTable=function(xmlDoc,tableNamePrefix,billId){
	var tableName=tableNamePrefix+billId;
	var content=xmlDoc.getElementsByTagName("entry");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;
		param[1]=content[i].childNodes[2].firstChild.data;
		param[2]=content[i].childNodes[3].firstChild.data;
		param[3]=content[i].childNodes[4].firstChild.data;
		param[4]=content[i].childNodes[5].firstChild.data;
		param[5]=content[i].childNodes[6].firstChild.data;
		param[6]=content[i].childNodes[7].firstChild.data;
		param[7]=content[i].childNodes[8].firstChild.data;
		param[8]=content[i].childNodes[1].firstChild.data;
		addRowToTable3(tbl,rowToInsertAt,param);
	}
};

/*
 * add a new row at index $num$ using params $param$ into table $tbl$
 */
var addRowToTable3=function (tbl,num,param) {
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
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	cell[0].innerHTML="<img src='images/project/job.gif' border='0'>";

	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: Description
	cell[2]=row.insertCell(2);
	var descriptionTb=getTextBox(20,param[1]);
	descriptionTb.style.display='none';
	var description=document.createTextNode(param[1]);
	cell[2].appendChild(descriptionTb);
	cell[2].appendChild(description);


	//Cell3: Numbers
	cell[3]=row.insertCell(3);
	var numbersTb=getTextBox(10,param[2]);
	numbersTb.style.display='none';
	var numbers=document.createTextNode(param[2]);
	cell[3].appendChild(numbersTb);
	cell[3].appendChild(numbers);


	//Cell4: Length
	cell[4]=row.insertCell(4);
	var lengthTb=getTextBox(10,param[3]);
	lengthTb.style.display='none';
	var length=document.createTextNode(param[3]);
	cell[4].appendChild(lengthTb);
	cell[4].appendChild(length);

	//Cell5: Breadth
	cell[5]=row.insertCell(5);
	var breadthTb=getTextBox(10,param[4]);
	breadthTb.style.display='none';
	var breadth=document.createTextNode(param[4]);
	cell[5].appendChild(breadthTb);
	cell[5].appendChild(breadth);

	//Cell6: Height
	cell[6]=row.insertCell(6);
	var heightTb=getTextBox(10,param[5]);
	heightTb.style.display='none';
	var height=document.createTextNode(param[5]);
	cell[6].appendChild(heightTb);
	cell[6].appendChild(height);

	//Cell7: Weight
	cell[7]=row.insertCell(7);
	var weightTb=getTextBox(10,param[6]);
	weightTb.style.display='none';
	var weight=document.createTextNode(param[6]);
	cell[7].appendChild(weightTb);
	cell[7].appendChild(weight);

	//Cell8: Total
	cell[8]=row.insertCell(8);
	cell[8].setAttribute("align","right");
	var total=document.createTextNode(param[7]);
	cell[8].appendChild(total);

	//Cell9: Checkbox
	cell[9]=row.insertCell(9);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[9].appendChild(checkBox);

	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;

	rowContents[4]=description;
	rowContents[5]=descriptionTb;

	rowContents[6]=numbers;
	rowContents[7]=numbersTb;

	rowContents[8]=length;
	rowContents[9]=lengthTb;

	rowContents[10]=breadth;
	rowContents[11]=breadthTb;

	rowContents[12]=height;
	rowContents[13]=heightTb;

	rowContents[14]=weight;
	rowContents[15]=weightTb;

	rowContents[16]=total;

	rowContents[17]=param[0];			//ID
	rowContents[18]=param[8];			//BILL_ID

	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	//addRowRolloverEffect(row);
};

var getTextBox=function(size,value) {
	var tb=document.createElement('input');
	tb.setAttribute('type', 'text');
	tb.setAttribute('size', size);
	tb.setAttribute('value', value);

	return tb;
};

/**********************************************************/
/*
 * Delete selected jobs and rows
 */
function callDeleteJobsAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myJobDeleteRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var jobsBillId;
	var id="";
	for(var i=0; i<obj.length; i++) {
		if(i==0) {
			id+=obj[i].myRow.content[17];
			jobsBillId=obj[i].myRow.content[18];
		}
		else
			id+=","+obj[i].myRow.content[17];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20480+"&id="+URLEncode(id)+"&billId="+jobsBillId+"&method="+"deleteSelectedJobs";
	//alert(url);
	myJobDeleteRequest.open("GET",url,true);

	myJobDeleteRequest.onreadystatechange=function()
	{
		if(myJobDeleteRequest.readyState==4) {
			if(myJobDeleteRequest.status==200) {
				var xmlDoc=myJobDeleteRequest.responseXML;
				var statusFlag=0;
				if(xmlDoc==null) {alert("Data Error");}
				else
				{
					var systemMsg=xmlDoc.getElementsByTagName("status");
					statusFlag=systemStatus(null,systemMsg);
				}
				if(statusFlag==1) {
					deleteRows(obj);
					reorderRows(tbl, rIndex);
				}
				else if(statusFlag==2) {
					alert("DELETE: System Error");
				}
			}
			else {
				alert("Connection Problem:"+myJobDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myJobDeleteRequest.send(null);
}

/*
 * gets checked rows from table with ID $tblId$
 */
var getJobsChecked=function (tblId) {
	var tbl=document.getElementById(tblId);
	var checkedObjArray = new Array();
	var cCount = 0;
	//alert(tblId);
	for (var i=0; i<tbl.tBodies[0].rows.length; i++)
	{
		if(tbl.tBodies[0].rows[i].myRow.content[0].checked) {
			checkedObjArray[cCount] = tbl.tBodies[0].rows[i];
			//tbl.tBodies[0].rows[i].myRow.content[0].checked=false;
			cCount++;
		}
	}
	return checkedObjArray;
};
/*
 * deletes checked rows, from the table with ID $tblId$
 */
var deleteJobsChecked=function (tblId) {
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
		callDeleteJobsAjax(tbl,checkedObjArray,rIndex);
	}
};

var deleteJobsRows=function (rowObjArray) {
	for (var i=0; i<rowObjArray.length; i++) {
		var rIndex = rowObjArray[i].sectionRowIndex;
		rowObjArray[i].parentNode.deleteRow(rIndex);
	}
};

var reorderJobsRows=function (tbl, startingIndex) {
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
var deleteContextJobsChecked=function () {

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
	callDeleteJobsAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Add a new Job
 */

/*
 * This method is called from context menu, adds an ADD box at the end
 * of the list as many times it is called, uses addNewJobBox internally
 */
var addContextJobsBox=function() {
	var srcObj=contextMenu.srcElement;
	var row;
	while(true)
	{
		row=srcObj.parentNode;
		if(row.tagName!="TR") {
			srcObj=row;
			continue;
		}
		else break;
	}

	var tbl=row.parentNode.parentNode;
	var div=tbl.parentNode;
	var billId=div.getAttribute("billRef");
	//alert(billId);
	//row.myRow.content[0].checked=true;
	addNewJobBox(INNER_TABLE_NAME_PREFIX,billId);
};

/*
 * This method will be called from Nav bar, inserts an ADD box
 * at the end of the Jobs list
 */
var addNewJobBox=function(tblIdprefix,billId) {
	var tbl=document.getElementById(tblIdprefix+billId);
	//alert(tblIdprefix+billId);
	var nextRow = tbl.tBodies[0].rows.length;
	var num = nextRow;
	var iteration = num + ROW_BASE;

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	var cell=Array();
	//Cell0: Image(OK)
	cell[0] = row.insertCell(0);
	//cell[0].innerHTML="<img src='images/common/url.gif' border='0'>";
	cell[0].innerHTML="<a href='javascript:void(0);' onclick='addNewJob(event,"+billId+",\"add\");'><img src='images/common/tick.gif' border='0'></a>";
	//alert(cell[0].childNodes[0].childNodes[0].tagName);

	//Cell1: Image(DISCARD)
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	//slNo.style.display='none';
	cell[1].innerHTML="<a href='javascript:void(0);' onclick='addNewJob(event,"+billId+",\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
	//cell[1].appendChild(slNo);

	//Cell2: Description
	cell[2]=row.insertCell(2);
	var descriptionTb=getTextBox(20,"-");
	var description=document.createTextNode("");
	cell[2].appendChild(descriptionTb);
	cell[2].appendChild(description);


	//Cell3: Numbers
	cell[3]=row.insertCell(3);
	var numbersTb=getTextBox(10,"-");
	var numbers=document.createTextNode("");
	cell[3].appendChild(numbersTb);
	cell[3].appendChild(numbers);


	//Cell4: Length
	cell[4]=row.insertCell(4);
	var lengthTb=getTextBox(10,"-");
	var length=document.createTextNode("");
	cell[4].appendChild(lengthTb);
	cell[4].appendChild(length);

	//Cell5: Breadth
	cell[5]=row.insertCell(5);
	var breadthTb=getTextBox(10,"-");
	var breadth=document.createTextNode("");
	cell[5].appendChild(breadthTb);
	cell[5].appendChild(breadth);

	//Cell6: Height
	cell[6]=row.insertCell(6);
	var heightTb=getTextBox(10,"-");
	var height=document.createTextNode("");
	cell[6].appendChild(heightTb);
	cell[6].appendChild(height);

	//Cell7: Weight
	cell[7]=row.insertCell(7);
	var weightTb=getTextBox(10,"-");
	var weight=document.createTextNode("");
	cell[7].appendChild(weightTb);
	cell[7].appendChild(weight);

	//Cell8: Total
	cell[8]=row.insertCell(8);
	cell[8].setAttribute("align","right");
	var total=document.createTextNode("-");
	cell[8].appendChild(total);

	//Cell9: Checkbox
	cell[9]=row.insertCell(9);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	checkBox.disabled=true;
	cell[9].appendChild(checkBox);


	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;

	rowContents[4]=description;
	rowContents[5]=descriptionTb;

	rowContents[6]=numbers;
	rowContents[7]=numbersTb;

	rowContents[8]=length;
	rowContents[9]=lengthTb;

	rowContents[10]=breadth;
	rowContents[11]=breadthTb;

	rowContents[12]=height;
	rowContents[13]=heightTb;

	rowContents[14]=weight;
	rowContents[15]=weightTb;

	rowContents[16]=total;

	rowContents[17]=0;				//ID
	rowContents[18]=billId;			//BILL_ID

	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/*
 * Adds a new job to the list, sends data to the server and
 * updates the list accordingly
 */
var addNewJob=function(e,billId,flag) {
	var eventSrc=e;
	var row;
	var tbl;
	if(eventSrc.target)
	{
		row=eventSrc.target.parentNode.parentNode.parentNode;
	}
	else if(eventSrc.srcElement)
	{
		row=eventSrc.srcElement.parentNode.parentNode.parentNode;
	}	
	var rowIndex=row.sectionRowIndex;
	tbl=row.parentNode.parentNode;

	if(flag=="discard")
	{
		//alert("discard"+rowIndex);
		discardRowsArray=Array();
		discardRowsArray[0]=tbl.tBodies[0].rows[rowIndex];
		deleteJobsRows(discardRowsArray);
		reorderJobsRows(tbl,rowIndex);
	}
	else if(flag=="add")
	{
		//alert("add");
		var myAddJobRequest=getHTMLHTTPRequest();
		var myRandom=parseInt(Math.random()*99999999);
		var description=URLEncode(row.myRow.content[5].value);
		var number=URLEncode(row.myRow.content[7].value);
		var length=URLEncode(row.myRow.content[9].value);
		var breadth=URLEncode(row.myRow.content[11].value);
		var height=URLEncode(row.myRow.content[13].value);
		var weight=URLEncode(row.myRow.content[15].value);
		var myJobAddData="billId="+billId;
		myJobAddData+="&description="+description;
		myJobAddData+="&number="+number;
		myJobAddData+="&length="+length;
		myJobAddData+="&breadth="+breadth;
		myJobAddData+="&height="+height;
		myJobAddData+="&weight="+weight;
		//myJobAddData=myJobAddData.replace(/\+/g,'%2B');
		//myJobAddData=myJobAddData.replace(/\+/g,'%2B');

		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20490+"&method="+"addNewJob";
		myAddJobRequest.open('POST', url, true);
		myAddJobRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		myAddJobRequest.setRequestHeader("Content-length", myAddJobRequest.length);
		myAddJobRequest.onreadystatechange=function()
		{
			if(myAddJobRequest.readyState==4) {
				if(myAddJobRequest.status==200) {
					var xmlDoc=myAddJobRequest.responseXML;
					var statusFlag=0;
					if(xmlDoc==null) {alert("Data Error");}
					else
					{
						var systemMsg=xmlDoc.getElementsByTagName("status");
						statusFlag=systemStatus(null,systemMsg);
					}
					if(statusFlag==1) {
						var newId=xmlDoc.getElementsByTagName("key")[0].getAttribute("value");
						var total=xmlDoc.getElementsByTagName("key")[0].getAttribute("total");
						row.myRow.content[4].data=row.myRow.content[5].value;
						row.myRow.content[6].data=row.myRow.content[7].value;
						row.myRow.content[8].data=row.myRow.content[9].value;
						row.myRow.content[10].data=row.myRow.content[11].value;
						row.myRow.content[12].data=row.myRow.content[13].value;
						row.myRow.content[14].data=row.myRow.content[15].value;
						row.myRow.content[16].data=""+total;
						row.myRow.content[17]=""+newId;
						row.myRow.content[18]=""+billId;
						for(var i=5;i<=15;i+=2)
						{
							row.myRow.content[i].style.display='none';
						}
						row.cells[0].innerHTML="";
						row.cells[0].innerHTML="<img src='images/common/url.gif' border='0'>";
						row.myRow.content[2]=row.cells[0].innerHTML;
						row.cells[1].innerHTML="";
						row.cells[1].appendChild(row.myRow.content[3]);
						row.myRow.content[0].disabled=false;
					}
					else if(statusFlag==2) {
						alert("ADD: System Error");
					}
				}
				else {
					alert("Connection Problem:"+myAddJobRequest.statusText);
					//assemblyPropertiesWindow.close();
				}
				closeSplashScreen();
			}
		};
		openSplashScreen();
		myAddJobRequest.send(myJobAddData);
	}
};

/**********************************************************/
/*
 * Edit a job
 */

/*
 * This method will be called from context menu
 * It calls editCheckedJobsBox, with setting checkbox to checked
 * for the source row, so it opens edit window which have been checked too
 */
var editContextJobsBox=function() {
	var srcObj=contextMenu.srcElement;
	var row;
	while(true)
	{
		row=srcObj.parentNode;
		if(row.tagName!="TR") {
			srcObj=row;
			continue;
		}
		else break;
	}

	var tbl=row.parentNode.parentNode;
	var div=tbl.parentNode;
	var billId=div.getAttribute("billRef");
	row.myRow.content[0].checked=true;
	editCheckedJobsBox(INNER_TABLE_NAME_PREFIX,billId);
};

/*
 * This method will be called from nav bar, it opens edit bar for
 * all selected jobs, no communication with the server is peformed here
 */
var editCheckedJobsBox=function(tblIdPrefix,billId) {
	var tbl=document.getElementById(tblIdPrefix+billId);
	for (var i=0; i<tbl.tBodies[0].rows.length; i++)
	{

		if(tbl.tBodies[0].rows[i].myRow.content[0].checked) {
			var row=tbl.tBodies[0].rows[i];
			//Preserve Sl No.
			row.myRow.content[3]=document.createTextNode(row.myRow.content[3].data);
			row.cells[0].innerHTML="";
			row.cells[1].innerHTML="";
			row.cells[0].innerHTML="<a href='javascript:void(0);' onclick='editSelectedJob(event,"+billId+",\"edit\");'><img src='images/common/tick.gif' border='0'></a>";
			row.cells[1].innerHTML="<a href='javascript:void(0);' onclick='editSelectedJob(event,"+billId+",\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
			var textNodes=Array();
			for(var j=4;j<=14;j+=2)
			{
				var displayedText=row.myRow.content[j];
				var sp=document.createElement('span');
				sp.appendChild(document.createTextNode(displayedText.data));
				sp.style.display='none';
				displayedText.parentNode.appendChild(sp);
				displayedText.data='';
			}
			for(var k=5;k<=15;k+=2)
			{
				row.myRow.content[k].style.display='inline';
			}
			row.myRow.content[0].checked=false;
			row.myRow.content[0].disabled=true;
		}
	}
};

/*
 * Perform edit command, send request to server and update jobs list
 * accordingly
 */
var editSelectedJob=function(e,billId,flag) {
	var eventSrc=e;
	var row;
	var tbl;
	if(eventSrc.target)
	{
		row=eventSrc.target.parentNode.parentNode.parentNode;
	}
	else if(eventSrc.srcElement)
	{
		row=eventSrc.srcElement.parentNode.parentNode.parentNode;
	}	

	var rowIndex=row.sectionRowIndex;
	tbl=row.parentNode.parentNode;

	if(flag=="discard")
	{
		var displayedText;
		var editBox;
		var newText;
		var span;
		for(var w=4;w<=14;w+=2)
		{
			//Reset Values inside textBoxes and textNodes
			displayedText=row.myRow.content[w];
			editBox=row.myRow.content[w+1];
			span=displayedText.parentNode.childNodes[2];
			newText=span.firstChild.data;

			displayedText.data=newText;
			editBox.value=newText;
			editBox.style.display='none';
			//Remove inserted span, to reset the configuration
			span.parentNode.removeChild(span);
		}
		row.myRow.content[0].disabled=false;
		row.cells[0].innerHTML="";
		row.cells[0].innerHTML="<img src='images/common/url.gif' border='0'>";
		row.myRow.content[2]=row.cells[0].innerHTML;
		row.cells[1].innerHTML="";
		row.cells[1].appendChild(row.myRow.content[3]);
	}
	else if(flag=="edit")
	{
		//alert("add");
		var myEditJobRequest=getHTMLHTTPRequest();
		var myRandom=parseInt(Math.random()*99999999);
		var description=URLEncode(row.myRow.content[5].value);
		var number=URLEncode(row.myRow.content[7].value);
		var length=URLEncode(row.myRow.content[9].value);
		var breadth=URLEncode(row.myRow.content[11].value);
		var height=URLEncode(row.myRow.content[13].value);
		var weight=URLEncode(row.myRow.content[15].value);
		var myJobEditData="id="+row.myRow.content[17];
		myJobEditData+="&description="+description;
		myJobEditData+="&number="+number;
		myJobEditData+="&length="+length;
		myJobEditData+="&breadth="+breadth;
		myJobEditData+="&height="+height;
		myJobEditData+="&weight="+weight;
		//myJobEditData=myJobEditData.replace(/\+/g,'%2B');
		//alert(Url.encode(number));
		//parameters = parameters.replace(/\+/g,'%2B');
		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20500+"&method="+"EditSelectedJob";
		myEditJobRequest.open('POST', url, true);
		myEditJobRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		myEditJobRequest.setRequestHeader("Content-length", myEditJobRequest.length);
		myEditJobRequest.onreadystatechange=function()
		{
			if(myEditJobRequest.readyState==4) {
				if(myEditJobRequest.status==200) {
					var xmlDoc=myEditJobRequest.responseXML;
					var statusFlag=0;
					if(xmlDoc==null) {alert("Data Error");}
					else
					{
						var systemMsg=xmlDoc.getElementsByTagName("status");
						statusFlag=systemStatus(null,systemMsg);
					}
					if(statusFlag==1) {
						//var newId=xmlDoc.getElementsByTagName("key")[0].getAttribute("value");
						var total=xmlDoc.getElementsByTagName("total")[0].getAttribute("value");

						row.myRow.content[16].data=""+total;

						for(w=4;w<=14;w+=2)
						{
							displayedText=row.myRow.content[w];
							editBox=row.myRow.content[w+1];
							editBox.style.display='none';
							//update
							if(editBox.value=="")
							{
								displayedText.data="-";
								editBox.value="-";
							}
							else
								displayedText.data=editBox.value;
							span=displayedText.parentNode.childNodes[2];
							span.parentNode.removeChild(span);
						}
						row.myRow.content[0].disabled=false;
						row.cells[0].innerHTML="";
						row.cells[0].innerHTML="<img src='images/common/url.gif' border='0'>";
						row.myRow.content[2]=row.cells[0].innerHTML;
						row.cells[1].innerHTML="";
						row.cells[1].appendChild(row.myRow.content[3]);
					}
					else if(statusFlag==2) {
						alert("EDIT: System Error");
					}
				}
				else {
					alert("Connection Problem:"+myEditJobRequest.statusText);
					//assemblyPropertiesWindow.close();
				}
				closeSplashScreen();
			}
		};
		openSplashScreen();
		myEditJobRequest.send(myJobEditData);
	}
};


/**************** Search in Material/Assembly Sub-Window **********************************/
function vaildateKey2()
{
	key1=document.getElementById('searchKeyForAssembly').value;
	if(key1.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchAssemblyAjax();
		//alert(key1);
	}
}

function callSearchAssemblyAjax(id) {
	if(document.getElementById(assemblyTablecontainer)==null) return;
	var myAssemblyRequest=getHTMLHTTPRequest();
	assemblyTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key1);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20450+"&key="+searchString+"&cbId="+costBookId+"&method="+"getAssemblyCost";

	myAssemblyRequest.open("GET",url,true);
	myAssemblyRequest.onreadystatechange=function()
	{
		if(myAssemblyRequest.readyState==4) {
			if(myAssemblyRequest.status==200) {
				searchFlag1=true;
				renderAssembly(myAssemblyRequest);
			}
			else {
				alert("Connection Problem:"+myAssemblyRequest.statusText);
			}
		}
	};
	writeWaitMsg(assemblyTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myAssemblyRequest.send(null);
}