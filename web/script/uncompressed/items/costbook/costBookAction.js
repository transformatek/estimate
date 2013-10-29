/**********************************************************
 * Creates basic facilities for Managing CostBooks
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
var cbCatTableparent=1;	//Up one level
var cbCatTableTop=1;		//Top Level
var cbCatTableCurrentParent=1;			//parent of current level
var cbCatTablecontainer="blankContent";	//this DIV will contain our cbCat
var cbCatPropertiesWindow=null;			//Properties(Add/Edit window)
//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="cbCatSample";			//Should be named in HTML
var DIV_NAV_NAME="cbCatNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="CB_TTHEAD123";				
var ctx_TBODY="CB_TTBODY123";
/*
 * For Search
 */
var key='qwerty';
var sid=0;
/* ============================================================= */
/*
 * Initializes Context Menu for CostBook Table
 * and then populates the table
 */
var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			//getContextMenuModel();
			callCbCatAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeCBTable=function(id)
{
	myCurrentMenuParent=id;
	writeWaitMsg(cbCatTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

	callContextMenuAjax(id, callBack);
};
var menu2=function()
{
	return configureContextMenuModel();
};

contextMenu.modifyMenu=function() {
	var srcObj=this.srcElement;
	currentMenuBar=this.menuBar;
	//setMenuPermissions(currentMenuBar,null);
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
	//.content[7]
	if(tmp.myRow==null)
	{
		setMenuItemState(210380,'disabled');	//EDIT
		setMenuItemState(210390,'disabled');	//DELETE
		setMenuItemState(210410,'disabled');	//CUT
		setMenuItemState(210450,'disabled');	//EDIT PRICE
	}
	else
	{
		if(tmp.myRow.content[7]=="cb")
		{
			//If this is a costBook enable edit price option
			setMenuItemState(210450,'regular');	//EDIT PRICE
		}
		else
		{
			setMenuItemState(210450,'disabled');	//EDIT PRICE
		}
		setMenuItemState(210380,'regular');	//EDIT
		setMenuItemState(210390,'regular');	//DELETE
		setMenuItemState(210410,'regular');	//CUT
	}
	//Show paste option only if something has been cut
	if(myMoveAction.movableItemType==null)
		setMenuItemState(210430,'disabled');
	else
		setMenuItemState(210430,'regular');

	if(cbCatTableCurrentParent==1)
	{
		setMenuItemState(210310,'disabled');	//UP
		setMenuItemState(210320,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(210310,'regular');	//UP
		setMenuItemState(210320,'regular');	//TOP
	}
	//Finally set the menu permissions if we missed earlier
	setMenuPermissions(currentMenuBar,null);
};
/**********************************************************/
/*
 * Ajax call to populate cbCat at level $id$
 */

function callCbCatAjax(id) {
	if(document.getElementById(cbCatTablecontainer)==null) return;
	if(cbCatPropertiesWindow!=null) cbCatPropertiesWindow.close();
	var myCbCatRequest=getHTMLHTTPRequest();
	cbCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20210+"&parent="+id+"&method="+"get";

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
	writeWaitMsg(cbCatTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myCbCatRequest.send(null);
}


function renderCbCat(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(cbCatTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='100%'>Description</td><td>D</td><td>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(cbCatTablecontainer).innerHTML=str;
	//Update the cbCat navigation bar
	updateCbCatNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
}
/*
 * Update navigation bar for CbCat Table according to current level
 */
var updateCbCatNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		cbCatTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callCbCatAjax("+cbCatTableparent+")'><img src='images/costbook/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callCbCatAjax("+cbCatTableTop+")'><img src='images/costbook/top.png' border='0' alt='Top level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCbCatAddWindow(\""+TABLE_NAME+"\",\"cbCat\");'>Add Category</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCbCatAddWindow(\""+TABLE_NAME+"\",\"cb\");'>Add CostBook</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCbCatEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
	}
	else
	{
		str+="<td><img src='images/costbook/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/costbook/top1.png' alt='Top level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCbCatAddWindow(\""+TABLE_NAME+"\",\"cbCat\");'>Add Category</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCbCatAddWindow(\""+TABLE_NAME+"\",\"cb\");'>Add CostBook</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCbCatEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		cbCatTableparent=1;
	}
	str+="<td>&nbsp;</td><td align='right'><input type='button' name='search' value='Search' onclick='populateSearchWin();'/></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
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
		addRowToTable1(tbl,rowToInsertAt,param);
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
	//Highlight Search
	if(param[1]==sid)
		row.className='searchClass';
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[0]=="cbCat")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callCbCatAjax("+param[1]+")'><img src='images/costbook/folder.gif' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='initCostBookWin(false,"+param[1]+",\""+param[2]+"\")'><img src='images/costbook/costbook.png' border='0'></a>";
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

	//Cell4: Checkbox
	cell[4]=row.insertCell(4);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[4].appendChild(checkBox);

	//cell5:Radio Button
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
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Cbs Asynchronously using Ajax
 */

function callDeleteCbCatAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myCbCatDeleteRequest=getHTMLHTTPRequest();
	var myDelTable=tbl;
	var myDelRowsArray=obj;
	var myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	var id1="";
	for(var i=0; i<obj.length; i++) {
		if(obj[i].myRow.content[7]=="cbCat" && id=="")
			id+=obj[i].myRow.content[6];
		else if(obj[i].myRow.content[7]=="cb" && id1=="")
			id1+=obj[i].myRow.content[6];
		else
		{
			if(obj[i].myRow.content[7]=="cbCat")
				id+=","+obj[i].myRow.content[6];
			else
				id1+=","+obj[i].myRow.content[6];
		}
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20220+"&cbcatid="+URLEncode(id)+"&cbid="+URLEncode(id1)+"&method="+"delete";
	myCbCatDeleteRequest.open("GET",url,true);
	myCbCatDeleteRequest.onreadystatechange=function()
	{
		if(myCbCatDeleteRequest.readyState==4) {
			if(myCbCatDeleteRequest.status==200) {
				var xmlDoc=myCbCatDeleteRequest.responseXML;
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
				else if(statusFlag==2){
					alert("DELETE: System Error");
				}
			}
			else {
				alert("Connection Problem:"+myCbCatDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myCbCatDeleteRequest.send(null);
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
			cCount++;
		}
	}
	if (checkedObjArray.length > 0) {
		var rIndex = checkedObjArray[0].sectionRowIndex;
		callDeleteCbCatAjax(tbl,checkedObjArray,rIndex);
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
	//TR->TBODY->TABLE
	var tbl=checkedObjArray[0].parentNode.parentNode;
	var rIndex = checkedObjArray[0].sectionRowIndex;
	callDeleteCbCatAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Edit Cbs Asynchronously using Ajax
 */
var cbCatPropertiesWindowDiv="blankHidden";
var cbCatPropertiesWindowTitle="Properties";
var cbCatPropertiesWindowId="cbCatPropertiesWindowId";
var indexOfRowToEdit=-1;
var rowToEdit=null;

var myContextCbCatEditWindow=function() {
	indexOfRowToEdit=-1;		//Global Scope
	rowToEdit=null;				//Global Scope
	var srcObj=contextMenu.srcElement;
	while(true)
	{
		rowToEdit=srcObj.parentNode;
		if(rowToEdit.tagName!="TR") {
			srcObj=rowToEdit;
			continue;
		}
		else break;
	}
	if(rowToEdit!=null)
		populateCbCatEditWin();
};

var myCbCatEditWindow=function(tblId) {
	var tbl=document.getElementById(tblId);
	indexOfRowToEdit=-1;	//Global Scope
	rowToEdit=null;			//Global Scope
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow && tbl.tBodies[0].rows[i].myRow.content[1].getAttribute('type') == 'radio' && tbl.tBodies[0].rows[i].myRow.content[1].checked) {
			indexOfRowToEdit=i;
			rowToEdit=tbl.tBodies[0].rows[i];	//Global Scope
		}
	}

	if(rowToEdit!=null)
		populateCbCatEditWin();
};

var populateCbCatEditWin=function() {
	var innerStr="<table>";
	if(rowToEdit!=null) {
		if(rowToEdit.myRow.content[7]=="cbCat")
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditCbCatAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='cbCatPropertiesWindow.close()'>Discard</a></td></tr>";
		}
		else
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditCbCatAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='cbCatPropertiesWindow.close()'>Discard</a></td></tr>";

		}
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(cbCatPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyCbCatPropertiesWin();
};

var openMyCbCatPropertiesWin=function() {

	cbCatPropertiesWindow=internalWindow.open('cbCatPropertiesWindowId', 'div', cbCatPropertiesWindowDiv, '#Properties Window', 'width=450px,height=350px,left=200px,top=150px,resize=1,scrolling=1');
};

var myCbCatUpdateData="";
var myCbCatEditRequest=getHTMLHTTPRequest();
var callEditCbCatAjax=function() {
	var myRandom=parseInt(Math.random()*99999999);
	var myCbCatUpdateData="";
	var method;
	if(rowToEdit.myRow.content[7]=="cbCat")
	{
		method="updateCbCat";
		myCbCatUpdateData="id="+rowToEdit.myRow.content[6];
		myCbCatUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myCbCatUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myCbCatUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		method="updateCb";
		myCbCatUpdateData="id="+rowToEdit.myRow.content[6];
		myCbCatUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myCbCatUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myCbCatUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20230+"&method="+method;
	myCbCatEditRequest.open('POST', url, true);
	myCbCatEditRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myCbCatEditRequest.setRequestHeader("Content-length", myCbCatUpdateData.length);
	myCbCatEditRequest.onreadystatechange=updateCbCatAction;
	openSplashScreen();
	myCbCatEditRequest.send(myCbCatUpdateData);

};

function updateCbCatAction() {
	if(myCbCatEditRequest.readyState==4) {
		if(myCbCatEditRequest.status==200) {
			var xmlDoc=myCbCatEditRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				if(rowToEdit.myRow.content[7]=="cbCat")
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8]=document.getElementById('editRemarks').value;
				}
				else
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8]=document.getElementById('editRemarks').value;
				}
			}
			else if(statusFlag==2) {
				alert("EDIT: System Error");
			}
			cbCatPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myCbCatEditRequest.statusText);
			cbCatPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}


/**********************************************************/
/*
 * Add new row
 */
var myCbCatTable=null;
var myCbCatAddWindow=function(tblId,type) {
	var tbl=document.getElementById(tblId);
	myCbCatTable=tbl;
	populateCbCatAddWin(type);
};


var populateCbCatAddWin=function(type) {
	var innerStr="<table>";
	if(type=="cbCat")
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddCbCatAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='cbCatPropertiesWindow.close()'>Discard</a></td></tr>";
	}
	else
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddCbCatAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='cbCatPropertiesWindow.close()'>Discard</a></td></tr>";

	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(cbCatPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyCbCatPropertiesWin();
};

var myCbCatAddData="";
var myCbCatAddRequest=getHTMLHTTPRequest();
var callAddCbCatAjax=function(type) {
	var myRandom=parseInt(Math.random()*99999999);
	if(type=="cbCat")
	{
		method="addCbCat";
		myCbCatAddData="id="+cbCatTableCurrentParent;
		myCbCatAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myCbCatAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myCbCatAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		method="addCb";
		myCbCatAddData="id="+cbCatTableCurrentParent;
		myCbCatAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myCbCatAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myCbCatAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20240+"&method="+method;
	myCbCatAddRequest.open('POST', url, true);
	myCbCatAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myCbCatAddRequest.setRequestHeader("Content-length", myCbCatAddData.length);
	myCbCatAddRequest.onreadystatechange=addCbCatAction;
	openSplashScreen();
	myCbCatAddRequest.send(myCbCatAddData);

};

function addCbCatAction() {
	if(myCbCatAddRequest.readyState==4) {
		if(myCbCatAddRequest.status==200) {
			var xmlDoc=myCbCatAddRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				var newId=xmlDoc.getElementsByTagName("key")[0].getAttribute("value");
				var type=xmlDoc.getElementsByTagName("key")[0].getAttribute("type");
				var param=Array();
				var rowNum=0;
				if(type=='cb')
				{
					param[0]="cb";		//Row type
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editRemarks').value;
					param[5]=""+cbCatTableCurrentParent;
					rowNum=getMaxCbRow();
				}
				else
				{
					param[0]="cbCat";		//Row type is cbCat
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editRemarks').value;
					param[5]=""+cbCatTableCurrentParent;
					rowNum=getMaxCbCatRow();
				}

				addRowToTable1(myCbCatTable,rowNum,param);
				reorderRows(myCbCatTable, rowNum);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
			cbCatPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myCbCatAddRequest.statusText);
			cbCatPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}

var getMaxCbRow=function() {
	var tbl=myCbCatTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="cb" && rowNum<=i)
			rowNum=i;

	}
	if(rowNum==-1)
	{
		for (i=0; i<tbl.tBodies[0].rows.length; i++) {
			if(tbl.tBodies[0].rows[i].myRow.content[7]=="cbCat" && rowNum<=i)
				rowNum=i;

		}
	}
	return rowNum+1;
};

var getMaxCbCatRow=function() {
	var tbl=myCbCatTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="cbCat" && rowNum<=i)
			rowNum=i;
	}
	return rowNum+1;
};

/**********************************************************/
/*
 * Edit Prices of Assemblies and Items
 */

var initCostBookWin=function(context,ref,name) {
	var costBookName;
	var costBookId;
	if(context==true)			//If requested through context menu
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
		costBookId=tmp.myRow.content[6];
		costBookName=tmp.myRow.content[4].data;
	}
	else
	{
		costBookId=ref;
		costBookName=name;
	}
	//alert(name);

	//openCostBookOptionsWindow();
	//
	var rateAnalysisWindowId="costBook"+costBookId;
	//alert("Opening CB Window: "+rateAnalysisWindowId);
	internalWindow.open(rateAnalysisWindowId, "iframe","MyActionDispatcher?path=20251&method=get&id="+costBookId , "Analysis of Rates for: ["+costBookName+"]",'width=900px,height=600px,left=10px,top=10px,resize=1,scrolling=1');
};




/**********************************************************/
/*
 * Move Costbook from one directory to other
 */
var myParamsForMovableItem=new Array();
var cutContextSelected=function() {
	//Re-init the global object
	myMoveAction.reInit();
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
	var tmpArr=new Array();
	if(row.myRow.content[7]=="cbCat")
	{
		//Params: type,id, parentId
		myMoveAction.cut("cbCat",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="cbCat";		   					//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8];			//REMARKS
		tmpArr[5]=""+row.myRow.content[9];			//PARENT
	}
	else if(row.myRow.content[7]=="cb")
	{
		//Params: type,id, parentId
		myMoveAction.cut("cb",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="cb";		   						//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8];			//REMARKS
		tmpArr[5]=""+row.myRow.content[9];			//PARENT
	}
	myMoveAction.initParams(tmpArr);
};

var callPasteToLocationAjax=function() {
	myMoveAction.verify=function() {
		if(this.movableItemType=="cbCat")
		{
			if(this.movableItemId==this.movableToParentId)
			{
				alert("Cannot move selected to it's own subtree");
				return false;
			}
			if(this.movableFromCurrentParentId==this.movableToParentId)
			{
				alert("Please chose a different location");
				return false;
			}
		}
		else if(this.movableItemType=="cb")
		{
			if(this.movableFromCurrentParentId==this.movableToParentId)
			{
				alert("Please chose a different location");
				return false;
			}
		}
		return true;
	};

	if(myMoveAction.paste(cbCatTableCurrentParent)==false)
		return;
	var id=""+myMoveAction.movableItemId;
	var type=""+myMoveAction.movableItemType;
	var pid=""+myMoveAction.movableFromCurrentParentId;
	var newPid=""+myMoveAction.movableToParentId;
	var params=myMoveAction.paramArray;
	if(type=="cb")
	{
		//alert(params.length);
		params[5]=newPid;
	}
	else if(type=="cbCat")
	{
		//alert(params.length);
		params[5]=newPid;
	}

	var myAjaxRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20630+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;

	myAjaxRequest.open("GET",url,true);
	myAjaxRequest.onreadystatechange=function() {
		if(myAjaxRequest.readyState==4) {
			if(myAjaxRequest.status==200) {
				var xmlDoc=myAjaxRequest.responseXML;
				var statusFlag=0;
				if(xmlDoc==null) {alert("Data Error");}
				else
				{
					var systemMsg=xmlDoc.getElementsByTagName("status");
					statusFlag=systemStatus(null,systemMsg);
				}
				if(statusFlag==1) {
					//To get row number we need to set this variable
					myCbCatTable=document.getElementById(TABLE_NAME);
					if(type=="cb")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxCbRow(),params);
					else if(type=="cbCat")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxCbCatRow(),params);
				}
				else if(statusFlag==2){
					alert("Move: System Error");
				}
			}
			else {
				alert("Connection Problem:"+myAjaxRequest.statusText);
			}
			myMoveAction.reInit();
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myAjaxRequest.send(null);
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
	projectPropertiesWindow=internalWindow.open('searchWindow', 'div', 'blankHidden1', 'Search CostBooks', 'width=600px,height=400px,left=200px,top=150px,resize=1,scrolling=1');
};

function vaildateKey()
{
	key=document.getElementById('searchKey').value;
	if(key.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchCBAjax();
		//alert(key);
	}
};

function callSearchCBAjax() {
	var mySearchRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20210+"&key="+searchString+"&method="+"searchCostBook";
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
	innerStr+="<table id='searchTable' width='100%' class='contentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td>Description</td></tr></thead>";
	innerStr+="<tbody id='searchbody'></tbody></table>";
	document.getElementById('searchResult').innerHTML=innerStr;
	populateSearchTable(xmlDoc,'searchTable');
	var bodyText=document.getElementById('searchResult').innerHTML;
	document.getElementById('searchResult').innerHTML=doHighlight(bodyText, key);
	addTableRolloverEffect('searchTable','tableRollOverEffect2','tableRowClickEffect2');
}



var populateSearchTable=function (xmlDoc,tableName) {
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
		addRowToSearchTable(tbl,rowToInsertAt,param);
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

	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[0]=="cbCat")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callCbCatAjax("+param[5]+")'><img src='images/costbook/folder.gif' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callCbCatAjax("+param[5]+")'><img src='images/costbook/costbook.png' border='0'></a>";
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

/**********************************************************/
/*
 * Init the first level
 */
//callCbCatAjax(1);
initializeCBTable(10040);