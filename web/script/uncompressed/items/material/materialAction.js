/**********************************************************
 * Creates basic facilities for Managing Resources/Bill-of-Material
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
var materialTableparent=1;	//Up one level
var materialTableTop=1;		//Top Level
var materialTableCurrentParent=1;			//parent of current level
var materialTablecontainer="blankContent";	//this DIV will contain our material
var materialPropertiesWindow=null;			//Properties Window(Add/Edit)
//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="materialSample";			//Should be named in HTML
var DIV_NAV_NAME="materialNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="MAT_TTHEAD123";				
var ctx_TBODY="MAT_TTBODY123";
/*
 * For Search
 */
var key='qwerty';
var sid=0;

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
	//.content[7]
	if(tmp.myRow==null)
	{
		setMenuItemState(210200,'disabled');	//EDIT
		setMenuItemState(210210,'disabled');	//DELETE
		setMenuItemState(210230,'disabled');	//CUT
	}
	else
	{
		setMenuItemState(210200,'regular');	//EDIT
		setMenuItemState(210210,'regular');	//DELETE
		setMenuItemState(210230,'regular');	//CUT
	}
	//Show paste option only if something has been cut
	if(myMoveAction.movableItemType==null)
		setMenuItemState(210250,'disabled');
	else
		setMenuItemState(210250,'regular');

	if(materialTableCurrentParent==1)
	{
		setMenuItemState(210130,'disabled');	//UP
		setMenuItemState(210140,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(210130,'regular');	//UP
		setMenuItemState(210140,'regular');	//TOP
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
	if(materialPropertiesWindow!=null) materialPropertiesWindow.close();
	var myMaterialRequest=getHTMLHTTPRequest();
	materialTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20110+"&parent="+id+"&method="+"get";

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
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='65%'>Description</td><td width='100%'>Price</td><td>D</td><td>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(materialTablecontainer).innerHTML=str;
	//Update the material navigation bar
	updateMaterialNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
}
/*
 * Update navigation bar for Material Table according to current level
 */
var updateMaterialNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		materialTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callMaterialAjax("+materialTableparent+")'><img src='images/material/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callMaterialAjax("+materialTableTop+")'><img src='images/material/top.png' border='0' alt='Top level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myMaterialAddWindow(\""+TABLE_NAME+"\",\"category\");'>Add Category</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myMaterialAddWindow(\""+TABLE_NAME+"\",\"item\");'>Add Item</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myMaterialEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
	}
	else
	{
		str+="<td><img src='images/material/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/material/top1.png' alt='Top level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myMaterialAddWindow(\""+TABLE_NAME+"\",\"category\");'>Add Category</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myMaterialAddWindow(\""+TABLE_NAME+"\",\"item\");'>Add Item</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myMaterialEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
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
	var sep;
	var unit;
	if(param[0]=="item")
	{
		price=document.createTextNode(param[5]);
		sep=document.createTextNode("/");
		unit=document.createTextNode(param[4]);
	}
	else
	{
		price=document.createTextNode("-");
		sep=document.createTextNode("");
		unit=document.createTextNode("");
	}
	cell[4].appendChild(price);
	cell[4].appendChild(sep);
	cell[4].appendChild(unit);

	//Cell4: Checkbox
	cell[5]=row.insertCell(5);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[5].appendChild(checkBox);

	//cell5:Radio Button
	cell[6] = row.insertCell(6);
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
	cell[6].appendChild(radio);

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
		rowContents[12]=param[8];	//type
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Items Asynchronously using Ajax
 */

function callDeleteMaterialAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myDelTable;
	var myDelRowsArray=Array();
	var myDelrIndex;
	var myMaterialDeleteRequest=getHTMLHTTPRequest();
	myDelTable=tbl;
	myDelRowsArray=obj;
	myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	var id1="";
	for(var i=0; i<obj.length; i++) {
		if(obj[i].myRow.content[7]=="category" && id=="")
			id+=obj[i].myRow.content[6];
		else if(obj[i].myRow.content[7]=="item" && id1=="")
			id1+=obj[i].myRow.content[6];
		else
		{
			if(obj[i].myRow.content[7]=="category")
				id+=","+obj[i].myRow.content[6];
			else
				id1+=","+obj[i].myRow.content[6];
		}
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20120+"&cid="+URLEncode(id)+"&itid="+URLEncode(id1)+"&method="+"delete";
	myMaterialDeleteRequest.open("GET",url,true);
	myMaterialDeleteRequest.onreadystatechange=function()
	{
		if(myMaterialDeleteRequest.readyState==4) {
			if(myMaterialDeleteRequest.status==200) {
				var xmlDoc=myMaterialDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myMaterialDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myMaterialDeleteRequest.send(null);
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
		callDeleteMaterialAjax(tbl,checkedObjArray,rIndex);
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
	callDeleteMaterialAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Edit Items Asynchronously using Ajax
 */
var materialPropertiesWindowDiv="blankHidden";
var materialPropertiesWindowTitle="Properties";
var materialPropertiesWindowId="materialPropertiesWindowId";
var indexOfRowToEdit=-1;
var rowToEdit=null;

var myContextMaterialEditWindow=function() {
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
		populateMaterialEditWin();
};

var myMaterialEditWindow=function(tblId) {
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
		populateMaterialEditWin();
};

var populateMaterialEditWin=function() {
	var innerStr="<table>";
	if(rowToEdit!=null) {
		if(rowToEdit.myRow.content[7]=="category")
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditMaterialAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='materialPropertiesWindow.close()'>Discard</a></td></tr>";
		}
		else
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";

			innerStr+="<tr><td><label>Type:</label></td>";
			innerStr+="<td><select id='editType'>";
			innerStr+="<option value='Material' "+(rowToEdit.myRow.content[12]=='Material'?"selected='selected'":"")+">Material</option>";
			innerStr+="<option value='ManPower' "+(rowToEdit.myRow.content[12]=='ManPower'?"selected='selected'":"")+">ManPower</option>";
			innerStr+="<option value='Equipment' "+(rowToEdit.myRow.content[12]=='Equipment'?"selected='selected'":"")+">Equipment</option>";
			innerStr+="<option value='Other' "+(rowToEdit.myRow.content[12]=='Other'?"selected='selected'":"")+">Other</option>";
			innerStr+="</select></td></tr>";

			innerStr+="<tr><td><label>Unit:</label></td><td><input size='40' type='text' id='editUnit' value='"+rowToEdit.myRow.content[8].data+"'></td></tr>";
			innerStr+="<tr><td><label>Price:</td><td><input size='40' type='text' id='editPrice' value='"+rowToEdit.myRow.content[9].data+"'></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[10]+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditMaterialAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='materialPropertiesWindow.close()'>Discard</a></td></tr>";

		}
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(materialPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyMaterialPropertiesWin();
};

var openMyMaterialPropertiesWin=function() {

	materialPropertiesWindow=internalWindow.open('materialPropertiesWindowId', 'div', materialPropertiesWindowDiv, '#Properties Window', 'width=450px,height=400px,left=200px,top=150px,resize=1,scrolling=1');
};

var myMaterialUpdateData="";
var myMaterialEditRequest=getHTMLHTTPRequest();
var callEditMaterialAjax=function() {
	var myRandom=parseInt(Math.random()*99999999);
	var myMaterialUpdateData="";
	var method;
	if(rowToEdit.myRow.content[7]=="category")
	{
		method="updateCategory";
		myMaterialUpdateData="id="+rowToEdit.myRow.content[6];
		myMaterialUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myMaterialUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myMaterialUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		method="updateItem";
		myMaterialUpdateData="id="+rowToEdit.myRow.content[6];
		myMaterialUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myMaterialUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myMaterialUpdateData+="&unit="+URLEncode(document.getElementById('editUnit').value);
		myMaterialUpdateData+="&price="+document.getElementById('editPrice').value;
		myMaterialUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
		myMaterialUpdateData+="&itemType="+URLEncode(document.getElementById('editType').value);

		document.getElementById('editType').style.display='none';
		var editType=document.getElementById('editType').value;
		document.getElementById('editType').parentNode.insertBefore(document.createTextNode(editType), document.getElementById('editType'));

	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20130+"&method="+method;
	myMaterialEditRequest.open('POST', url, true);
	myMaterialEditRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myMaterialEditRequest.setRequestHeader("Content-length", myMaterialUpdateData.length);
	myMaterialEditRequest.onreadystatechange=updateMaterialAction;
	openSplashScreen();
	myMaterialEditRequest.send(myMaterialUpdateData);

};

function updateMaterialAction() {
	if(myMaterialEditRequest.readyState==4) {
		if(myMaterialEditRequest.status==200) {
			var xmlDoc=myMaterialEditRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				if(rowToEdit.myRow.content[7]=="category")
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8]=document.getElementById('editRemarks').value;
				}
				else
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8].data=document.getElementById('editUnit').value;
					rowToEdit.myRow.content[9].data=document.getElementById('editPrice').value;
					rowToEdit.myRow.content[10]=document.getElementById('editRemarks').value;
					rowToEdit.myRow.content[12]=document.getElementById('editType').value;
				}
			}
			else if(statusFlag==2) {
				alert("EDIT: System Error");
			}
			materialPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myMaterialEditRequest.statusText);
			materialPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}


/**********************************************************/
/*
 * Add new row
 */
var myMaterialTable=null;
var myMaterialAddWindow=function(tblId,type) {
	var tbl=document.getElementById(tblId);
	myMaterialTable=tbl;
	populateMaterialAddWin(type);
};


var populateMaterialAddWin=function(type) {
	var innerStr="<table>";
	if(type=="category")
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddMaterialAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='materialPropertiesWindow.close()'>Discard</a></td></tr>";
	}
	else
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>Specification</textarea></td></tr>";

		innerStr+="<tr><td><label>Type:</label></td>";
		innerStr+="<td><select id='editType'>";
		innerStr+="<option value='Material'>Material</option>";
		innerStr+="<option value='ManPower'>ManPower</option>";
		innerStr+="<option value='Equipment'>Equipment</option>";
		innerStr+="<option value='Other'>Other</option>";
		innerStr+="</select></td></tr>";

		innerStr+="<tr><td><label>Unit:</label></td><td><input size='40' type='text' id='editUnit' value='Unit'></td></tr>";
		innerStr+="<tr><td><label>Price:</td><td><input size='40' type='text' id='editPrice' value='0.000'></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>Remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddMaterialAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='materialPropertiesWindow.close()'>Discard</a></td></tr>";

	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(materialPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyMaterialPropertiesWin();
};

var myMaterialAddData="";
var myMaterialAddRequest=getHTMLHTTPRequest();
var callAddMaterialAjax=function(type) {
	var myRandom=parseInt(Math.random()*99999999);
	if(type=="category")
	{
		method="addCategory";
		myMaterialAddData="id="+materialTableCurrentParent;
		myMaterialAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myMaterialAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myMaterialAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		method="addItem";
		myMaterialAddData="id="+materialTableCurrentParent;
		myMaterialAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myMaterialAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myMaterialAddData+="&unit="+URLEncode(document.getElementById('editUnit').value);
		myMaterialAddData+="&price="+document.getElementById('editPrice').value;
		myMaterialAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
		myMaterialAddData+="&itemType="+URLEncode(document.getElementById('editType').value);

		document.getElementById('editType').style.display='none';
		var editType=document.getElementById('editType').value;
		document.getElementById('editType').parentNode.insertBefore(document.createTextNode(editType), document.getElementById('editType'));
	}

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20140+"&method="+method;
	myMaterialAddRequest.open('POST', url, true);
	myMaterialAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myMaterialAddRequest.setRequestHeader("Content-length", myMaterialAddData.length);
	myMaterialAddRequest.onreadystatechange=addMaterialAction;
	openSplashScreen();
	myMaterialAddRequest.send(myMaterialAddData);

};

function addMaterialAction() {
	if(myMaterialAddRequest.readyState==4) {
		if(myMaterialAddRequest.status==200) {
			var xmlDoc=myMaterialAddRequest.responseXML;
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
				if(type=='item')
				{
					param[0]="item";		//Row type
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editUnit').value;
					param[5]=document.getElementById('editPrice').value;
					param[6]=document.getElementById('editRemarks').value;
					param[7]=""+materialTableCurrentParent;
					param[8]=document.getElementById('editType').value;
					rowNum=getMaxItemRow();
				}
				else
				{
					param[0]="category";		//Row type is category
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editRemarks').value;
					param[5]=""+materialTableCurrentParent;
					rowNum=getMaxCatRow();
				}

				addRowToTable1(myMaterialTable,rowNum,param);
				reorderRows(myMaterialTable, rowNum);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
			materialPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myMaterialAddRequest.statusText);
			materialPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}

var getMaxItemRow=function() {
	var tbl=myMaterialTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="item" && rowNum<=i)
			rowNum=i;
	}
	if(rowNum==-1)
	{
		for (i=0; i<tbl.tBodies[0].rows.length; i++) {
			if(tbl.tBodies[0].rows[i].myRow.content[7]=="category" && rowNum<=i)
				rowNum=i;

		}
	}
	return rowNum+1;
};

var getMaxCatRow=function() {
	var tbl=myMaterialTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="category" && rowNum<=i)
			rowNum=i;
	}
	return rowNum+1;
};


/**********************************************************/
/*
 * Move Material from one directory to other
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
	if(row.myRow.content[7]=="item")
	{
		//Params: type,id, parentId
		myMoveAction.cut("item",row.myRow.content[6],row.myRow.content[11]);

		tmpArr[0]="item";		   					//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8].data;		//UNIT
		tmpArr[5]=""+row.myRow.content[9].data;		//PRICE
		tmpArr[6]=""+row.myRow.content[10];			//REMARKS
		tmpArr[7]=""+row.myRow.content[11];			//PARENT
	}
	else if(row.myRow.content[7]=="category")
	{
		//Params: type,id, parentId
		myMoveAction.cut("category",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="category";   					//TYPE
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
		if(this.movableItemType=="category")
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
		else if(this.movableItemType=="item")
		{
			if(this.movableFromCurrentParentId==this.movableToParentId)
			{
				alert("Please chose a different location");
				return false;
			}
		}
		return true;
	};

	if(myMoveAction.paste(materialTableCurrentParent)==false)
		return;

	var myAjaxRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var id=myMoveAction.movableItemId;
	var type=myMoveAction.movableItemType;
	var pid=myMoveAction.movableFromCurrentParentId;
	var newPid=myMoveAction.movableToParentId;
	var params=myMoveAction.paramArray;
	if(type=="item")
	{
		params[7]=newPid;
	}
	else if(type=="category")
	{
		params[5]=newPid;
	}

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20620+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;
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
					myMaterialTable=document.getElementById(TABLE_NAME);
					if(type=="item")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxItemRow(),params);
					else if(type=="category")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxCatRow(),params);
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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20110+"&key="+searchString+"&method="+"searchMaterial";
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
	innerStr+="<table id='searchTable' width='100%' class='contentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td>Description</td><td>Price</td></tr></thead>";
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
	var sep;
	var unit;
	if(param[0]=="item")
	{
		price=document.createTextNode(param[5]);
		sep=document.createTextNode("/");
		unit=document.createTextNode(param[4]);
	}
	else
	{
		price=document.createTextNode("-");
		sep=document.createTextNode("");
		unit=document.createTextNode("");
	}
	cell[4].appendChild(price);
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
		rowContents[12]=param[8];	//type
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

/**********************************************************/
/*
 * Init the first level
 */
initializeResourceTable(10020);