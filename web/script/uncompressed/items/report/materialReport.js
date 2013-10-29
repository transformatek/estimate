/**********************************************************
 * Creates basic facilities for printing Bill-of-Material
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

var materialTableparent=1;	//Up one level
var materialTableTop=1;		//Top Level
var materialTableCurrentParent=1;			//parent of current level
var materialTablecontainer="blankContent";	//this DIV will contain our material

//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="materialSample";			//Should be named in HTML
var DIV_NAV_NAME="materialNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="MATREP_TTHEAD123";				
var ctx_TBODY="MATREP_TTBODY123";
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
 * Initializes Context Menu for Resource Table
 * and then populates the table
 */
var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			callMaterialAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeResourceTable=function(id)
{
	myCurrentMenuParent=id;
	writeWaitMsg(materialTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

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
		setMenuItemState(211540,'disabled');	//PRINT MATERIAL
	}
	else
	{
		if(tmp.myRow.content[7]=="category")
			setMenuItemState(211540,'regular');	//PRINT MATERIAL
		else
			setMenuItemState(211540,'disabled');	//PRINT MATERIAL
	}

	//If this is top level, no need for navigation
	if(materialTableCurrentParent==1)
	{
		setMenuItemState(211510,'disabled');	//UP
		setMenuItemState(211520,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(211510,'regular');	//UP
		setMenuItemState(211520,'regular');	//TOP
	}

	//Set Menu Permissions if we missed earlier
	setMenuPermissions(currentMenuBar);
};

/**********************************************************/
/*
 * Ajax call to populate material at level $id$
 */
function callMaterialAjax(id) {
	if(document.getElementById(materialTablecontainer)==null) return;
	var myMaterialRequest=getHTMLHTTPRequest();
	materialTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+101100+"&parent="+id+"&cbId="+costBookId+"&method="+"getMaterialWithCostBook";

	myMaterialRequest.open("GET",url,true);
	myMaterialRequest.onreadystatechange=function()
	{
		if(myMaterialRequest.readyState==4) {
			if(myMaterialRequest.status==200) {
				renderMaterial(myMaterialRequest);
			}
			else {
				alert("Connection Problem:"+myMaterialRequest.statusText);
			}
		}
	};
	writeWaitMsg(materialTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myMaterialRequest.send(null);
}

function renderMaterial(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(materialTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='reportTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='40%'>Description</td><td>Price</td><td width='25%'>Remarks</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(materialTablecontainer).innerHTML=str;
	//Update the material navigation bar
	updateMaterialNav(xmlDoc,DIV_NAV_NAME);
	//initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
	addTableRolloverEffect(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
}
/*
 * Update navigation bar for Material Table according to current level
 */
var updateMaterialNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		materialTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callMaterialAjax("+materialTableparent+")'><img src='images/material/report/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callMaterialAjax("+materialTableTop+")'><img src='images/material/report/top.png' border='0' alt='Top level'></a></td>";
		str+="<td>Costbook Selected:&nbsp;[<i>"+costBookName+"</i>]</td>";
	}
	else
	{
		str+="<td><img src='images/material/report/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/material/report/top1.png' alt='Top level'></td>";
		str+="<td>Costbook Selected:&nbsp;[<i>"+costBookName+"</i>]</td>";
		materialTableparent=1;
	}
	str+="<td>&nbsp;</td><td align='right'><input type='button' name='search' value='Search' onclick='populateSearchWin();'/></td>";

	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("category");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="category";		//Row type is category
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToTable1(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("item");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="item";		//Row type is category
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		param[6]=content[i].childNodes[5].firstChild.data;
		param[7]=content[i].childNodes[6].firstChild.data;
		param[8]=content[i].childNodes[7].firstChild.data;
		//addRowToTable(tbl,rowToInsertAt,content[i]);
		addRowToTable1(tbl,rowToInsertAt,param);
		//addRowToTable(tbl,-1,content[i]);	//Add new row at the end
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
	//Highlight Search
	if(param[1]==sid)
		row.className='searchClass';
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[0]=="category")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callMaterialAjax("+param[1]+")'><img src='images/material/folder.png' border='0'></a>";
	else
		cell[0].innerHTML="<img src='images/material/file.gif' border='0'>";

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

	//Cell4: Price
	cell[4]=row.insertCell(4);
	var price;
	var cbPrice;
	var sep;
	var unit;
	if(param[0]=="item")
	{
		price=document.createTextNode(param[5]);
		if(costBookId!=0)
			cbPrice=document.createTextNode(" ["+param[8]+"]");
		else
			cbPrice=document.createTextNode("");
		sep=document.createTextNode("/");
		unit=document.createTextNode(param[4]);
	}
	else
	{
		price=document.createTextNode("-");
		cbPrice=document.createTextNode("");
		sep=document.createTextNode("");
		unit=document.createTextNode("");
	}
	cell[4].appendChild(price);
	cell[4].appendChild(cbPrice);
	cell[4].appendChild(sep);
	cell[4].appendChild(unit);

	//Cell5: Remarks
	cell[5]=row.insertCell(5);
	var remarks;
	if(param[0]=="item")
	{
		remarks=document.createTextNode(param[6]);
	}
	else
		remarks=document.createTextNode(param[4]);
	cell[5].appendChild(remarks);


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
	if(param[0]=="category")
	{
		rowContents[8]=remarks;	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	else
	{
		rowContents[8]=unit;	//unit
		rowContents[9]=price;	//price
		rowContents[10]=remarks;	//remarks
		rowContents[11]=param[7];	//parent
	}
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
 * Init first level
 */
//callMaterialAjax(1);

initializeResourceTable(10250);


/**********************************************************/
/*
 * Change CostBook
 */
var editCostBookInnerDiv="costBookInnerDiv";
var matPropertiesWindowDiv="blankHidden";
var matPropertiesWindow=null;
//var matPropertiesWindowTitle="Properties";
var matPropertiesWindowId="matPropertiesWindowId";

var myContextCostBookEditWindow=function() {
	populateCostBookEditWin();
};


var populateCostBookEditWin=function() {
	var innerStr="<div id='"+editCostBookInnerDiv+"'></div>";
	var editableDiv=document.getElementById(matPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyCostBookPropertiesWin();
};

var openMyCostBookPropertiesWin=function() {
	matPropertiesWindow=internalWindow.open(matPropertiesWindowId, 'div', matPropertiesWindowDiv, '#CostBook', 'width=750px,height=500px,left=20px,top=15px,resize=1,scrolling=1');
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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+101200+"&parent="+id+"&method="+"getCostBook";

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
	callMaterialAjax(materialTableCurrentParent);
	//alert("ID: "+id+", NAME: "+name);
};

var printMaterial=function() {
	var catId;
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
	if(row.myRow.content[7]!="category")
		return;

	catId=""+row.myRow.content[6];
	window.open("MyActionDispatcher?path=101300&catId="+catId+"&cbId="+costBookId+"&cbName="+URLEncode(costBookName)+"&method=printMaterialPDF");
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
	projectPropertiesWindow=internalWindow.open('searchWindow', 'div', 'blankHidden1', 'Search Material', 'width=600px,height=400px,left=200px,top=150px,resize=1,scrolling=1');
};

function vaildateKey()
{
	key=document.getElementById('searchKey').value;
	if(key.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchMaterialAjax();
		//alert(key);
	}
}

function callSearchMaterialAjax() {
	var mySearchRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+101100+"&key="+searchString+"&cbId="+costBookId+"&method="+"searchMaterial";
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
	innerStr+="<table id='searchTable' width='100%' class='reportTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td>Description</td><td>Price</td></tr></thead>";
	innerStr+="<tbody id='searchbody'></tbody></table>";
	document.getElementById('searchResult').innerHTML=innerStr;
	populateSearchTable(xmlDoc,'searchTable');
	var bodyText=document.getElementById('searchResult').innerHTML;
	document.getElementById('searchResult').innerHTML=doHighlight(bodyText, key);
	addTableRolloverEffect('searchTable','tableRollOverEffect2','tableRowClickEffect2');
}



var populateSearchTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("category");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="category";		//Row type is category
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToSearchTable(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("item");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="item";		//Row type is category
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		param[6]=content[i].childNodes[5].firstChild.data;
		param[7]=content[i].childNodes[6].firstChild.data;
		param[8]=content[i].childNodes[7].firstChild.data;
		//addRowToTable(tbl,rowToInsertAt,content[i]);
		addRowToSearchTable(tbl,rowToInsertAt,param);
		//addRowToTable(tbl,-1,content[i]);	//Add new row at the end
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

	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[0]=="category")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callMaterialAjax("+param[5]+")'><img src='images/material/folder.png' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callMaterialAjax("+param[7]+")'><img src='images/material/file.gif' border='0'></a>";

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

	//Cell4: Price
	cell[4]=row.insertCell(4);
	var price;
	var cbPrice;
	var sep;
	var unit;
	if(param[0]=="item")
	{
		price=document.createTextNode(param[5]);
		if(costBookId!=0)
			cbPrice=document.createTextNode(" ["+param[8]+"]");
		else
			cbPrice=document.createTextNode("");
		sep=document.createTextNode("/");
		unit=document.createTextNode(param[4]);
	}
	else
	{
		price=document.createTextNode("-");
		cbPrice=document.createTextNode("");
		sep=document.createTextNode("");
		unit=document.createTextNode("");
	}
	cell[4].appendChild(price);
	cell[4].appendChild(cbPrice);
	cell[4].appendChild(sep);
	cell[4].appendChild(unit);


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
	if(param[0]=="category")
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	else
	{
		rowContents[8]=unit;	//unit
		rowContents[9]=price;	//price
		rowContents[10]=param[6];	//remarks
		rowContents[11]=param[7];	//parent
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

/**************** Search CostBook **********************************/
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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+101200+"&key="+searchString+"&method="+"searchCostBook";
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