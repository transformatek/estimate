/**********************************************************
 * Basic routines for management of Contacts: employees, vendors, clients
 * Copyright (C) 2010  Amit Kumar(amitkriit@gmail.com)
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
var contCatTableparent=1;	//Up one level
var contCatTableTop=1;		//Top Level
var contCatTableCurrentParent=1;			//parent of current level
var contCatTablecontainer="blankContent";	//this DIV will contain our contCat
var contCatPropertiesWindow=null;			//Handle to properties(Add/edit) window
//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="contactCatSample";			//Should be named in HTML
var DIV_NAV_NAME="contactCatNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="CONT_TTHEAD123";				
var ctx_TBODY="CONT_TTBODY123";

/*
 * For Search
 */
var key='qwerty';
var sid=0;
/* ============================================================= */
/*
 * Initializes Context Menu for Contacts Table
 * and then populates the table
 */


var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			//getContextMenuModel();
			callContactsAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeContactsTable=function(id)
{
	myCurrentMenuParent=id;
	writeWaitMsg(contCatTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

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
		setMenuItemState(212880,'disabled');	//EDIT
		setMenuItemState(212890,'disabled');	//DELETE
		setMenuItemState(212910,'disabled');	//CUT
		setMenuItemState(212950,'disabled');	//Show Detail
	}
	else
	{
		setMenuItemState(212950,'regular');	//Show Detail
		setMenuItemState(212880,'regular');	//EDIT
		setMenuItemState(212890,'regular');	//DELETE
		setMenuItemState(212910,'regular');	//CUT
	}
	//Show paste option only if something has been cut
	if(myMoveAction.movableItemType==null)
		setMenuItemState(212930,'disabled');
	else
		setMenuItemState(212930,'regular');

	if(contCatTableCurrentParent==1)
	{
		setMenuItemState(212810,'disabled');	//UP
		setMenuItemState(212820,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(212810,'regular');	//UP
		setMenuItemState(212820,'regular');	//TOP
	}
	//Impose Menu Permissions
	setMenuPermissions(currentMenuBar);
};

/**********************************************************/
/*
 * Ajax call to populate contCat at level $id$
 */

function callContactsAjax(id) {
	if(document.getElementById(contCatTablecontainer)==null) return;
	if(contCatPropertiesWindow!=null) contCatPropertiesWindow.close();
	var myContCatRequest=getHTMLHTTPRequest();
	contCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+30020+"&parent="+id+"&method="+"get";
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
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='45%'>Description</td><td width='15%'>Address</td><td width='15%'>Number</td><td>D</td><td>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(contCatTablecontainer).innerHTML=str;
	//Update the contCat navigation bar
	updateContCatNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
}
/*
 * Update navigation bar for ContCat Table according to current level
 */
var updateContCatNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		contCatTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callContactsAjax("+contCatTableparent+")'><img src='images/utilities/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callContactsAjax("+contCatTableTop+")'><img src='images/utilities/top.png' border='0' alt='Top level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatAddWindow(\""+TABLE_NAME+"\",\"contactCat\");'>Add Directory</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatAddWindow(\""+TABLE_NAME+"\",\"contact\");'>Add Contact</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
	}
	else
	{
		str+="<td><img src='images/utilities/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/utilities/top1.png' alt='Top level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatAddWindow(\""+TABLE_NAME+"\",\"contactCat\");'>Add Directory</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatAddWindow(\""+TABLE_NAME+"\",\"contact\");'>Add Contact</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myContCatEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		contCatTableparent=1;
	}
	str+="<td>&nbsp;</td><td align='right'><input type='button' name='search' value='Search' onclick='populateSearchWin();'/></td></tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
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
		addRowToTable1(tbl,rowToInsertAt,param);
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
	if(param[0]=="contactCat")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callContactsAjax("+param[1]+")'><img src='images/utilities/folder.gif' border='0'></a>";
	else
		//cell[0].innerHTML="<a href='javascript:void(0);' onclick=''><img src='images/utilities/contact.png' border='0'></a>";
		cell[0].innerHTML="<img src='images/utilities/contact.png' border='0'>";
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

	//Cell6: Checkbox
	cell[6]=row.insertCell(6);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[6].appendChild(checkBox);

	//cell7:Radio Button
	cell[7] = row.insertCell(7);
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
	cell[7].appendChild(radio);

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
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Conts Asynchronously using Ajax
 */

function callDeleteContCatAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myContCatDeleteRequest=getHTMLHTTPRequest();
	var myDelTable=tbl;
	var myDelRowsArray=obj;
	var myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	var id1="";
	for(var i=0; i<obj.length; i++) {
		if(obj[i].myRow.content[7]=="contactCat" && id=="")
			id+=obj[i].myRow.content[6];
		else if(obj[i].myRow.content[7]=="contact" && id1=="")
			id1+=obj[i].myRow.content[6];
		else
		{
			if(obj[i].myRow.content[7]=="contactCat")
				id+=","+obj[i].myRow.content[6];
			else
				id1+=","+obj[i].myRow.content[6];
		}
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+30030+"&contactCatId="+URLEncode(id)+"&contactId="+URLEncode(id1)+"&method="+"delete";
	myContCatDeleteRequest.open("GET",url,true);
	myContCatDeleteRequest.onreadystatechange=function()
	{
		if(myContCatDeleteRequest.readyState==4) {
			if(myContCatDeleteRequest.status==200) {
				var xmlDoc=myContCatDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myContCatDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myContCatDeleteRequest.send(null);
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
		callDeleteContCatAjax(tbl,checkedObjArray,rIndex);
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
	callDeleteContCatAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Edit Conts Asynchronously using Ajax
 */
var contCatPropertiesWindowDiv="blankHidden";
var contCatPropertiesWindowTitle="Properties";
var contCatPropertiesWindowId="contCatPropertiesWindowId";
var indexOfRowToEdit=-1;
var rowToEdit=null;

var myContextContCatEditWindow=function() {
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
		populateContCatEditWin();
};

var myContCatEditWindow=function(tblId) {
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
		populateContCatEditWin();
};

var populateContCatEditWin=function() {
	var innerStr="<table>";
	if(rowToEdit!=null) {
		if(rowToEdit.myRow.content[7]=="contactCat")
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditContCatAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Discard</a></td></tr>";
		}
		else
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Description:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Address:</label></td><td><textarea rows='6' cols='30' id='editAddress'>"+rowToEdit.myRow.content[10].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Number:</label></td><td><input size='40' type='text' id='editNumber' value='"+rowToEdit.myRow.content[11].data+"'></td></tr>";
			innerStr+="<tr><td><label>Website:</label></td><td><input size='40' type='text' id='editWebsite' value='"+rowToEdit.myRow.content[12]+"'></td></tr>";
			innerStr+="<tr><td><label>E-Mail:</label></td><td><input size='40' type='text' id='editEmail' value='"+rowToEdit.myRow.content[13]+"'></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditContCatAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Discard</a></td></tr>";

		}
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(contCatPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyContCatPropertiesWin();
};

var openMyContCatPropertiesWin=function() {

	contCatPropertiesWindow=internalWindow.open('contCatPropertiesWindowId', 'div', contCatPropertiesWindowDiv, '#Properties Window', 'width=450px,height=350px,left=200px,top=150px,resize=1,scrolling=1');
};

var myContCatUpdateData="";
var myContCatEditRequest=getHTMLHTTPRequest();
var callEditContCatAjax=function() {
	var myRandom=parseInt(Math.random()*99999999);
	var myContCatUpdateData="";
	var method;
	if(rowToEdit.myRow.content[7]=="contactCat")
	{
		method="updateContactCat";
		myContCatUpdateData="id="+rowToEdit.myRow.content[6];
		myContCatUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myContCatUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myContCatUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		method="updateContact";
		myContCatUpdateData="id="+rowToEdit.myRow.content[6];
		myContCatUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myContCatUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myContCatUpdateData+="&address="+URLEncode(document.getElementById('editAddress').value);
		myContCatUpdateData+="&number="+URLEncode(document.getElementById('editNumber').value);
		myContCatUpdateData+="&website="+URLEncode(document.getElementById('editWebsite').value);
		myContCatUpdateData+="&email="+URLEncode(document.getElementById('editEmail').value);
		myContCatUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+30040+"&method="+method;
	myContCatEditRequest.open('POST', url, true);
	myContCatEditRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myContCatEditRequest.setRequestHeader("Content-length", myContCatUpdateData.length);
	myContCatEditRequest.onreadystatechange=updateContCatAction;
	openSplashScreen();
	myContCatEditRequest.send(myContCatUpdateData);

};

function updateContCatAction() {
	if(myContCatEditRequest.readyState==4) {
		if(myContCatEditRequest.status==200) {
			var xmlDoc=myContCatEditRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				if(rowToEdit.myRow.content[7]=="contactCat")
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8]=document.getElementById('editRemarks').value;
				}
				else
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[10].data=document.getElementById('editAddress').value;
					rowToEdit.myRow.content[11].data=document.getElementById('editNumber').value;
					rowToEdit.myRow.content[12]=document.getElementById('editWebsite').value;
					rowToEdit.myRow.content[13]=document.getElementById('editEmail').value;
					rowToEdit.myRow.content[8]=document.getElementById('editRemarks').value;
				}
			}
			else if(statusFlag==2) {
				alert("EDIT: System Error");
			}
			contCatPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myContCatEditRequest.statusText);
			contCatPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}


/**********************************************************/
/*
 * Add new row
 */
var myContCatTable=null;
var myContCatAddWindow=function(tblId,type) {
	var tbl=document.getElementById(tblId);
	myContCatTable=tbl;
	populateContCatAddWin(type);
};


var populateContCatAddWin=function(type) {
	var innerStr="<table>";
	if(type=="contactCat")
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddContCatAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Discard</a></td></tr>";
	}
	else
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Description:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Address:</label></td><td><textarea rows='6' cols='30' id='editAddress'>-</textarea></td></tr>";
		innerStr+="<tr><td><label>Number:</label></td><td><input size='40' type='text' id='editNumber' value='-'></td></tr>";
		innerStr+="<tr><td><label>Website:</label></td><td><input size='40' type='text' id='editWebsite' value='-'></td></tr>";
		innerStr+="<tr><td><label>E-Mail:</label></td><td><input size='40' type='text' id='editEmail' value='-'></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddContCatAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Discard</a></td></tr>";

	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(contCatPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyContCatPropertiesWin();
};

var myContCatAddData="";
var myContCatAddRequest=getHTMLHTTPRequest();
var callAddContCatAjax=function(type) {
	var myRandom=parseInt(Math.random()*99999999);
	if(type=="contactCat")
	{
		method="addContactCat";
		myContCatAddData="id="+contCatTableCurrentParent;
		myContCatAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myContCatAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myContCatAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		method="addContact";
		myContCatAddData="id="+contCatTableCurrentParent;
		myContCatAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myContCatAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myContCatAddData+="&address="+URLEncode(document.getElementById('editAddress').value);
		myContCatAddData+="&number="+URLEncode(document.getElementById('editNumber').value);
		myContCatAddData+="&website="+URLEncode(document.getElementById('editWebsite').value);
		myContCatAddData+="&email="+URLEncode(document.getElementById('editEmail').value);
		myContCatAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+30050+"&method="+method;
	myContCatAddRequest.open('POST', url, true);
	myContCatAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myContCatAddRequest.setRequestHeader("Content-length", myContCatAddData.length);
	myContCatAddRequest.onreadystatechange=addContCatAction;
	openSplashScreen();
	myContCatAddRequest.send(myContCatAddData);

};

function addContCatAction() {
	if(myContCatAddRequest.readyState==4) {
		if(myContCatAddRequest.status==200) {
			var xmlDoc=myContCatAddRequest.responseXML;
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
				if(type=='contactCat')
				{
					param[0]="contactCat";		//Row type
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editRemarks').value;
					param[5]=""+contCatTableCurrentParent;
					rowNum=getMaxContCatRow();
				}
				else
				{
					param[0]="contact";		//Row type is contCat
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editAddress').value;
					param[5]=document.getElementById('editNumber').value;
					param[6]=document.getElementById('editWebsite').value;
					param[7]=document.getElementById('editEmail').value;
					param[8]=document.getElementById('editRemarks').value;
					param[9]=""+contCatTableCurrentParent;
					rowNum=getMaxContRow();
				}

				addRowToTable1(myContCatTable,rowNum,param);
				reorderRows(myContCatTable, rowNum);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
			contCatPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myContCatAddRequest.statusText);
			contCatPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}

var getMaxContRow=function() {
	var tbl=myContCatTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="contact" && rowNum<=i)
			rowNum=i;
	}
	if(rowNum==-1)
	{
		for (i=0; i<tbl.tBodies[0].rows.length; i++) {
			if(tbl.tBodies[0].rows[i].myRow.content[7]=="contactCat" && rowNum<=i)
				rowNum=i;
		}
	}
	return rowNum+1;
};

var getMaxContCatRow=function() {
	var tbl=myContCatTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="contactCat" && rowNum<=i)
			rowNum=i;
	}
	return rowNum+1;
};


/**********************************************************/
/**********************************************************/
/*
 * Move Contacts from one directory to other
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
	if(row.myRow.content[7]=="contactCat")
	{
		//Params: type,id, parentId
		myMoveAction.cut("contactCat",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="contactCat";		   					//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8];			//REMARKS
		tmpArr[5]=""+row.myRow.content[9];			//PARENT
	}
	else if(row.myRow.content[7]=="contact")
	{
		//Params: type,id, parentId
		myMoveAction.cut("contact",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="contact";		   						//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[10].data;			
		tmpArr[5]=""+row.myRow.content[11].data;			
		tmpArr[6]=""+row.myRow.content[12];
		tmpArr[7]=""+row.myRow.content[13];
		tmpArr[8]=""+row.myRow.content[8];
		tmpArr[9]=""+row.myRow.content[9];
	}
	myMoveAction.initParams(tmpArr);
};

var callPasteToLocationAjax=function() {
	myMoveAction.verify=function() {
		if(this.movableItemType=="contactCat")
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
		else if(this.movableItemType=="contact")
		{
			if(this.movableFromCurrentParentId==this.movableToParentId)
			{
				alert("Please chose a different location");
				return false;
			}
		}
		return true;
	};

	if(myMoveAction.paste(contCatTableCurrentParent)==false)
		return;
	var id=""+myMoveAction.movableItemId;
	var type=""+myMoveAction.movableItemType;
	var pid=""+myMoveAction.movableFromCurrentParentId;
	var newPid=""+myMoveAction.movableToParentId;
	var params=myMoveAction.paramArray;
	if(type=="contact")
	{
		//alert(params.length);
		params[9]=newPid;
	}
	else if(type=="contactCat")
	{
		//alert(params.length);
		params[5]=newPid;
	}

	var myAjaxRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20680+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;

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
					myContCatTable=document.getElementById(TABLE_NAME);
					if(type=="contact")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxContRow(),params);
					else if(type=="contactCat")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxContCatRow(),params);
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

/***********************************************************/

//Show Detail

/***********************************************************/

var rowToDetail=null;

var myContextContCatDetailWindow=function() {
	//indexOfRowToEdit=-1;		//Global Scope
	rowToDetail=null;				//Global Scope
	var srcObj=contextMenu.srcElement;
	while(true)
	{
		rowToDetail=srcObj.parentNode;
		if(rowToDetail.tagName!="TR") {
			srcObj=rowToDetail;
			continue;
		}
		else break;
	}
	if(rowToDetail!=null)
		populateContCatDetailWin();
};
function populateContCatDetailWin(){
	var innerStr="<table width='80%' height='80%' align='center'>";
	if(rowToDetail!=null) {
		//alert(rowToDetail.myRow.content[7])
		if(rowToDetail.myRow.content[7]=="contactCat")
		{
			innerStr+="<tr><td><label>Name:</label></td><td>"+rowToDetail.myRow.content[4].data+"</td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td>"+rowToDetail.myRow.content[5].data+"</td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td>"+rowToDetail.myRow.content[8]+"</td></tr>";
			innerStr+="<tr><td colspan='2' align='center'>";
			innerStr+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Ok</a></td></tr>";
		}
		else
		{
			innerStr+="<tr><td><label>Name:</label></td><td>"+rowToDetail.myRow.content[4].data+"</td></tr>";
			innerStr+="<tr><td><label>Description:</label></td><td>"+rowToDetail.myRow.content[5].data+"</td></tr>";
			innerStr+="<tr><td><label>Address:</label></td><td>"+rowToDetail.myRow.content[10].data+"</td></tr>";
			innerStr+="<tr><td><label>Number:</label></td><td>"+rowToDetail.myRow.content[11].data+"</td></tr>";
			innerStr+="<tr><td><label>Website:</label></td><td>"+rowToDetail.myRow.content[12]+"</td></tr>";
			innerStr+="<tr><td><label>E-Mail:</label></td><td>"+rowToDetail.myRow.content[13]+"</td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td>"+rowToDetail.myRow.content[8]+"</td></tr>";
			innerStr+="<tr><td colspan='2' align='center'>";
			innerStr+="<a href='javascript:void(0)' onclick='contCatPropertiesWindow.close()'>Ok</a></td></tr>";
		}
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(contCatPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyContCatPropertiesWin();
}


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
	projectPropertiesWindow=internalWindow.open('searchWindow', 'div', 'blankHidden1', 'Search Contacts', 'width=600px,height=400px,left=200px,top=150px,resize=1,scrolling=1');
};

function vaildateKey()
{
	key=document.getElementById('searchKey').value;
	if(key.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchContactAjax();
		//alert(key);
	}
}

function callSearchContactAjax() {
	var myContCatRequest=getHTMLHTTPRequest();
	contCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+30020+"&key="+searchString+"&method="+"searchContact";
	myContCatRequest.open("GET",url,true);
	myContCatRequest.onreadystatechange=function()
	{
		if(myContCatRequest.readyState==4) {
			if(myContCatRequest.status==200) {
				renderContSearch(myContCatRequest);
			}
			else {
				alert("Connection Problem:"+myContCatRequest.statusText);
			}
		}
	};
	writeWaitMsg('searchResult',"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myContCatRequest.send(null);
}


function renderContSearch(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus('searchResult',systemMsg);
	if(errorFlag==0) return;
	var str="";
	str+="<table id='searchTable' width='100%' class='contentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='45%'>Description</td><td width='15%'>Address</td><td width='15%'>Number</td></tr></thead>";
	str+="<tbody></tbody></table>";
	document.getElementById('searchResult').innerHTML=str;
	populateContactTable(xmlDoc,'searchTable');
	var bodyText=document.getElementById('searchResult').innerHTML;
	document.getElementById('searchResult').innerHTML=doHighlight(bodyText, key);
	addTableRolloverEffect('searchTable','tableRollOverEffect2','tableRowClickEffect2');
}
var populateContactTable=function (xmlDoc,tableName) {
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
		addRowToContactTable(tbl,rowToInsertAt,param);
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
		addRowToContactTable(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
};
var addRowToContactTable=function (tbl,num,param) {
	var nextRow = tbl.tBodies[0].rows.length;
	var iteration = nextRow + 1;
	if(num==-1) {
		num = nextRow;
	}
	else {
		iteration = num + 1;
	}

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[0]=="contactCat")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callContactsAjax("+param[5]+")'><img src='images/utilities/folder.gif' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callContactsAjax("+param[9]+")'><img src='images/utilities/contact.png' border='0'></a>";
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


	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]='';			//keep it at $1 to access easily
	rowContents[1]='';				//keep it at $2 for easy access
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

/**********************************************************/
/*
 * Init the first level
 */
initializeContactsTable(10130);
//callProjectAjax(1);