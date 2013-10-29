/**********************************************************
 * Creates basic facilities for generating Analysis-of-Rate and for printing Schedule-of-Rates
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
var costBookId=0;
var costBookName="--";
var assemblyTableparent=1;	//Up one level
var assemblyTableTop=1;		//Top Level
var assemblyTableCurrentParent=1;			//parent of current level
var assemblyTablecontainer="blankContent";	//this DIV will contain our assembly

//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="assemblySample";			//Should be named in HTML
var DIV_NAV_NAME="assemblyNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="ASMREP_TTHEAD123";				
var ctx_TBODY="ASMREP_TTBODY123";
/*
 * For Search
 */
var key='qwerty';
var sid=0;

/*
 * For Search in CostBook sub-window
 */
var key1='qwerty';
var searchFlag1=false;
/* ============================================================= */
/*
 * Initializes Context Menu for Assembly Table
 * and then populates the table
 */

var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			callAssemblyAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeAssemblyTable=function(id)
{
	writeWaitMsg(assemblyTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

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
	//Only Activate Menu Items relevant to context
	if(tmp.myRow==null)
	{
		setMenuItemState(211340,'disabled');	//PRINT ASSEMBLIES
		setMenuItemState(211350,'disabled');	//PRINT MATERIAL
	}
	else
	{
		setMenuItemState(211340,'regular');	//PRINT ASSEMBLIES
		if(tmp.myRow.content[7].data=="")
			setMenuItemState(211350,'disabled');	//PRINT MATERIAL
		else
			setMenuItemState(211350,'regular');	//PRINT MATERIAL
	}

	//If this is top level, no need for navigation
	if(assemblyTableCurrentParent==1)
	{
		setMenuItemState(211310,'disabled');	//UP
		setMenuItemState(211320,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(211310,'regular');	//UP
		setMenuItemState(211320,'regular');	//TOP
	}
	//Finally set Menu Permissions if we missed earlier
	setMenuPermissions(currentMenuBar);
};

/**********************************************************/
/*
 * Ajax call to populate assembly at level $id$
 */

function callAssemblyAjax(id) {
	if(document.getElementById(assemblyTablecontainer)==null)
		return;
	var myAssemblyRequest=getHTMLHTTPRequest();
	assemblyTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+100100+"&parent="+id+"&cbId="+costBookId+"&method="+"getAssemblyWithCostBook";

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
	writeWaitMsg(assemblyTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myAssemblyRequest.send(null);
}

function renderAssembly(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(assemblyTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='reportTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='15%'>Name</td><td width='40%'>Description</td><td>Price</td><td>Premium</td><td width='25%'>Remarks</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(assemblyTablecontainer).innerHTML=str;
	//Update the assembly navigation bar
	updateAssemblyNav(xmlDoc,DIV_NAV_NAME);
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
	addTableRolloverEffect(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
}
/*
 * Update navigation bar for Assembly Table according to current level
 */
var updateAssemblyNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		assemblyTableparent=parentId[0].getAttribute("id");

		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableparent+")'><img src='images/assembly/report/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableTop+")'><img src='images/assembly/report/top.png' border='0' alt='Top level'></a></td>";
		str+="<td>Costbook Selected:&nbsp;[<i>"+costBookName+"</i>]</td>";
	}
	else
	{
		str+="<td><img src='images/assembly/report/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/assembly/report/top1.png' alt='Top level'></td>";
		str+="<td>Costbook Selected:&nbsp;[<i>"+costBookName+"</i>]</td>";
		assemblyTableparent=1;
	}
	str+="<td>&nbsp;</td><td align='right'><input type='button' name='search' value='Search' onclick='populateSearchWin();'/></td>";

	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("item");

	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		//alert(content[i].childNodes.length);
		param[0]=content[i].childNodes[0].firstChild.data;
		param[1]=content[i].childNodes[1].firstChild.data;
		param[2]=content[i].childNodes[2].firstChild.data;
		param[3]=content[i].childNodes[3].firstChild.data;
		param[4]=content[i].childNodes[4].firstChild.data;
		param[5]=content[i].childNodes[5].firstChild.data;
		param[6]=content[i].childNodes[6].firstChild.data;
		param[7]=content[i].childNodes[7].firstChild.data;
		param[8]=content[i].childNodes[8].firstChild.data;
		param[9]=content[i].childNodes[9].firstChild.data;
		param[10]=content[i].childNodes[10].firstChild.data;
		param[11]=content[i].childNodes[11].firstChild.data;
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
	var isFolder=(param[3]=="--");
	//var isFolder=(parseInt(param[4]*1000000)==NaN || parseInt(param[4]*1000000)==0);
	//Highlight Search
	if(param[0]==sid)
		row.className='searchClass';
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
	var cbPrice;

	if(isFolder)
	{
		unit=document.createTextNode("");
		sep=document.createTextNode("");
		price=document.createTextNode("-");
		cbPrice=document.createTextNode("");
	}
	else
	{
		sep=document.createTextNode("/");
		if(param[10]=="-") {
			unit=document.createTextNode(param[3]);
			displayPrice=(param[8]=="-"?param[4]:param[8]);
		}
		else {
			unit=document.createTextNode(param[10]);
			displayPrice=(param[8]=="-"?Math.round(param[4]*param[11]*100)/100:Math.round(param[8]*param[11]*100)/100);
		}
		price=document.createTextNode(displayPrice);
	}
	cell[4].appendChild(price);

	cell[4].appendChild(sep);
	cell[4].appendChild(unit);

	//Cell5: Premium
	cell[5]=row.insertCell(5);
	var premium;
	var cbPremium;
	if(isFolder)
	{
		premium=document.createTextNode("-");
		cbPremium=document.createTextNode("");
	}
	else
	{
		var displayPremium=param[9]=="-"?param[5]:param[9];
		premium=document.createTextNode(displayPremium);
		//cbPremium=document.createTextNode(" ["+param[9]+"]");
	}
	cell[5].appendChild(premium);
	//if(costBookId!=0)
	//cell[5].appendChild(cbPremium);

	//Cell6: Remarks
	cell[6]=row.insertCell(6);
	var remarks=document.createTextNode(param[6]);
	cell[6].appendChild(remarks);

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
	rowContents[10]=remarks;			//REMARKS
	rowContents[11]=param[7];			//PARENT
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	//addRowRolloverEffect(row);
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

/**********************************************************/
/*
 * Initialize First Level
 */
initializeAssemblyTable(10240);
//callAssemblyAjax(1);

/**********************************************************/
/*
 * Change CostBook, for report generation
 */
var editCostBookInnerDiv="costBookInnerDiv";
var asmPropertiesWindowDiv="blankHidden";
var asmPropertiesWindow=null;
//var asmPropertiesWindowTitle="Properties";
var asmPropertiesWindowId="asmPropertiesWindowId";

var myContextCostBookEditWindow=function() {
	populateCostBookEditWin();
};


var populateCostBookEditWin=function() {
	var innerStr="<div id='"+editCostBookInnerDiv+"'></div>";
	var editableDiv=document.getElementById(asmPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyCostBookPropertiesWin();
};

var openMyCostBookPropertiesWin=function() {
	asmPropertiesWindow=internalWindow.open(asmPropertiesWindowId, 'div', asmPropertiesWindowDiv, '#CostBook', 'width=750px,height=500px,left=20px,top=15px,resize=1,scrolling=1');
	callCbCatAjax(1);
};

/**********************************************************/
/*
 * Open CostBook Directory for selecting a particular
 * costbook, selected costbook will be assigned to the estimate
 * for which action has been called
 */
var cbCatTableparent=1;	//Up one level
var cbCatTableTop=1;		//Top Level
var cbCatTableCurrentParent=1;			//parent of current level
var cbCatTablecontainer=editCostBookInnerDiv;	//this DIV will contain our cbCat

//Table must have <tbody>
//var INPUT_NAME_PREFIX="inputName";		//set via script
//var RADIO_NAME="radName";				//set via script
var CB_TABLE_NAME="cbCatSample123";			//Should be named in HTML
var CB_DIV_NAV_NAME="cbCatNavDiv123";			//Navigation Bar
var CB_ROW_BASE=1;							//Row nubering starts fro here
/**********************************************************/
/*
 * Ajax call to populate cbCat at level $id$
 */
function callCbCatAjax(id) {
	if(document.getElementById(cbCatTablecontainer)==null) return;
	var myCbCatRequest=getHTMLHTTPRequest();
	cbCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+100200+"&parent="+id+"&method="+"getCostBook";

	myCbCatRequest.open("GET",url,true);
	myCbCatRequest.onreadystatechange=function()
	{
		if(myCbCatRequest.readyState==4) {
			if(myCbCatRequest.status==200) {
				renderCbCat(myCbCatRequest);
			}
			else {
				alert("Connection Problem:"+myCbCatRequest.statusText);
			}
		}
	};
	writeWaitMsg(cbCatTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myCbCatRequest.send(null);
}


function renderCbCat(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(cbCatTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+CB_DIV_NAV_NAME+"'></div>";
	str+="<table id='"+CB_TABLE_NAME+"' width='100%' class='innerContentTable'><thead id='TThead1'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='10%'>Name</td><td width='100%'>Description</td><td>&nbsp;</td></tr></thead>";
	str+="<tbody id='TTbody1'></tbody></table>";
	document.getElementById(cbCatTablecontainer).innerHTML=str;
	//Update the cbCat navigation bar
	updateCbCatNav(xmlDoc,CB_DIV_NAV_NAME);
	populateCbTable(xmlDoc,CB_TABLE_NAME);
	addTableRolloverEffect(CB_TABLE_NAME,'tableRollOverEffect2','tableRowClickEffect2');
}
/*
 * Update navigation bar for CbCat Table according to current level
 */
var updateCbCatNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='innerNavTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		cbCatTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callCbCatAjax("+cbCatTableparent+")'><img src='images/costbook/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callCbCatAjax("+cbCatTableTop+")'><img src='images/costbook/top.png' border='0' alt='Top level'></a></td>";
	}
	else if(searchFlag1==false)
	{
		str+="<td><img src='images/costbook/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/costbook/top1.png' alt='Top level'></td>";
		cbCatTableparent=1;
	}
	else
	{
		str+="<td><img src='images/costbook/up1.png' alt='Up one level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callCbCatAjax("+cbCatTableTop+")'><img src='images/costbook/top.png' border='0' alt='Top level'></a></td>";
		searchFlag1=false;
		cbCatTableparent=1;
	}
	str+="<td><label>Enter keyword:</label></td><td><input size='40' type='text' id='searchKeyForCB' value=''></td><td><input type='button' value='GO' onclick='vaildateKey1();'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateCbTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("cbCat");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="cbCat";		//Row type is cbCat
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToTable2(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("cb");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="cb";		//Row type is cbCat
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
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
	var iteration = nextRow + CB_ROW_BASE;
	if(num==-1) {
		num = nextRow;
	}
	else {
		iteration = num + CB_ROW_BASE;
	}

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[0]=="cbCat")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callCbCatAjax("+param[1]+")'><img src='images/costbook/folder.gif' border='0'></a>";
	else
		cell[0].innerHTML="<img src='images/costbook/costbook.png' border='0'>";

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

	//Cell4: Image (Associate this costbook with the estimate)
	cell[4] = row.insertCell(4);
	if(param[0]=="cbCat")
		cell[4].innerHTML="&nbsp;";
	else
		cell[4].innerHTML="<a href='javascript:void(0);' onclick='changeCostBook("+param[1]+", \""+param[2]+"\")'><img src='images/common/tick.gif' border='0'></a>";


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
	if(param[0]=="cbCat")
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	else
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

var changeCostBook=function(id,name) {
	if(costBookId==id) return;
	costBookId=id;
	costBookName=""+name;
	callAssemblyAjax(assemblyTableCurrentParent);
	//alert("ID: "+id+", NAME: "+name);
};

var printAssemblies=function() {
	var assemblyId;
	var row=null;
	var srcObj=contextMenu.srcElement;
	while(true)
	{
		row=srcObj.parentNode;
		if(row.tagName!="TR") {
			srcObj=row;
			continue;
		}
		else break;
	}

	assemblyId=row.myRow.content[6];
	//alert(assemblyId);
	window.open("MyActionDispatcher?path=100300&assemblyId="+assemblyId+"&cbId="+costBookId+"&cbName="+URLEncode(costBookName)+"&method=assemblyTreePDF");
};

var pickedAssembly;
var printMaterial=function() {
	var assemblyId;
	var row=null;
	var srcObj=contextMenu.srcElement;
	while(true)
	{
		row=srcObj.parentNode;
		if(row.tagName!="TR") {
			srcObj=row;
			continue;
		}
		else break;
	}

	assemblyId=""+row.myRow.content[6];
	pickedAssembly=row;
	populateVolumePickerWindow(row);
	//window.open("MyActionDispatcher?path=100400&assemblyId="+assemblyId+"&cbId="+costBookId+"&cbName="+URLEncode(costBookName)+"&method=AssemblyMaterialPDF");
};

var VolumePickerWindowDiv="blankHidden1";
var VolumePickerWindowId="VolumePickerWindowId";
var VolumePickerWindow=null;
var populateVolumePickerWindow=function(row)
{
	var str="<table><tr><td><label>Analysis of Rate for: </label>";
	str+="<input size='40' type='text' id='pickVolume' value='1'>&nbsp;"+row.myRow.content[7].data+"</td></tr>";
	str+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='printReport();'>Generate</a>&nbsp;&nbsp;";
	//str+="<a href='javascript:void(0)' onclick='VolumePickerWindow.close();'>Exit</a></td></tr></table>";
	str+="</td></tr></table>";
	var pickerDiv=document.getElementById(VolumePickerWindowDiv);
	pickerDiv.innerHTML=str;

	VolumePickerWindow=internalWindow.open(VolumePickerWindowId, 'div', VolumePickerWindowDiv, '#Enter Volume:['+row.myRow.content[4].data+']', 'width=500px,height=250px,left=200px,top=150px,resize=1,scrolling=1');
};

var printReport=function()
{
	var assemblyId=""+pickedAssembly.myRow.content[6];
	var volume=document.getElementById('pickVolume').value;
	//alert(""+volume+":"+assemblyId);
	VolumePickerWindow=window.open("MyActionDispatcher?path=100400&assemblyId="+assemblyId+"&cbId="+costBookId+"&cbName="+URLEncode(costBookName)+"&volume="+volume+"&method=AssemblyMaterialPDF");
};

/**************** Search **********************************/


var populateSearchWin=function() {
	var innerStr="<table>";
	innerStr+="<tr><td><label>Enter keyword:</label></td><td><input size='40' type='text' id='searchKey' value=''></td><td><input type='button' value='GO' onclick='vaildateKey();'></td></tr>";
	innerStr+="</table>";
	innerStr+="<div id='searchResult'>&nbsp;</div>";

	var editableDiv=document.getElementById('blankHidden1');
	editableDiv.innerHTML=innerStr;
	openSearchWin();
};

var openSearchWin=function() {
	projectPropertiesWindow=internalWindow.open('searchWindow', 'div', 'blankHidden1', 'Search Assemblies', 'width=600px,height=400px,left=200px,top=150px,resize=1,scrolling=1');
};

function vaildateKey()
{
	key=document.getElementById('searchKey').value;
	if(key.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchAssembliesAjax();
		//alert(key);
	}
}

function callSearchAssembliesAjax() {
	var mySearchRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+100100+"&key="+searchString+"&cbId="+costBookId+"&method="+"searchAssemblies";
	mySearchRequest.open("GET",url,true);
	mySearchRequest.onreadystatechange=function()
	{
		if(mySearchRequest.readyState==4) {
			if(mySearchRequest.status==200) {
				renderSearch(mySearchRequest);
			}
			else {
				alert("Connection Problem:"+mySearchRequest.statusText);
			}
		}
	};
	writeWaitMsg('searchResult',"themes/icons/ajax_loading/22.gif","Processing request, please wait...");
	mySearchRequest.send(null);
}

function renderSearch(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus('searchResult',systemMsg);
	if(errorFlag==0) return;

	var innerStr="";
	innerStr+="<table id='searchTable' width='100%' class='reportTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td>Description</td><td>Price</td><td>Premium</td></tr></thead>";
	innerStr+="<tbody id='searchbody'></tbody></table>";
	document.getElementById('searchResult').innerHTML=innerStr;
	populateSearchTable(xmlDoc,'searchTable');
	var bodyText=document.getElementById('searchResult').innerHTML;
	document.getElementById('searchResult').innerHTML=doHighlight(bodyText, key);
	addTableRolloverEffect('searchTable','tableRollOverEffect2','tableRowClickEffect2');
}



var populateSearchTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("item");

	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		//alert(content[i].childNodes.length);
		param[0]=content[i].childNodes[0].firstChild.data;
		param[1]=content[i].childNodes[1].firstChild.data;
		param[2]=content[i].childNodes[2].firstChild.data;
		param[3]=content[i].childNodes[3].firstChild.data;
		param[4]=content[i].childNodes[4].firstChild.data;
		param[5]=content[i].childNodes[5].firstChild.data;
		param[6]=content[i].childNodes[6].firstChild.data;
		param[7]=content[i].childNodes[7].firstChild.data;
		param[8]=content[i].childNodes[8].firstChild.data;
		param[9]=content[i].childNodes[9].firstChild.data;
		param[10]=content[i].childNodes[10].firstChild.data;
		param[11]=content[i].childNodes[11].firstChild.data;
		addRowToSearchTable(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
};

var addRowToSearchTable=function (tbl,num,param) {
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
	//alert('classA' + (iteration % 2));
	var isFolder=(param[3]=="--");
	//var isFolder=(parseInt(param[4]*1000000)==NaN || parseInt(param[4]*1000000)==0);

	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(isFolder)
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[0]+";callAssemblyAjax("+param[7]+")'><img src='images/assembly/folder.gif' border='0' width='16' height='16'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[0]+";callAssemblyAjax("+param[7]+")'><img src='images/assembly/item.png' border='0' width='16' height='16'></a>";

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
	var cbPrice;

	if(isFolder)
	{
		unit=document.createTextNode("");
		sep=document.createTextNode("");
		price=document.createTextNode("-");
		cbPrice=document.createTextNode("");
	}
	else
	{
		sep=document.createTextNode("/");
		if(param[10]=="-") {
			unit=document.createTextNode(param[3]);
			displayPrice=(param[8]=="-"?param[4]:param[8]);
		}
		else {
			unit=document.createTextNode(param[10]);
			displayPrice=(param[8]=="-"?Math.round(param[4]*param[11]*100)/100:Math.round(param[8]*param[11]*100)/100);
		}
		price=document.createTextNode(displayPrice);
	}
	cell[4].appendChild(price);

	cell[4].appendChild(sep);
	cell[4].appendChild(unit);

	//Cell5: Premium
	cell[5]=row.insertCell(5);
	var premium;
	var cbPremium;
	if(isFolder)
	{
		premium=document.createTextNode("-");
		cbPremium=document.createTextNode("");
	}
	else
	{
		var displayPremium=param[9]=="-"?param[5]:param[9];
		premium=document.createTextNode(displayPremium);
		//cbPremium=document.createTextNode(" ["+param[9]+"]");
	}
	cell[5].appendChild(premium);
	//if(costBookId!=0)
	//cell[5].appendChild(cbPremium);

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
};




/**************** Search Costbook **********************************/
function vaildateKey1()
{
	key1=document.getElementById('searchKeyForCB').value;
	if(key1.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchCBAjax();
		//alert(key);
	}
}

function callSearchCBAjax(id) {
	if(document.getElementById(cbCatTablecontainer)==null) return;
	var myCbCatRequest=getHTMLHTTPRequest();
	cbCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key1);
	//var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+100200+"&parent="+id+"&method="+"getCostBook";
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+100200+"&key="+searchString+"&method="+"searchCostBook";
	myCbCatRequest.open("GET",url,true);
	myCbCatRequest.onreadystatechange=function()
	{
		if(myCbCatRequest.readyState==4) {
			if(myCbCatRequest.status==200) {
				searchFlag1=true;
				renderCbCat(myCbCatRequest);
			}
			else {
				alert("Connection Problem:"+myCbCatRequest.statusText);
			}
		}
	};
	writeWaitMsg(cbCatTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myCbCatRequest.send(null);
}