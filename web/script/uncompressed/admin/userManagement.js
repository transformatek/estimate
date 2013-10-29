/**********************************************************
 * Creates basic facilities for System Administration
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

var userTablecontainer="blankContent";	//this DIV will contain our user

//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="userSample";			//Should be named in HTML
var DIV_NAV_NAME="userNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="USR_TTHEAD123";				
var ctx_TBODY="USR_TTBODY123";
/* ============================================================= */
/*
 * Initializes Context Menu for Users Table
 * and then populates the table
 */
var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			//getContextMenuModel();
			callUserAjax();
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeUserManagementTable=function(id)
{
	myCurrentMenuParent=id;
	writeWaitMsg(userTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");
	
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
		setMenuItemState(211920,'disabled');	//DELETE
		setMenuItemState(211940,'disabled');	//ACCESS
	}
	else
	{
		setMenuItemState(211920,'regular');	//DELETE
		setMenuItemState(211940,'regular');	//ACCESS
	}
	//Finally set the menu permissions if we missed earlier
	setMenuPermissions(currentMenuBar);
};

/**********************************************************/
/*
 * Ajax call to populate user at level $id$
 */
function callUserAjax() {
	if(document.getElementById(userTablecontainer)==null) return;
	var myUserRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20910+"&method="+"getUsers";

	myUserRequest.open("GET",url,true);
	myUserRequest.onreadystatechange=function()
	{
		if(myUserRequest.readyState==4) {
			if(myUserRequest.status==200) {
				renderUser(myUserRequest);
			}
			else {
				alert("Connection Problem:"+myUserRequest.statusText);
			}
		}
	};
	writeWaitMsg(userTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myUserRequest.send(null);
}

function renderUser(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(userTablecontainer,systemMsg);
	if(errorFlag==0) return;
	
	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='10%'>userID</td><td width='15%'>Full Name</td><td width='15%'>Employee Code</td><td width='100%'>Remarks</td><td>D</td><td>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(userTablecontainer).innerHTML=str;
	//Update the user navigation bar
	updateUserNav(xmlDoc,DIV_NAV_NAME);
	populateTable(xmlDoc,TABLE_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
}
/*
 * Update navigation bar for User Table according to current level
 */
var updateUserNav=function (xmlDoc,element) {
	var str="<table class='navTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myUserAddWindow(\""+TABLE_NAME+"\");'>Add User</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myUserAccesRightsWindow(\""+TABLE_NAME+"\");'>Access&nbsp;Rights[E]</a></td>";
	str+="<td>Filter: <input name='filter' onKeyUp='filter(this, \""+TABLE_NAME+"\")' type='text'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("user");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;
		param[1]=content[i].childNodes[1].firstChild.data;
		param[2]=content[i].childNodes[2].firstChild.data;
		param[3]=content[i].childNodes[3].firstChild.data;
		param[4]=content[i].childNodes[4].firstChild.data;
		//addRowToTable(tbl,rowToInsertAt,content[i]);
		addRowToTable1(tbl,-1,param);
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
	cell[0].innerHTML="<img src='images/admin/user.png' border='0'>";
	
	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: Name
	cell[2]=row.insertCell(2);
	var name=document.createTextNode(param[1]);
	cell[2].appendChild(name);

	//Cell3:Full Name
	cell[3]=row.insertCell(3);
	var fullName=document.createTextNode(param[2]);
	cell[3].appendChild(fullName);

	//Cell4: Employee Code
	cell[4]=row.insertCell(4);
	var empCode=document.createTextNode(param[4]);
	cell[4].appendChild(empCode);

	//Cell5: Remarks
	cell[5]=row.insertCell(5);
	var remarks=document.createTextNode(param[3]);
	cell[5].appendChild(remarks);

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
	rowContents[1]=radio;					//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	rowContents[4]=name;
	rowContents[5]=fullName;
	rowContents[6]=empCode;
	rowContents[7]=remarks;			//Remarks
	rowContents[8]=param[0];			//ID
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Users Asynchronously using Ajax
 */

function callDeleteUserAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myDelTable;
	var myDelRowsArray=Array();
	var myDelrIndex;
	var myUserDeleteRequest=getHTMLHTTPRequest();
	myDelTable=tbl;
	myDelRowsArray=obj;
	myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	for(var i=0; i<obj.length; i++) {
		if(id=="")
			id+=obj[i].myRow.content[8];
		else
			id+=","+obj[i].myRow.content[8];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20920+"&userIds="+id+"&method="+"deleteUsers";
	myUserDeleteRequest.open("GET",url,true);
	myUserDeleteRequest.onreadystatechange=function()
	{
		if(myUserDeleteRequest.readyState==4) {
			if(myUserDeleteRequest.status==200) {
				var xmlDoc=myUserDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myUserDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myUserDeleteRequest.send(null);
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
		callDeleteUserAjax(tbl,checkedObjArray,rIndex);
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
	callDeleteUserAjax(tbl,checkedObjArray,rIndex);
};


/**********************************************************/
/*
 * Add new row
 */
var userPropertiesWindowDiv="blankHidden";
var userPropertiesWindow=null;
var userPropertiesWindowTitle="Properties";
var userPropertiesWindowId="userPropertiesWindowId";
var indexOfRowToEdit=-1;
var rowToEdit=null;

var myUserTable=null;
var myUserAddWindow=function(tblId) {
	var tbl=document.getElementById(tblId);
	myUserTable=tbl;
	populateUserAddWin();
};

var populateUserAddWin=function() {
	var innerStr="<table>";
	innerStr+="<tr><td><label>userID:</label></td><td><input size='40' type='text' id='editUserID' value='id'></td></tr>";
	innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
	innerStr+="<tr><td><label>Employee Code:</label></td><td><input size='40' type='text' id='editEmployeeCode' value='-'></td></tr>";
	innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
	innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddUserAjax();'>Add</a>&nbsp;&nbsp;";
	innerStr+="<a href='javascript:void(0)' onclick='userPropertiesWindow.close()'>Discard</a></td></tr>";

	innerStr+="</table>";
	var editableDiv=document.getElementById(userPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyUserPropertiesWin();
};

var openMyUserPropertiesWin=function() {

	userPropertiesWindow=internalWindow.open(userPropertiesWindowId, 'div', userPropertiesWindowDiv, '#Properties Window', 'width=450px,height=300px,left=200px,top=150px,resize=1,scrolling=1');
};

var myUserAddData="";
var myUserAddRequest=getHTMLHTTPRequest();
var callAddUserAjax=function() {
	var myRandom=parseInt(Math.random()*99999999);
	method="addNewUser";
	myUserAddData="userId="+URLEncode(document.getElementById('editUserID').value);
	myUserAddData+="&name="+URLEncode(document.getElementById('editName').value);
	myUserAddData+="&employeeCode="+URLEncode(document.getElementById('editEmployeeCode').value);
	myUserAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20930+"&method="+method;
	myUserAddRequest.open('POST', url, true);
	myUserAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myUserAddRequest.setRequestHeader("Content-length", myUserAddData.length);
	myUserAddRequest.onreadystatechange=addUserAction;
	openSplashScreen();
	myUserAddRequest.send(myUserAddData);

};

function addUserAction() {
	if(myUserAddRequest.readyState==4) {
		if(myUserAddRequest.status==200) {
			var xmlDoc=myUserAddRequest.responseXML;
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

				param[0]=""+newId;
				param[1]=document.getElementById('editUserID').value;
				param[2]=document.getElementById('editName').value;
				param[3]=document.getElementById('editRemarks').value;
				param[4]=document.getElementById('editEmployeeCode').value;

				addRowToTable1(myUserTable,-1,param);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
			userPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myUserAddRequest.statusText);
			userPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}


/**********************************************************/
/*
 * Init the first level
 */
//callUserAjax();
initializeUserManagementTable(10350);

/**********************************************************/
/*
 * Edit User Access Permissions
 */


var myContextUserAccesRightsWindow=function() {
	var rowToEdit=null;
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
	if(rowToEdit!=null) {
		populateAccessEditWin(rowToEdit);
	}
};

var myUserAccesRightsWindow=function(tblId) {
	var tbl=document.getElementById(tblId);
	//indexOfRowToEdit=-1;
	var rowToEdit=null;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow && tbl.tBodies[0].rows[i].myRow.content[1].getAttribute('type') == 'radio' && tbl.tBodies[0].rows[i].myRow.content[1].checked) {
			rowToEdit=tbl.tBodies[0].rows[i];
		}
	}
	if(rowToEdit!=null) {
		populateAccessEditWin(rowToEdit);
	}
};

var userId;									//Referenced User Id
var userName;								//Referenced User Name
var permissionManagerContainer="blankHidden2";	//Main div containing the DHTML window
var PERMOptionsContainer='permOptions';				//Contains link to assembly/item menu
var PERMInnnerContainer="innerPERMContainer";		//Main inner window
var permOptionsWindow;
var permOptionsWindowId="permCatOptionsWindowId";

var PERMINNER_TABLE_NAME="permInnerSample";			//Should be named in HTML
var PERMINNER_DIV_NAV_NAME="permInnerNavDiv";			//Navigation Bar

var populateAccessEditWin=function(row) {
	if(document.getElementById(permissionManagerContainer)==null) return;
	var menuWindowId="menuWindowId"+row.myRow.content[8];
	userId=row.myRow.content[8];
	var title="Permissions for: [ "+row.myRow.content[4].data+" ]";
	userName=row.myRow.content[4].data;
	var div=document.getElementById(permissionManagerContainer);
	div.innerHTML="<div id='"+PERMOptionsContainer+"'>"+row.myRow.content[4].data+"</div>";
	openMenuPermissionTable();
	permOptionsWindow=internalWindow.open(permOptionsWindowId, 'div', permissionManagerContainer, title, 'width=750px,height=400px,left=200px,top=150px,resize=1,scrolling=1');
};

/**********************************************************/
/*
 * Open MENU Tab
 */

var menuTableparent=1;	//Up one level
var menuTableTop=1;		//Top Level
var menuTableCurrentParent=1;				//parent of current level
var menuTablecontainer=PERMOptionsContainer;	//this DIV will contain our menu


var openMenuPermissionTable=function() {
	callMenuAjax(1);
};

/*
 * Ajax call to populate menu at level $id$
 */

function callMenuAjax(id) {
	if(document.getElementById(menuTablecontainer)==null) return;
	var myMenuRequest=getHTMLHTTPRequest();
	menuTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20940+"&parent="+id+"&userId="+userId+"&method="+"getMenuPermissions";
	myMenuRequest.open("GET",url,true);
	myMenuRequest.onreadystatechange=function()
	{
		if(myMenuRequest.readyState==4) {
			if(myMenuRequest.status==200) {
				renderMenu(myMenuRequest);
			}
			else {
				alert("Connection Problem:"+myMenuRequest.statusText);
			}
		}
	};
	writeWaitMsg(menuTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");
	myMenuRequest.send(null);
}


function renderMenu(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(menuTablecontainer,systemMsg);
	if(errorFlag==0) return;
	
	var str="";
	str+="<div id='"+PERMINNER_DIV_NAV_NAME+"'></div>";
	str+="<table id='"+PERMINNER_TABLE_NAME+"' width='97%' class='innerContentTable'><thead id='PERMTThead'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='100%'>Description<td width='16px'>&nbsp;</td><td width='16px'>&nbsp;</td></tr></thead>";
	str+="<tbody id='PERMTTbody'></tbody></table>";
	document.getElementById(menuTablecontainer).innerHTML=str;
	//Update the menu navigation bar
	updateMenuNav(xmlDoc,PERMINNER_DIV_NAV_NAME);
	populateMenuTable(xmlDoc,PERMINNER_TABLE_NAME);
	addTableRolloverEffect(PERMINNER_TABLE_NAME,'tableRollOverEffect2','tableRowClickEffect2');
}

/*
 * Update navigation bar for Menu Table according to current level
 */
var updateMenuNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='innerNavTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		menuTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callMenuAjax("+menuTableparent+")'><img src='images/admin/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callMenuAjax("+menuTableTop+")'><img src='images/admin/top.png' border='0' alt='Top level'></a></td>";
	}
	else
	{
		str+="<td><img src='images/admin/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/admin/top1.png' alt='Top level'></td>";
		menuTableparent=1;
	}
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateMenuTable=function (xmlDoc,tableName) {
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
		param[4]=content[i].childNodes[4].firstChild.data;
		addRowToTable10(tbl,-1,param);
	}
};

/**********************************************************/
/*
 * add a new row at index $num$ using params $param$ into table $tbl$
 */
var addRowToTable10=function (tbl,num,param) {
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
	cell[0].innerHTML="<a href='javascript:void(0);' onclick='callMenuAjax("+param[0]+")'><img src='images/admin/application.png' border='0' width='16' height='16'></a>";

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

	//Cell4: Image
	cell[4] = row.insertCell(4);
	if(param[3]=="1")
		cell[4].innerHTML="<a href='javascript:void(0);' onclick='callUpdateMenuPermissionsAjax(event)'><img src='images/admin/icon_status_green_light.gif' border='0'></a>";
	else
		cell[4].innerHTML="<a href='javascript:void(0);'><img src='images/admin/icon_status_green.gif' border='0'></a>";
	
	//Cel5: Image
	cell[5] = row.insertCell(5);
	if(param[3]=="0")
		cell[5].innerHTML="<a href='javascript:void(0);' onclick='callUpdateMenuPermissionsAjax(event)'><img src='images/admin/icon_status_red_light.gif' border='0'></a>";
	else
		cell[5].innerHTML="<a href='javascript:void(0);'><img src='images/admin/icon_status_red.gif' border='0'></a>";

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
	rowContents[7]=param[4];			//PARENT
	rowContents[8]=param[3];			//PERMISSION
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};


//var cbUpdateFlag;
var callUpdateMenuPermissionsAjax=function(e) {
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
	var menuId=row.myRow.content[6];
	var permission=row.myRow.content[8]=="0"?"1":"0";
	var confirmationStr=(permission=="1"?"Block":"Grant")+" access to ["+row.myRow.content[4].data+"] for user: "+userName+"?";
	if(!window.confirm(confirmationStr)) return;
	var myUpdateMenuPermissionRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20950+"&userId="+userId+"&menuId="+menuId+"&permission="+permission+"&method="+"updateMenuPermission";

	myUpdateMenuPermissionRequest.open("GET",url,true);
	myUpdateMenuPermissionRequest.onreadystatechange=function()
	{
		updateMenuPermissionAction(myUpdateMenuPermissionRequest,row);
	};
	openSplashScreen();
	myUpdateMenuPermissionRequest.send(null);
};

var updateMenuPermissionAction=function(request,row) {
	if(request.readyState==4) {
		if(request.status==200) {
			var xmlDoc=request.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1)
			{
				row.myRow.content[8]=(row.myRow.content[8]=="0")?"1":"0";
				
				if(row.myRow.content[8]=="1")
					row.cells[4].innerHTML="<a href='javascript:void(0);' onclick='callUpdateMenuPermissionsAjax(event)'><img src='images/admin/icon_status_green_light.gif' border='0'></a>";
				else
					row.cells[4].innerHTML="<a href='javascript:void(0);'><img src='images/admin/icon_status_green.gif' border='0'></a>";
				
				if(row.myRow.content[8]=="0")
					row.cells[5].innerHTML="<a href='javascript:void(0);' onclick='callUpdateMenuPermissionsAjax(event)'><img src='images/admin/icon_status_red_light.gif' border='0'></a>";
				else
					row.cells[5].innerHTML="<a href='javascript:void(0);'><img src='images/admin/icon_status_red.gif' border='0'></a>";
			}
			else if(statusFlag==2)
			{
				alert("UPDATE: System Error");
			}
		}
		else {
			alert("Connection Problem:"+request.statusText);
		}
		closeSplashScreen();
	}
};