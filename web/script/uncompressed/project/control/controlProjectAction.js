/**********************************************************
 * Control-Estimate manipulation
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
var controlProjectTableparent=1;	//Up one level
var controlProjectTableTop=1;		//Top Level
var controlProjectTableCurrentParent=1;			//parent of current level
var controlProjectTablecontainer="blankContent";	//this DIV will contain our controlProject
var controlProjectPropertiesWindow=null;			//Project properties Window(Add/edit project)
var projOptionsWindow=null;							//Window to select estimate(for adding new control estimate)
//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="controlProjectSample";	//Should be named in HTML
var DIV_NAV_NAME="controlProjectNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="CPROJ_TTHEAD123";				
var ctx_TBODY="CPROJ_TTBODY123";

/*
 * For Search
 */
var key='qwerty';
var sid=0;

/*
 * For Search in Project sub-window
 */
var key1='qwerty';
var searchFlag1=false;
/* ============================================================= */
/*
 * Initializes Context Menu for Control Estimate Table
 * and then populates the table
 */
var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			//getContextMenuModel();
			callControlProjectAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeControlProjectTable=function(id)
{
	myCurrentMenuParent=id;
	writeWaitMsg(controlProjectTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

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
	if(tmp.myRow==null)
	{
		setMenuItemState(212190,'disabled');	//EDIT
		setMenuItemState(212200,'disabled');	//DELETE
		setMenuItemState(212220,'disabled');	//CUT
		setMenuItemState(212260,'disabled');	//ESTIMATE
		//setMenuItemState(212230,'disabled');	//COPY ESTIMATE
		setMenuItemState(212280,'disabled');	//MANAGE REFS
	}
	else
	{
		if(tmp.myRow.content[7]=="controlProject")
		{
			setMenuItemState(212190,'regular');	//EDIT
			//setMenuItemState(212230,'disabled');	//COPY ESTIMATE
			setMenuItemState(212260,'disabled');	//ESTIMATE
			setMenuItemState(212280,'regular');	//MANAGE REFS
		}
		else
		{
			setMenuItemState(212190,'disabled');	//EDIT
			//setMenuItemState(212230,'disabled');	//COPY ESTIMATE
			setMenuItemState(212260,'regular');	//ESTIMATE
			setMenuItemState(212280,'disabled');	//MANAGE REFS
		}
		setMenuItemState(212200,'regular');	//DELETE
		setMenuItemState(212220,'regular');	//CUT
	}
	//Show paste option only if something has been cut
	if(myMoveAction.movableItemType==null)
		setMenuItemState(212240,'disabled');
	else
		setMenuItemState(212240,'regular');

	if(controlProjectTableCurrentParent==1)
	{
		setMenuItemState(212110,'disabled');	//UP
		setMenuItemState(212120,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(212110,'regular');	//UP
		setMenuItemState(212120,'regular');	//TOP
	}

	//Impose Menu Permissions
	setMenuPermissions(currentMenuBar);
};

/**********************************************************/
/*
 * Ajax call to populate controlProject at level $id$
 */
function callControlProjectAjax(id) {
	if(document.getElementById(controlProjectTablecontainer)==null) return;
	if(controlProjectPropertiesWindow!=null) controlProjectPropertiesWindow.close();
	if(projOptionsWindow!=null) projOptionsWindow.close();
	var myControlProjectRequest=getHTMLHTTPRequest();
	controlProjectTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21010+"&parent="+id+"&method="+"get";

	myControlProjectRequest.open("GET",url,true);
	myControlProjectRequest.onreadystatechange=function()
	{
		if(myControlProjectRequest.readyState==4) {
			if(myControlProjectRequest.status==200) {
				renderControlProject(myControlProjectRequest);
			}
			else {
				alert("Connection Problem:"+myControlProjectRequest.statusText);
			}
		}
	};
	writeWaitMsg(controlProjectTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myControlProjectRequest.send(null);
}

function renderControlProject(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(controlProjectTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='100%'>Description</td><td width='16px'>D</td><td width='16px'>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(controlProjectTablecontainer).innerHTML=str;
	//Update the controlProject navigation bar
	updateControlProjectNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
}
/*
 * Update navigation bar for ControlProject Table according to current level
 */
var updateControlProjectNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		controlProjectTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callControlProjectAjax("+controlProjectTableparent+")'><img src='images/project/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callControlProjectAjax("+controlProjectTableTop+")'><img src='images/project/top.png' border='0' alt='Top level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myControlProjectAddWindow(\""+TABLE_NAME+"\",\"controlProject\");'>Add Project</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initProjectWin(\""+TABLE_NAME+"\",\"controlEstimate\");'>Add Estimate</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myControlProjectEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCostBookEditWindow(\""+TABLE_NAME+"\");'>Change CostBook[E]</a></td>";
	}
	else
	{
		str+="<td><img src='images/project/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/project/top1.png' alt='Top level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myControlProjectAddWindow(\""+TABLE_NAME+"\",\"controlProject\");'>Add Project</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initProjectWin(\""+TABLE_NAME+"\",\"controlEstimate\");'>Add Estimate</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myControlProjectEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCostBookEditWindow(\""+TABLE_NAME+"\");'>Change CostBook[E]</a></td>";
		controlProjectTableparent=1;
	}
	str+="<td>&nbsp;</td><td align='right'><input type='button' name='search' value='Search' onclick='populateSearchWin();'/></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("project");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="controlProject";		//Row type is controlProject
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToTable1(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("estimate");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="controlEstimate";		//Row type is controlProject
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		param[6]=content[i].childNodes[5].firstChild.data;
		param[7]=content[i].childNodes[6].firstChild.data;
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
	if(param[0]=="controlProject")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callControlProjectAjax("+param[1]+");'><img src='images/project/project.png' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='openControlBillWindow(event);'><img src='images/project/control.png' border='0' width='16' height='16'></a>";
	//cell[0].innerHTML="<a href='javascript:void(0);' onclick='openControlBillWindow("+param[1]+","+param[6]+");'><img src='images/common/budget.gif' border='0' width='16' height='16'></a>";

	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: Name
	cell[2]=row.insertCell(2);
	var name;
	if(param[0]=="controlProject") {
		name=document.createTextNode(param[2]);
	}
	else
		name=document.createTextNode(param[4]);
	cell[2].appendChild(name);

	//Cell3: Description
	cell[3]=row.insertCell(3);
	var description;
	if(param[0]=="controlProject") {
		description=document.createTextNode(param[3]);
	}
	else
		description=document.createTextNode(param[5]);
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
	if(param[0]=="controlProject")
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	else
	{
		rowContents[8]=param[6];	//Remarks
		rowContents[9]=param[2];	//Parent of Control
		rowContents[10]=param[7];	//Parent of Estimate
		rowContents[11]=param[3];	//Estimate ID
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete ControlEstimates Asynchronously using Ajax
 */
var myControlProjectDeleteRequest=getHTMLHTTPRequest();

function callDeleteControlProjectAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myDelTable;
	var myDelRowsArray=Array();
	var myDelrIndex;
	myDelTable=tbl;
	myDelRowsArray=obj;
	myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	var id1="";
	for(var i=0; i<obj.length; i++) {
		if(obj[i].myRow.content[7]=="controlProject" && id=="")
			id+=obj[i].myRow.content[6];
		else if(obj[i].myRow.content[7]=="controlEstimate" && id1=="")
			id1+=obj[i].myRow.content[6];
		else
		{
			if(obj[i].myRow.content[7]=="controlProject")
				id+=","+obj[i].myRow.content[6];
			else
				id1+=","+obj[i].myRow.content[6];
		}
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21020+"&proid="+URLEncode(id)+"&estid="+URLEncode(id1)+"&method="+"delete";
	myControlProjectDeleteRequest.open("GET",url,true);
	myControlProjectDeleteRequest.onreadystatechange=function()
	{
		if(myControlProjectDeleteRequest.readyState==4) {
			if(myControlProjectDeleteRequest.status==200) {
				var xmlDoc=myControlProjectDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myControlProjectDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myControlProjectDeleteRequest.send(null);
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
		callDeleteControlProjectAjax(tbl,checkedObjArray,rIndex);
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
	callDeleteControlProjectAjax(tbl,checkedObjArray,rIndex);
};


/**********************************************************/
/*
 * Edit ControlEstimates Asynchronously using Ajax
 */
var controlProjectPropertiesWindowDiv="blankHidden";
var controlProjectPropertiesWindowTitle="Properties";
var controlProjectPropertiesWindowId="controlProjectPropertiesWindowId";
var indexOfRowToEdit=-1;
var rowToEdit=null;

var myContextControlProjectEditWindow=function() {
	//var tbl=document.getElementById(tblId);
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
		populateControlProjectEditWin();
};

var myControlProjectEditWindow=function(tblId) {
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
		populateControlProjectEditWin();
};

var populateControlProjectEditWin=function() {
	var innerStr="<table>";
	if(rowToEdit!=null) {
		if(rowToEdit.myRow.content[7]=="controlProject")
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditControlProjectAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='controlProjectPropertiesWindow.close()'>Discard</a></td></tr>";
		}
		else
		{
			//alert("Estimate");
			return;
		}
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(controlProjectPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyControlProjectPropertiesWin();
};

var openMyControlProjectPropertiesWin=function() {

	controlProjectPropertiesWindow=internalWindow.open('controlProjectPropertiesWindowId', 'div', controlProjectPropertiesWindowDiv, '#Properties Window', 'width=450px,height=350px,left=200px,top=150px,resize=1,scrolling=1');
};

var myControlProjectUpdateData="";
var myControlProjectEditRequest=getHTMLHTTPRequest();
var callEditControlProjectAjax=function() {
	var myRandom=parseInt(Math.random()*99999999);
	var myControlProjectUpdateData="";
	var method;
	if(rowToEdit.myRow.content[7]=="controlProject")
	{
		method="updateControlProject";
		myControlProjectUpdateData="id="+rowToEdit.myRow.content[6];
		myControlProjectUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myControlProjectUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myControlProjectUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		alert("Estimate");
		return;
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21030+"&method="+method;
	myControlProjectEditRequest.open('POST', url, true);
	myControlProjectEditRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myControlProjectEditRequest.setRequestHeader("Content-length", myControlProjectUpdateData.length);
	myControlProjectEditRequest.onreadystatechange=updateControlProjectAction;
	openSplashScreen();
	myControlProjectEditRequest.send(myControlProjectUpdateData);

};

function updateControlProjectAction() {
	if(myControlProjectEditRequest.readyState==4) {
		if(myControlProjectEditRequest.status==200) {
			var xmlDoc=myControlProjectEditRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				if(rowToEdit.myRow.content[7]=="controlProject")
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8]=document.getElementById('editRemarks').value;
				}
				else
				{
				}
			}
			else if(statusFlag==2) {
				alert("EDIT: System Error");
			}
			controlProjectPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myControlProjectEditRequest.statusText);
			controlProjectPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}

/**********************************************************/
/*
 * Add new sub-controlProject/controlEstimate to current controlProject directory
 */
var myControlProjectTable=null;
var myControlProjectAddWindow=function(tblId,type) {
	var tbl=document.getElementById(tblId);
	myControlProjectTable=tbl;
	populateControlProjectAddWin(type);
};

var populateControlProjectAddWin=function(type) {
	var innerStr="<table>";
	if(type=="controlProject")
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddControlProjectAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='controlProjectPropertiesWindow.close()'>Discard</a></td></tr>";
	}
	else
	{
		return;
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(controlProjectPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyControlProjectPropertiesWin();
};

var myControlProjectAddData="";
var myControlProjectAddRequest=getHTMLHTTPRequest();
var callAddControlProjectAjax=function(type) {
	var myRandom=parseInt(Math.random()*99999999);
	if(type=="controlProject")
	{
		method="addControlProject";
		myControlProjectAddData="id="+controlProjectTableCurrentParent;
		myControlProjectAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myControlProjectAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myControlProjectAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		alert("Estimate");
		return;
	}

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21040+"&method="+method;
	myControlProjectAddRequest.open('POST', url, true);
	myControlProjectAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myControlProjectAddRequest.setRequestHeader("Content-length", myControlProjectAddData.length);
	myControlProjectAddRequest.onreadystatechange=addControlProjectAction;
	openSplashScreen();
	myControlProjectAddRequest.send(myControlProjectAddData);

};

function addControlProjectAction() {
	if(myControlProjectAddRequest.readyState==4) {
		if(myControlProjectAddRequest.status==200) {
			var xmlDoc=myControlProjectAddRequest.responseXML;
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
				if(type=='controlEstimate')
				{
					alert("Estimate");
					return;
					//rowNum=getMaxControlEstimateRow();
				}
				else
				{
					param[0]="controlProject";		//Row type is controlProject
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editRemarks').value;
					param[5]=""+controlProjectTableCurrentParent;
					rowNum=getMaxControlProjectRow();
				}

				addRowToTable1(myControlProjectTable,rowNum,param);
				reorderRows(myControlProjectTable, rowNum);
			}
			else if(statusFlag==2) {
				alert("ADD: An Error Occured");
			}
			controlProjectPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myControlProjectAddRequest.statusText);
			controlProjectPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}

var getMaxControlEstimateRow=function() {
	var tbl=myControlProjectTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="controlEstimate" && rowNum<=i)
			rowNum=i;
	}
	if(rowNum==-1)
	{
		for (i=0; i<tbl.tBodies[0].rows.length; i++) {
			if(tbl.tBodies[0].rows[i].myRow.content[7]=="controlProject" && rowNum<=i)
				rowNum=i;

		}
	}
	return rowNum+1;
};

var getMaxControlProjectRow=function() {
	var tbl=myControlProjectTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="controlProject" && rowNum<=i)
			rowNum=i;
	}
	return rowNum+1;
};

/**********************************************************/
/*
 * Open Definitive estimates window for selection
 */
var projectManagerContainer="blankHidden1";	//Main div containing the DHTML window
var PROJOptionsContainer='projOptions';			//Contains link to assembly/item menu
var PROJInnnerContainer="innerPROJContainer";		//Main inner window
var projOptionsWindowId="projOptionsWindowId";

var PROJ_INNER_TABLE_NAME="projInnerSample";			//Should be named in HTML
var PROJ_INNER_DIV_NAV_NAME="projInnerNavDiv";			//Navigation Bar
var controlTable;
var initProjectWin=function(tableName) {
	controlTable=tableName;
	var div=document.getElementById(projectManagerContainer);
	div.innerHTML="<div id='"+PROJInnnerContainer+"' class='smallText'>Please click on one of the options above</div>";
	openProjectOptionsWindow();
};

var openProjectOptionsWindow=function() {
	projOptionsWindow=internalWindow.open(projOptionsWindowId, 'div', projectManagerContainer, 'Select Estimate for Control', 'width=600px,height=400px,left=5px,top=5px,resize=1,scrolling=1');
	openProjectTable();
};

/*
 * Global vars
 */
var projectTableparent=1;	//Up one level
var projectTableTop=1;		//Top Level
var projectTableCurrentParent=1;			//parent of current level
var projectTablecontainer=PROJInnnerContainer;	//this DIV will contain our project

var openProjectTable=function() {
	callProjectAjax(1);
};

function callProjectAjax(id) {
	if(document.getElementById(projectTablecontainer)==null) return;
	var myProjectRequest=getHTMLHTTPRequest();
	projectTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21050+"&parent="+id+"&method="+"get";
	myProjectRequest.open("GET",url,true);
	myProjectRequest.onreadystatechange=function()
	{
		if(myProjectRequest.readyState==4) {
			if(myProjectRequest.status==200) {
				renderProject(myProjectRequest);
			}
			else {
				alert("Connection Problem:"+myProjectRequest.statusText);
			}
		}
	};
	writeWaitMsg(projectTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myProjectRequest.send(null);
}
function renderProject(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(projectTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+PROJ_INNER_DIV_NAV_NAME+"'></div>";
	str+="<table id='"+PROJ_INNER_TABLE_NAME+"' width='100%' class='innerContentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='60%'>Description</td><td width='100%'>CostBook</td><td width='16px'>Select</td></tr></thead>";
	str+="<tbody></tbody></table>";
	document.getElementById(projectTablecontainer).innerHTML=str;
	//Update the project navigation bar
	updateProjectNav(xmlDoc,PROJ_INNER_DIV_NAV_NAME);
	populateProjectTable(xmlDoc,PROJ_INNER_TABLE_NAME);
	addTableRolloverEffect(PROJ_INNER_TABLE_NAME,'tableRollOverEffect2','tableRowClickEffect2');
}

/*
 * Update navigation bar for Project Table according to current level
 */
var updateProjectNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		projectTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callProjectAjax("+projectTableparent+")'><img src='images/project/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callProjectAjax("+projectTableTop+")'><img src='images/project/top.png' border='0' alt='Top level'></a></td>";
	}
	else if(searchFlag1==false)
	{
		str+="<td><img src='images/project/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/project/top1.png' alt='Top level'></td>";
		projectTableparent=1;
	}
	else
	{
		str+="<td><img src='images/project/up1.png' alt='Up one level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callProjectAjax("+projectTableTop+")'><img src='images/project/top.png' border='0' alt='Top level'></a></td>";
		searchFlag1=false;
		projectTableparent=1;
	}
	str+="<td><label>Enter keyword:</label></td><td><input size='40' type='text' id='searchKeyForProject' value=''></td><td><input type='button' value='GO' onclick='vaildateKey1();'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};

/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateProjectTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("project");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="project";		//Row type is project
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToTable2(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("estimate");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="estimate";		//Row type is project
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		param[6]=content[i].childNodes[5].firstChild.data;
		param[7]=content[i].childNodes[6].firstChild.data;
		param[8]=content[i].childNodes[7].firstChild.data;	//CONTINGENCY
		param[9]=content[i].childNodes[8].firstChild.data;	//RND_FIGURE
		addRowToTable2(tbl,rowToInsertAt,param);
		//addRowToTable(tbl,-1,content[i]);	//Add new row at the end
		reorderRows(tbl, rowToInsertAt);
	}
};

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

	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	var isFolder=(param[0]=="project");
	if(param[0]=="project")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callProjectAjax("+param[1]+");'><img src='images/project/project.png' border='0'></a>";
	else
		cell[0].innerHTML="<img src='images/project/estimate.png' border='0' width='16' height='16'>";
	//cell[0].innerHTML="<a href='javascript:void(0);' onclick='openControlBillWindow("+param[1]+","+param[6]+");'><img src='images/common/budget.gif' border='0' width='16' height='16'></a>";

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

	//Cell4: CostBook Name
	cell[4]=row.insertCell(4);
	var costBook;
	if(param[0]=="project")
		costBook=document.createTextNode("--");
	else
		costBook=document.createTextNode(param[7]);
	cell[4].appendChild(costBook);

	//Cell5: Image
	cell[5] = row.insertCell(5);
	if(!isFolder)
		cell[5].innerHTML="<a href='javascript:void(0);' onclick='callAddControlEstimateAjax(\""+tbl.getAttribute("id")+"\","+row.sectionRowIndex+")'><img src='images/common/tick.gif' border='0'></a>";
	else
		cell[5].innerHTML="&nbsp;&nbsp;&nbsp;";

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
	if(param[0]=="project")
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	else
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
		rowContents[10]=param[6];	//CostBook, default is 0
		rowContents[11]=costBook;	//CostBook Name
		rowContents[12]=param[8];	//CONTINGENCY
		rowContents[13]=param[9];	//RND_FIGURE
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

/*
 * Add selected Definitive Estimate to the list of
 * Control Estimates
 */
var myControlEstimateAddRequest=getHTMLHTTPRequest();
var myControlEstimateTable;
var myControlEstimateRow;
var callAddControlEstimateAjax=function(tableName,rowNum) {
	//alert(tableName+", "+rowNum);
	var myControlEstimateTable=document.getElementById(tableName);
	var row=myControlEstimateTable.tBodies[0].rows[rowNum];
	var id=row.myRow.content[6];
	myControlEstimateRow=row;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21060+"&id="+id+"&controlProjectId="+controlProjectTableCurrentParent+"&method="+"addEstimateToControl";
	//alert(url);
	myControlEstimateAddRequest.open("GET",url,true);
	myControlEstimateAddRequest.onreadystatechange=addControlEstimateToBillAction;
	openSplashScreen();
	myControlEstimateAddRequest.send(null);
};

var addControlEstimateToBillAction=function() {
	if(myControlEstimateAddRequest.readyState==4) {
		if(myControlEstimateAddRequest.status==200) {
			var xmlDoc=myControlEstimateAddRequest.responseXML;
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

				param[0]="controlEstimate";								//Type
				param[1]=""+newId;										//Control ID
				param[2]=""+controlProjectTableCurrentParent;			//Control_Parent ID
				param[3]=""+myControlEstimateRow.myRow.content[6];		//Definitive Estimate ID
				param[4]=""+myControlEstimateRow.myRow.content[4].data;	//Name
				param[5]=""+myControlEstimateRow.myRow.content[5].data;	//Spec
				param[6]=""+myControlEstimateRow.myRow.content[8].data;	//Remarks
				param[7]=""+myControlEstimateRow.myRow.content[9];		//Estimate Parent
				//alert(param[0]+", "+param[1]+", "+param[2]+", "+param[3]+", "+param[4]+", "+param[5]+", "+param[6]+", "+param[7]);
				var tabletoAdd=document.getElementById(TABLE_NAME);
				myControlProjectTable=tabletoAdd;
				var rowNum=getMaxControlEstimateRow();
				addRowToTable1(tabletoAdd,rowNum,param);
				reorderRows(tabletoAdd, rowNum);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
		}
		else {
			alert("Connection Problem:"+myControlEstimateAddRequest.statusText);
		}
		closeSplashScreen();
		//projOptionsWindow.close();
	}
};

/**********************************************************/
/*
 * Open new Iframe window to manage/schedule jobs
 */
var openContextControlBillWindow=function() {
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

	var estimateName=row.myRow.content[4].data;
	var id=row.myRow.content[6];
	var estimateId=row.myRow.content[11];
	var billWindowId="billWindow"+id;
	internalWindow.open(billWindowId, "iframe","MyActionDispatcher?path=21110&method=get&id="+id+"&estimateId="+estimateId , "Bill for Estimate: ["+estimateName+"]",'width=900px,height=600px,left=10px,top=10px,resize=1,scrolling=1');
	//showBillWindow(row.myRow.content[6],row.myRow.content[10]);
};

var openControlBillWindow=function(e) {
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

	var estimateName=row.myRow.content[4].data;
	var id=row.myRow.content[6];
	var estimateId=row.myRow.content[11];
	var billWindowId="billWindow"+id;
	internalWindow.open(billWindowId, "iframe","MyActionDispatcher?path=21110&method=get&id="+id+"&estimateId="+estimateId , "Bill for Estimate: ["+estimateName+"]",'width=900px,height=600px,left=10px,top=10px,resize=1,scrolling=1');
};


/**********************************************************/
/*
 * Move Item from one directory to other
 */
//var myParamsForMovableItem=new Array();
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
	if(row.myRow.content[7]=="controlProject")
	{
		//Params: type,id, parentId
		myMoveAction.cut("controlProject",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="controlProject";		   			//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8];			//REMARKS
		tmpArr[5]=""+row.myRow.content[9];			//PARENT
	}
	else if(row.myRow.content[7]=="controlEstimate")
	{
		//Params: type,id, parentId
		myMoveAction.cut("controlEstimate",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="controlEstimate";		   		//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[9];   		//CONTROL_PARENT
		tmpArr[3]=""+row.myRow.content[11];   		//ESTIMATE ID

		tmpArr[4]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[5]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[6]=""+row.myRow.content[8];			//REMARKS
		tmpArr[7]=""+row.myRow.content[10];			//PARENT OF ESTIMATE

		//alert(tmpArr[0]+", "+tmpArr[1]+", "+tmpArr[2]+", "+tmpArr[3]+", "+tmpArr[4]+", "+tmpArr[5]+", "+tmpArr[6]+", "+tmpArr[7]);
	}
	myMoveAction.initParams(tmpArr);
};

var copyContextSelected=function() {
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

	if(row.myRow.content[7]=="controlEstimate")
	{
		//Params: type,id, parentId
		myMoveAction.cut("copyControlEstimate",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="controlEstimate";		   		//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[9];   		//CONTROL_PARENT
		tmpArr[3]=""+row.myRow.content[11];   		//ESTIMATE ID

		tmpArr[4]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[5]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[6]=""+row.myRow.content[8];			//REMARKS
		tmpArr[7]=""+row.myRow.content[10];			//PARENT OF ESTIMATE

		alert(tmpArr[0]+", "+tmpArr[1]+", "+tmpArr[2]+", "+tmpArr[3]+", "+tmpArr[4]+", "+tmpArr[5]+", "+tmpArr[6]+", "+tmpArr[7]);
	}
	myMoveAction.initParams(tmpArr);
};


var callPasteToLocationAjax=function() {
	myMoveAction.verify=function() {
		if(this.movableItemType=="controlProject")
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
		else if(this.movableItemType=="controlEstimate")
		{
			if(this.movableFromCurrentParentId==this.movableToParentId)
			{
				alert("Please chose a different location");
				return false;
			}
		}
		return true;
	};

	if(myMoveAction.paste(controlProjectTableCurrentParent)==false)
		return;
	var id=""+myMoveAction.movableItemId;
	var type=""+myMoveAction.movableItemType;
	var pid=""+myMoveAction.movableFromCurrentParentId;
	var newPid=""+myMoveAction.movableToParentId;
	var params=myMoveAction.paramArray;
	if(type=="controlEstimate" || type=="copyControlEstimate")
	{
		//alert(params.length);
		params[2]=newPid;
	}
	else if(type=="controlProject")
	{
		params[5]=newPid;
	}

	var myAjaxRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url="";
	if(type=="copyControlEstimate")
		url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20670+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;
	else
		url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20660+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;

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
					myControlProjectTable=document.getElementById(TABLE_NAME);
					if(type=="controlEstimate")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxControlEstimateRow(),params);
					else if(type=="controlProject")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxControlProjectRow(),params);
					else if(type=="copyControlEstimate")
					{
						var newKey=xmlDoc.getElementsByTagName("key");
						params[1]=""+newKey[0].getAttribute("value");
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxControlEstimateRow(),params);
					}
				}
				else if(statusFlag==2) {
					alert("Move/Copy: System Error");
				}
			}
			else {
				alert("Connection Problem:"+myAjaxRequest.statusText);
			}
			if(type!="copyControlEstimate")
				myMoveAction.reInit();
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myAjaxRequest.send(null);
};

/**********************************************************/
/*
 * Manage Uploaded docs for a project/sub-project
 */
var filesWindowId="FilesWIndowId";

var openFilesWindow=function() {
	var projectId;
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

	projectId=""+row.myRow.content[6];
	var projectName=row.myRow.content[4].data;
	//alert(projectId);
	internalWindow.open(filesWindowId, "iframe","MyActionDispatcher?path=20750&method=getProjectRefForUpdate&id="+projectId+"&uploadPath="+20760, "Files for Project: ["+projectName+"]",'width=900px,height=400px,left=10px,top=10px,resize=1,scrolling=1');
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
	projectPropertiesWindow=internalWindow.open('searchWindow', 'div', 'blankHidden1', 'Search Project', 'width=600px,height=400px,left=200px,top=150px,resize=1,scrolling=1');
};

function vaildateKey()
{
	key=document.getElementById('searchKey').value;
	if(key.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchControlProjectAjax();
		//alert(key);
	}
}

function callSearchControlProjectAjax() {
	var mySearchRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21010+"&key="+searchString+"&method="+"searchControlProject";
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
	//if(errorFlag==0) return;

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
	var content=xmlDoc.getElementsByTagName("project");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="controlProject";		//Row type is project
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToSearchTable(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("estimate");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="controlEstimate";		//Row type is project
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
	if(param[0]=="controlProject")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callControlProjectAjax("+param[5]+");'><img src='images/project/project.png' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callControlProjectAjax("+param[5]+");'><img src='images/project/control.png' border='0' width='16' height='16'></a>";

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
	rowContents[0]='';			//keep it at $1 to access easily
	rowContents[1]='';				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	rowContents[4]=name;
	rowContents[5]=description;
	rowContents[6]=param[1];			//ID
	rowContents[7]=param[0];			//Type
	rowContents[8]=param[4];	//Remarks
	rowContents[9]=param[5];	//Parent

	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

/**************** Search in Project Sub-Window **********************************/
function vaildateKey1()
{
	key1=document.getElementById('searchKeyForProject').value;
	if(key1.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchProjectAjax();
		//alert(key1);
	}
}

function callSearchProjectAjax(id) {
	if(document.getElementById(projectTablecontainer)==null) return;
	var myProjectRequest=getHTMLHTTPRequest();
	projectTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key1);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21050+"&key="+searchString+"&method="+"searchProject";
	myProjectRequest.open("GET",url,true);
	myProjectRequest.onreadystatechange=function()
	{
		if(myProjectRequest.readyState==4) {
			if(myProjectRequest.status==200) {
				searchFlag1=true;
				renderProject(myProjectRequest);
			}
			else {
				alert("Connection Problem:"+myProjectRequest.statusText);
			}
		}
	};
	writeWaitMsg(projectTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myProjectRequest.send(null);
}

/**********************************************************/
/*
 * Init the first level
 */
initializeControlProjectTable(10420);