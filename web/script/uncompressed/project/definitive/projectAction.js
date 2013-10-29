/**********************************************************
 * Creates basic facilities for managing Definitive Estimates
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
var projectTableparent=1;	//Up one level
var projectTableTop=1;		//Top Level
var projectTableCurrentParent=1;			//parent of current level
var projectTablecontainer="blankContent";	//this DIV will contain our project
var projectPropertiesWindow=null;			//Properties Window(Add/Edit)

//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="projectSample";			//Should be named in HTML
var DIV_NAV_NAME="projectNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="PROJ_TTHEAD123";				
var ctx_TBODY="PROJ_TTBODY123";

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
 * Initializes Context Menu for Definite Estimate Table
 * and then populates the table
 */


var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			//getContextMenuModel();
			callProjectAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeProjectTable=function(id)
{
	myCurrentMenuParent=id;
	writeWaitMsg(projectTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

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
	//alert(tmp.tagName);
	if(tmp.myRow==null)
	{
		setMenuItemState(210880,'disabled');	//EDIT
		setMenuItemState(210890,'disabled');	//DELETE
		setMenuItemState(210910,'disabled');	//CUT

		setMenuItemState(210920,'disabled');	//COPY ESTIMATE
		setMenuItemState(210950,'disabled');	//ESTIMATE
		setMenuItemState(210960,'disabled');	//CHANGE CB
		setMenuItemState(210970,'disabled');	//PREPARE BILL
		setMenuItemState(211000,'disabled');	//MANAGE REFS
	}
	else
	{
		if(tmp.myRow.content[7]=="project")
		{
			setMenuItemState(210920,'disabled');	//COPY ESTIMATE
			setMenuItemState(210950,'disabled');	//ESTIMATE
			setMenuItemState(210960,'disabled');	//CHANGE CB
			setMenuItemState(210970,'disabled');	//PREPARE BILL
			setMenuItemState(211000,'regular');	//MANAGE REFS
			setMenuItemState(210980,'disabled');	//OVERHEADS
		}
		else
		{
			setMenuItemState(210920,'regular');	//COPY ESTIMATE
			setMenuItemState(210950,'regular');	//ESTIMATE
			setMenuItemState(210960,'regular');	//CHANGE CB
			setMenuItemState(210970,'regular');	//PREPARE BILL
			setMenuItemState(211000,'disabled');	//MANAGE REFS
			setMenuItemState(210980,'regular');	//OVERHEADS
		}
		setMenuItemState(210880,'regular');	//EDIT
		setMenuItemState(210890,'regular');	//DELETE
		setMenuItemState(210910,'regular');	//CUT
	}
	//Show paste option only if something has been cut
	if(myMoveAction.movableItemType==null)
		setMenuItemState(210930,'disabled');
	else
		setMenuItemState(210930,'regular');

	if(projectTableCurrentParent==1)
	{
		setMenuItemState(210810,'disabled');	//UP
		setMenuItemState(210820,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(210810,'regular');	//UP
		setMenuItemState(210820,'regular');	//TOP
	}


	hideMenuItem(211020);
	hideMenuItem(211030);
	hideMenuItem(211040);

	// for overheads subwindow
	var tbl=tmp.parentNode.parentNode;
	var div=tbl.parentNode;
	//If context menu has been opened inside overheads sub window
	if(div.getAttribute("estimateRef")!=null && div.getAttribute("estimateRef")!="")
	{
		//alert(div.getAttribute("billRef"));
		hideMenuItem(210810);
		hideMenuItem(210820);
		hideMenuItem(210840);
		hideMenuItem(210850);
		hideMenuItem(210860);
		hideMenuItem(210870);
		hideMenuItem(210880);
		hideMenuItem(210890);
		hideMenuItem(210910);
		hideMenuItem(210920);
		hideMenuItem(210930);
		hideMenuItem(210950);
		hideMenuItem(210960);
		hideMenuItem(210970);
		hideMenuItem(211000);
		hideMenuItem(210980);

		showMenuItem(211020);
		showMenuItem(211030);
		showMenuItem(211040);

		if(tmp.myRow==null)
		{
			//hideMenuItem(150002);
			hideMenuItem(211030);
			hideMenuItem(211040);
		}
		else
		{
			//showMenuItem(150002);
			if(tmp.myRow.content[12]!=0 && tmp.myRow.content[4].parentNode.childNodes[2]==null)
			{
				showMenuItem(211030);
				//alert(tmp.myRow.content[12]);
			}
			else
			{
				hideMenuItem(211030);
				//alert(tmp.myRow.content[12]);
			}
			showMenuItem(211040);
		}
	}
	else {
		showMenuItem(210810);
		showMenuItem(210820);
		showMenuItem(210840);
		showMenuItem(210850);
		showMenuItem(210860);
		showMenuItem(210870);
		showMenuItem(210880);
		showMenuItem(210890);
		showMenuItem(210910);
		showMenuItem(210920);
		showMenuItem(210930);
		showMenuItem(210950);
		showMenuItem(210960);
		showMenuItem(210970);
		showMenuItem(211000);
		showMenuItem(210980);

		hideMenuItem(211020);
		hideMenuItem(211030);
		hideMenuItem(211040);
	}

	//Impose Menu Permissions
	setMenuPermissions(currentMenuBar);
};

/**********************************************************/
/*
 * Ajax call to populate project at level $id$
 */
function callProjectAjax(id) {
	if(document.getElementById(projectTablecontainer)==null) return;
	if(projectPropertiesWindow!=null) projectPropertiesWindow.close();
	var myProjectRequest=getHTMLHTTPRequest();
	projectTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20310+"&parent="+id+"&method="+"get";

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
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='60%'>Description</td><td width='100%'>CostBook</td><td width='16px'>D</td><td width='16px'>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(projectTablecontainer).innerHTML=str;
	//Update the project navigation bar
	updateProjectNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
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
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myProjectAddWindow(\""+TABLE_NAME+"\",\"project\");'>Add Project</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myProjectAddWindow(\""+TABLE_NAME+"\",\"estimate\");'>Add Estimate</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myProjectEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCostBookEditWindow(\""+TABLE_NAME+"\");'>Change CostBook[E]</a></td>";
	}
	else
	{
		str+="<td><img src='images/project/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/project/top1.png' alt='Top level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myProjectAddWindow(\""+TABLE_NAME+"\",\"project\");'>Add Project</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myProjectAddWindow(\""+TABLE_NAME+"\",\"estimate\");'>Add Estimate</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myProjectEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCostBookEditWindow(\""+TABLE_NAME+"\");'>Change CostBook[E]</a></td>";
		projectTableparent=1;
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
		param[0]="project";		//Row type is project
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
	if(param[0]=="project")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callProjectAjax("+param[1]+");'><img src='images/project/project.png' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='openBillWindow(event);'><img src='images/project/estimate.png' border='0' width='16' height='16'></a>";
	//cell[0].innerHTML="<a href='javascript:void(0);' onclick='openBillWindow("+param[1]+","+param[6]+");'><img src='images/common/budget.gif' border='0' width='16' height='16'></a>";

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

	//Cell5: Checkbox
	cell[5]=row.insertCell(5);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[5].appendChild(checkBox);

	//cell6:Radio Button
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
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Estimates Asynchronously using Ajax
 */
var myProjectDeleteRequest=getHTMLHTTPRequest();

function callDeleteProjectAjax(tbl,obj,rIndex) {
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
		if(obj[i].myRow.content[7]=="project" && id=="")
			id+=obj[i].myRow.content[6];
		else if(obj[i].myRow.content[7]=="estimate" && id1=="")
			id1+=obj[i].myRow.content[6];
		else
		{
			if(obj[i].myRow.content[7]=="project")
				id+=","+obj[i].myRow.content[6];
			else
				id1+=","+obj[i].myRow.content[6];
		}
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20320+"&proid="+URLEncode(id)+"&estid="+URLEncode(id1)+"&method="+"delete";
	myProjectDeleteRequest.open("GET",url,true);
	myProjectDeleteRequest.onreadystatechange=function()
	{
		if(myProjectDeleteRequest.readyState==4) {
			if(myProjectDeleteRequest.status==200) {
				var xmlDoc=myProjectDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myProjectDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myProjectDeleteRequest.send(null);
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
		callDeleteProjectAjax(tbl,checkedObjArray,rIndex);
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
	callDeleteProjectAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Edit Estimates Asynchronously using Ajax
 */
var projectPropertiesWindowDiv="blankHidden";
var projectPropertiesWindowTitle="Properties";
var projectPropertiesWindowId="projectPropertiesWindowId";
var indexOfRowToEdit=-1;
var rowToEdit=null;

var myContextProjectEditWindow=function() {
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
		populateProjectEditWin();
};

var myProjectEditWindow=function(tblId) {
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
		populateProjectEditWin();
};

var populateProjectEditWin=function() {
	var innerStr="<table>";
	if(rowToEdit!=null) {
		if(rowToEdit.myRow.content[7]=="project")
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditProjectAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='projectPropertiesWindow.close()'>Discard</a></td></tr>";
		}
		else
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			innerStr+="<tr style='display: none'><td><label>Contingency (%):</label></td><td><input size='40' type='text' id='editContingency' value='"+rowToEdit.myRow.content[12]+"'></td></tr>";
			innerStr+="<tr><td><label>Rounded-off Figure:</label></td><td><input size='40' type='text' id='editRndOffFigure' value='"+rowToEdit.myRow.content[13]+"'></td></tr>";
			//alert("#"+rowToEdit.myRow.content[12]+" #"+rowToEdit.myRow.content[13]);
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditProjectAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='projectPropertiesWindow.close()'>Discard</a></td></tr>";

		}
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(projectPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyProjectPropertiesWin();
};

var openMyProjectPropertiesWin=function() {

	projectPropertiesWindow=internalWindow.open('projectPropertiesWindowId', 'div', projectPropertiesWindowDiv, '#Properties Window', 'width=450px,height=350px,left=200px,top=150px,resize=1,scrolling=1');
};

var myProjectUpdateData="";
var myProjectEditRequest=getHTMLHTTPRequest();
var callEditProjectAjax=function() {
	var myRandom=parseInt(Math.random()*99999999);
	var myProjectUpdateData="";
	var method;
	if(rowToEdit.myRow.content[7]=="project")
	{
		method="updateProject";
		myProjectUpdateData="id="+rowToEdit.myRow.content[6];
		myProjectUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myProjectUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myProjectUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		method="updateEstimate";
		myProjectUpdateData="id="+rowToEdit.myRow.content[6];
		myProjectUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myProjectUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myProjectUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
		myProjectUpdateData+="&contingency="+URLEncode(document.getElementById('editContingency').value);
		myProjectUpdateData+="&rndOffFigure="+URLEncode(document.getElementById('editRndOffFigure').value);
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20330+"&method="+method;
	myProjectEditRequest.open('POST', url, true);
	myProjectEditRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myProjectEditRequest.setRequestHeader("Content-length", myProjectUpdateData.length);
	myProjectEditRequest.onreadystatechange=updateProjectAction;
	openSplashScreen();
	myProjectEditRequest.send(myProjectUpdateData);

};

function updateProjectAction() {
	if(myProjectEditRequest.readyState==4) {
		if(myProjectEditRequest.status==200) {
			var xmlDoc=myProjectEditRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				if(rowToEdit.myRow.content[7]=="project")
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
					rowToEdit.myRow.content[12]=document.getElementById('editContingency').value;
					rowToEdit.myRow.content[13]=document.getElementById('editRndOffFigure').value;
				}
			}
			else if(statusFlag==2) {
				alert("EDIT: System Error");
			}
			projectPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myProjectEditRequest.statusText);
			projectPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}

/**********************************************************/
/*
 * Change CostBook, when an Estimate is created
 * it is not associated with any costbook, but once
 * a costbook is assigned, costbook field cannot
 * be reset to #No Costbook# state
 */
var editCostBookInnerDiv="costBookInnerDiv";
var myContextCostBookEditWindow=function(tblId) {
	var tbl=document.getElementById(tblId);
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
	if(rowToEdit!=null && rowToEdit.myRow.content[7]=="estimate")
		populateCostBookEditWin();
};

var myCostBookEditWindow=function(tblId) {
	var tbl=document.getElementById(tblId);
	indexOfRowToEdit=-1;	//Global Scope
	rowToEdit=null;			//Global Scope
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow && tbl.tBodies[0].rows[i].myRow.content[1].getAttribute('type') == 'radio' && tbl.tBodies[0].rows[i].myRow.content[1].checked) {
			indexOfRowToEdit=i;
			rowToEdit=tbl.tBodies[0].rows[i];	//Global Scope
		}
	}
	if(rowToEdit!=null && rowToEdit.myRow.content[7]=="estimate")
		populateCostBookEditWin();
};

var populateCostBookEditWin=function() {
	var innerStr="<div id='"+editCostBookInnerDiv+"'></div>";
	var editableDiv=document.getElementById(projectPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyCostBookPropertiesWin();
};

var openMyCostBookPropertiesWin=function() {
	projectPropertiesWindow=internalWindow.open(projectPropertiesWindowId, 'div', projectPropertiesWindowDiv, '#CostBook', 'width=750px,height=500px,left=20px,top=15px,resize=1,scrolling=1');
	callCbCatAjax(1);
};


/**********************************************************/
/*
 * Add new sub-project/estimate to current project directory
 */
var myProjectTable=null;
var myProjectAddWindow=function(tblId,type) {
	var tbl=document.getElementById(tblId);
	myProjectTable=tbl;
	populateProjectAddWin(type);
};

var populateProjectAddWin=function(type) {
	var innerStr="<table>";
	if(type=="project")
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddProjectAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='projectPropertiesWindow.close()'>Discard</a></td></tr>";
	}
	else
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddProjectAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='projectPropertiesWindow.close()'>Discard</a></td></tr>";

	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(projectPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyProjectPropertiesWin();
};

var myProjectAddData="";
var myProjectAddRequest=getHTMLHTTPRequest();
var callAddProjectAjax=function(type) {
	var myRandom=parseInt(Math.random()*99999999);
	if(type=="project")
	{
		method="addProject";
		myProjectAddData="id="+projectTableCurrentParent;
		myProjectAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myProjectAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myProjectAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		method="addEstimate";
		myProjectAddData="id="+projectTableCurrentParent;
		myProjectAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myProjectAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myProjectAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20340+"&method="+method;
	myProjectAddRequest.open('POST', url, true);
	myProjectAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myProjectAddRequest.setRequestHeader("Content-length", myProjectAddData.length);
	myProjectAddRequest.onreadystatechange=addProjectAction;
	openSplashScreen();
	myProjectAddRequest.send(myProjectAddData);

};

function addProjectAction() {
	if(myProjectAddRequest.readyState==4) {
		if(myProjectAddRequest.status==200) {
			var xmlDoc=myProjectAddRequest.responseXML;
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
				if(type=='estimate')
				{
					param[0]="estimate";		//Row type
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editRemarks').value;
					param[5]=""+projectTableCurrentParent;
					param[6]=0;
					param[7]="--";
					param[8]=0;
					param[9]="-";
					rowNum=getMaxEstimateRow();
				}
				else
				{
					param[0]="project";		//Row type is project
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editRemarks').value;
					param[5]=""+projectTableCurrentParent;
					rowNum=getMaxProjectRow();
				}

				addRowToTable1(myProjectTable,rowNum,param);
				reorderRows(myProjectTable, rowNum);
			}
			else if(statusFlag==2) {
				alert("ADD: An Error Occured");
			}
			projectPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myProjectAddRequest.statusText);
			projectPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}

var getMaxEstimateRow=function() {
	var tbl=myProjectTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="estimate" && rowNum<=i)
			rowNum=i;
	}
	if(rowNum==-1)
	{
		for (i=0; i<tbl.tBodies[0].rows.length; i++) {
			if(tbl.tBodies[0].rows[i].myRow.content[7]=="project" && rowNum<=i)
				rowNum=i;

		}
	}
	return rowNum+1;
};

var getMaxProjectRow=function() {
	var tbl=myProjectTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="project" && rowNum<=i)
			rowNum=i;
	}
	return rowNum+1;
};

/**********************************************************/
/*
 * Prepare Bill, open a new bill window for each estimate
 */
var openContextBillWindow=function() {
	var srcObj=contextMenu.srcElement;
	var row=null;
	while(true)
	{
		row=srcObj.parentNode;
		if(row.tagName!="TR") {
			srcObj=row;
			continue;
		}
		else break;
	}
	if(row!=null)
	{
		var estimateName=row.myRow.content[4].data;
		var id=row.myRow.content[6];
		var cbId=row.myRow.content[10];
		var billWindowId="billWindow"+id;
		internalWindow.open(billWindowId, "iframe","MyActionDispatcher?path=20410&method=get&id="+id+"&cbId="+cbId , "Bill for Estimate: ["+estimateName+"]",'width=900px,height=600px,left=10px,top=10px,resize=1,scrolling=1');
	}
	//showBillWindow(row.myRow.content[6],row.myRow.content[10]);
};
/*var openBillWindow=function(id,cbId) {
	showBillWindow(id,cbId);
}*/

var openBillWindow=function(e) {
	var eventSrc=e;
	var row=null;
	var tbl=null;
	if(eventSrc.target)
	{
		row=eventSrc.target.parentNode.parentNode.parentNode;
	}
	else if(eventSrc.srcElement)
	{
		row=eventSrc.srcElement.parentNode.parentNode.parentNode;
	}	

	if(row!=null)
	{
		var rowIndex=row.sectionRowIndex;
		tbl=row.parentNode.parentNode;
		var estimateName=row.myRow.content[4].data;
		var id=row.myRow.content[6];
		var cbId=row.myRow.content[10];
		var billWindowId="billWindow"+id;
		internalWindow.open(billWindowId, "iframe","MyActionDispatcher?path=20410&method=get&id="+id+"&cbId="+cbId , "Bill for Estimate: ["+estimateName+"]",'width=900px,height=600px,left=10px,top=10px,resize=1,scrolling=1');
	}
};

/*var showBillWindow=function(id,cbId) {
	//var id=row.myRow.content[6];
	//var name=row.myRow.content[4].data;
	var billWindowId="billWindow"+id;
	internalWindow.open(billWindowId, "iframe","MyActionDispatcher?path=10021&method=get&id="+id+"&cbId="+cbId , "Bill for Estimate: ["+id+"]",'width=900px,height=600px,left=10px,top=10px,resize=1,scrolling=1');
	//myAjaxPageFetcher.load("centralContent", "MyActionDispatcher?path=10021&method=get&id="+id, true, "", "","get");
	//callOpenBillAjax(id);
}
 */


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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20350+"&parent="+id+"&method="+"getCostBook";

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
		cell[4].innerHTML="<a href='javascript:void(0);' onclick='callEditCostBookAjax(\""+tbl.getAttribute("id")+"\","+row.sectionRowIndex+")'><img src='images/common/tick.gif' border='0'></a>";


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

var myCoskBookEditRequest=getHTMLHTTPRequest();
var newCbRow;
var callEditCostBookAjax=function(tableId,rowNum) {
	var mycBTable=document.getElementById(tableId);
	var row=mycBTable.tBodies[0].rows[rowNum];
	var id=row.myRow.content[6];
	newCbRow=row;
	var estimateId=rowToEdit.myRow.content[6];
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20360+"&id="+id+"&estimateId="+estimateId+"&method="+"changeCostBook";
	myCoskBookEditRequest.open("GET",url,true);
	myCoskBookEditRequest.onreadystatechange=updateCostBookAction;
	openSplashScreen();
	myCoskBookEditRequest.send(null);
};

var updateCostBookAction=function() {
	if(myCoskBookEditRequest.readyState==4) {
		if(myCoskBookEditRequest.status==200) {
			var xmlDoc=myCoskBookEditRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				rowToEdit.myRow.content[10]=newCbRow.myRow.content[6];
				rowToEdit.myRow.content[11].data=newCbRow.myRow.content[4].data;
			}
			else if(statusFlag==2) {
				alert("ChangeCostBook: System Error");
			}
		}
		else {
			alert("Connection Problem:"+myCoskBookEditRequest.statusText);
		}
		closeSplashScreen();
	}
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
	if(row.myRow.content[7]=="project")
	{
		//Params: type,id, parentId
		myMoveAction.cut("project",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="project";		   				//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8];			//REMARKS
		tmpArr[5]=""+row.myRow.content[9];			//PARENT
	}
	else if(row.myRow.content[7]=="estimate")
	{
		//Params: type,id, parentId
		myMoveAction.cut("estimate",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="estimate";		   				//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8];			//REMARKS
		tmpArr[5]=""+row.myRow.content[9];			//PARENT
		tmpArr[6]=""+row.myRow.content[10];			//COSTBOOK ID
		tmpArr[7]=""+row.myRow.content[11].data;	//COSTBOOK NAME

		tmpArr[8]=""+row.myRow.content[12];	//CONTINGENCY
		tmpArr[9]=""+row.myRow.content[13];	//RNDOFF_FIGURE
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

	if(row.myRow.content[7]=="estimate")
	{
		//Params: type,id, parentId
		myMoveAction.cut("copyEstimate",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="estimate";		   				//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8];			//REMARKS
		tmpArr[5]=""+row.myRow.content[9];			//PARENT
		tmpArr[6]=""+row.myRow.content[10];			//COSTBOOK ID
		tmpArr[7]=""+row.myRow.content[11].data;	//COSTBOOK NAME

		tmpArr[8]=""+row.myRow.content[12];	//CONTINGENCY
		tmpArr[9]=""+row.myRow.content[13];	//RNDOFF_FIGURE
	}
	myMoveAction.initParams(tmpArr);
};


var callPasteToLocationAjax=function() {
	myMoveAction.verify=function() {
		if(this.movableItemType=="project")
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
		else if(this.movableItemType=="estimate")
		{
			if(this.movableFromCurrentParentId==this.movableToParentId)
			{
				alert("Please chose a different location");
				return false;
			}
		}
		return true;
	};

	if(myMoveAction.paste(projectTableCurrentParent)==false)
		return;
	var id=""+myMoveAction.movableItemId;
	var type=""+myMoveAction.movableItemType;
	var pid=""+myMoveAction.movableFromCurrentParentId;
	var newPid=""+myMoveAction.movableToParentId;
	var params=myMoveAction.paramArray;
	if(type=="estimate" || type=="copyEstimate")
	{
		//alert(params.length);
		params[5]=newPid;
	}
	else if(type=="project")
	{
		params[5]=newPid;
	}

	var myAjaxRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url="";
	if(type=="copyEstimate")
		url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20650+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;
	else
		url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20640+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;

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
					myProjectTable=document.getElementById(TABLE_NAME);
					if(type=="estimate")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxEstimateRow(),params);
					else if(type=="project")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxProjectRow(),params);
					else if(type=="copyEstimate")
					{
						var newKey=xmlDoc.getElementsByTagName("key");
						params[1]=""+newKey[0].getAttribute("value");
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxEstimateRow(),params);
					}
				}
				else if(statusFlag==2) {
					alert("Move/Copy: System Error");
				}
			}
			else {
				alert("Connection Problem:"+myAjaxRequest.statusText);
			}
			if(type!="copyEstimate")
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
	internalWindow.open(filesWindowId, "iframe","MyActionDispatcher?path=20710&method=getProjectRefForUpdate&id="+projectId+"&uploadPath="+20720, "Files for Project: ["+projectName+"]",'width=900px,height=400px,left=10px,top=10px,resize=1,scrolling=1');
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
		callSearchProjectAjax();
		//alert(key);
	}
}

function callSearchProjectAjax() {
	var mySearchRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20310+"&key="+searchString+"&method="+"searchProject";
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
		addRowToSearchTable(tbl,rowToInsertAt,param);
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
	if(param[0]=="project")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callProjectAjax("+param[5]+");'><img src='images/project/project.png' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callProjectAjax("+param[5]+");'><img src='images/project/estimate.png' border='0' width='16' height='16'></a>";

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

/**************** Search in CostBook Sub-Window **********************************/
function vaildateKey1()
{
	key1=document.getElementById('searchKeyForCB').value;
	if(key1.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchCbCatAjax();
		//alert(key1);
	}
}

function callSearchCbCatAjax(id) {
	if(document.getElementById(cbCatTablecontainer)==null) return;
	var myCbCatRequest=getHTMLHTTPRequest();
	cbCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key1);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20350+"&key="+searchString+"&method="+"searchCostBook";
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

/**********************************************************/
/*
 * add new overhead to selected estimate
 */
var myOverheadRow;
var initItemWin=function(context,arg) {
	myOverheadRow=null;
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
		myOverheadRow=tmp;
	}
	else
	{
		var tbl=document.getElementById(arg);
		for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
			if(tbl.tBodies[0].rows[i].myRow && tbl.tBodies[0].rows[i].myRow.content[1].getAttribute('type') == 'radio' && tbl.tBodies[0].rows[i].myRow.content[1].checked) {
				myOverheadRow=tbl.tBodies[0].rows[i];
			}
		}
	}
	if(myOverheadRow!=null)
		openAddJobsWin();
};

var overheadsContainerDiv="blankHidden1";
var overheadsInnerDivPrefix="overheadsInnerDivPrefix";
var overheadsWindowIdPrefix="overheadsWindowIdPrefix";
var INNER_OVERHEAD_TABLE_NAME_PREFIX="innerOverheadTableNamePrefix";
var INNER_OVERHEAD_NAV_DIV_PREFIX="innerOverheadNavDivPrefix";
var openAddJobsWin=function() {
	var overheadEstimateId=myOverheadRow.myRow.content[6];
	var estimateName=myOverheadRow.myRow.content[4].data;
	var innerStr="<div id='"+overheadsInnerDivPrefix+overheadEstimateId+"' class='smallText'>Loading content, please wait...</div>";
	document.getElementById(overheadsContainerDiv).innerHTML=innerStr;
	internalWindow.open(overheadsWindowIdPrefix+overheadEstimateId, 'div', overheadsContainerDiv, 'Overheads for #'+estimateName, 'width=850px,height=500px,left=5px,top=5px,resize=1,scrolling=1');
	callShowOverheadsAjax(overheadEstimateId);
};

var callShowOverheadsAjax=function(estimateId) {
	//if(document.getElementById(INNER_OVERHEAD_NAV_DIV_PREFIX+estimateId)==null) return;
	if(document.getElementById(overheadsInnerDivPrefix+estimateId)==null) return;
	var myShowOverheadsRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20370+"&estimateId="+estimateId+"&method="+"getOverhead";
	myShowOverheadsRequest.open("GET",url,true);
	myShowOverheadsRequest.onreadystatechange=function() {
		if(myShowOverheadsRequest.readyState==4) {
			if(myShowOverheadsRequest.status==200) {
				renderOverheads(myShowOverheadsRequest);
			}
			else {
				alert("Connection Problem:"+myShowOverheadsRequest.statusText);
			}
		}
	};
	myShowOverheadsRequest.send(null);
};

var renderOverheads=function(myShowOverheadsRequest) {
	var xmlDoc=myShowOverheadsRequest.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	//alert(myShowOverheadsRequest.responseText);
	var estimateTags=xmlDoc.getElementsByTagName("estimate");
	var estimateId=0;
	if(estimateTags!=null && estimateTags.length>0)
	{
		estimateId=estimateTags[0].getAttribute("id");

		var overheadsDiv=document.getElementById(overheadsInnerDivPrefix+estimateId);
		overheadsDiv.setAttribute("estimateRef", estimateId);
		var str="<div id='"+INNER_OVERHEAD_NAV_DIV_PREFIX+estimateId+"'></div>";
		str+="<table width='97%' class='innerContentTable' id='"+INNER_OVERHEAD_TABLE_NAME_PREFIX+estimateId+"'><thead id='JOBTHEAD"+estimateId+"'><tr><td width='16px'>&nbsp;</td><td width='16px'>Sl</td><td width='30%'>Overhead Title</td><td>Overhead Percent</td><td>Overhead Type</td><td>On Amount</td><td>D</td></tr></thead><tbody id='JOBTBODY"+estimateId+"'></tbody></table>";
		overheadsDiv.innerHTML=str;
		contextMenu.attachTo('JOBTHEAD'+estimateId,menu2());
		contextMenu.attachTo('JOBTBODY'+estimateId,menu2());
		updateOverheadsNav(xmlDoc,INNER_OVERHEAD_NAV_DIV_PREFIX,INNER_OVERHEAD_TABLE_NAME_PREFIX,estimateId);
		populateOverheadsTable(xmlDoc,INNER_OVERHEAD_TABLE_NAME_PREFIX,estimateId);
		addTableRolloverEffect(INNER_OVERHEAD_TABLE_NAME_PREFIX+estimateId ,'tableRollOverEffect1','tableRowClickEffect1');
	}
	else
	{
		var errorFlag=systemStatus(null,systemMsg);
		if(errorFlag==0) return;
	}

};

var updateOverheadsNav=function(xmlDoc,divPrefix,tableNamePrefix,billId) {
	var str="<table class='innerNavTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='addNewOverheadBox(\""+tableNamePrefix+"\","+billId+");'>Add New</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='editCheckedOverheadsBox(\""+tableNamePrefix+"\","+billId+");'>Edit[D]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteOverheadsChecked(\""+tableNamePrefix+billId+"\");'>Delete[D]</a></td>";

	str+="</tr></table>";
	document.getElementById(divPrefix+billId).innerHTML=str;
};

var populateOverheadsTable=function(xmlDoc,tableNamePrefix,overheadId){
	var tableName=tableNamePrefix+overheadId;
	var content=xmlDoc.getElementsByTagName("entry");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data; // overhead id
		param[1]=content[i].childNodes[1].firstChild.data; //overhead title
		param[2]=content[i].childNodes[2].firstChild.data; // overhead percent
		param[3]=content[i].childNodes[3].firstChild.data; // type 
		param[4]=content[i].childNodes[4].firstChild.data;  // amount
		param[5]=content[i].childNodes[5].firstChild.data; // estimate id
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


	//Cell3: percent
	cell[3]=row.insertCell(3);
	var percentTb=getTextBox(10,param[2]);
	percentTb.style.display='none';
	var percent=document.createTextNode(param[2]);
	cell[3].appendChild(percentTb);
	cell[3].appendChild(percent);


	//Cell4: Type
	cell[4]=row.insertCell(4);
	var type=document.createTextNode(param[3]);

	var typeTb=getSelectBox(row);
	var objOption1=getOptionBox('Actual','Actual',param[3]);
	var objOption2=getOptionBox('DR','DR',param[3]);
	var objOption3=getOptionBox('Amount','Amount',param[3]);
	typeTb.appendChild(objOption1);
	typeTb.appendChild(objOption2);
	typeTb.appendChild(objOption3);
	cell[4].appendChild(typeTb);
	cell[4].appendChild(type);
	typeTb.style.display='none';

	//Cell5: Amount
	cell[5]=row.insertCell(5);
	var amountTb;
	if(param[3]=="Amount")
		amountTb=getTextBox(10,param[4]);
	else
		amountTb=getTextBox(10,"-");
	amountTb.style.display='none';
	var amount;
	if(param[3]=="Amount")
		amount=document.createTextNode(param[4]);
	else
		amount=document.createTextNode("-");
	cell[5].appendChild(amountTb);
	cell[5].appendChild(amount);


	//Cell9: Checkbox
	cell[6]=row.insertCell(6);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[6].appendChild(checkBox);

	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;

	rowContents[4]=description;
	rowContents[5]=descriptionTb;

	rowContents[6]=percent;
	rowContents[7]=percentTb;

	rowContents[8]=type;
	rowContents[9]=typeTb;

	rowContents[10]=amount;
	rowContents[11]=amountTb;

	rowContents[12]=param[0];			//ID
	rowContents[13]=param[5];			//ESTIMATE_ID
	//rowContents[14]=param[3];			//TYPE_FLAG
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;

};

var getTextBox=function(size,value) {
	var tb=document.createElement('input');
	tb.setAttribute('type', 'text');
	tb.setAttribute('size', size);
	tb.setAttribute('value', value);

	return tb;
};
var getSelectBox=function(row) {
	var tb=document.createElement('select');
	//tb.setAttribute('onchange','hideTextBox(this);');
	tb.onchange=hideTextBox;
	return tb;
};

var getOptionBox=function(name,value,selected) {
	var tb=document.createElement('option');
	tb.setAttribute('value', value);
	var description=document.createTextNode(name);
	if(value==selected)
		tb.setAttribute('selected', true);
	tb.appendChild(description);
	return tb;
};
var hideTextBox=function (e){
	var eventSrc=e;
	if(!eventSrc)
		eventSrc=window.event;
	var row;
	var tbl=null;
	var obj;
	if(eventSrc.target)
	{
		obj=eventSrc.target;
		row=eventSrc.target.parentNode.parentNode;
	}
	else if(eventSrc.srcElement)
	{
		obj=eventSrc.srcElement;
		row=eventSrc.srcElement.parentNode.parentNode;
	}
	if(row!=null)
	{
		var x=row.cells;
		var t=x[5].firstChild;
		if(obj.options[obj.selectedIndex].value=='Amount')
		{
			t.style.display='inline';
		}else
		{
			t.style.display='none';
		}
	}
};

/**********************************************************/
/*
 * Delete selected overheads and rows
 */
function callDeleteOverheadsAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myOverheadDeleteRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	for(var i=0; i<obj.length; i++) {
		if(i==0)
			id+=obj[i].myRow.content[12];
		else
			id+=","+obj[i].myRow.content[12];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20380+"&id="+id+"&method=deleteOverhead";
	//alert(url);
	myOverheadDeleteRequest.open("GET",url,true);

	myOverheadDeleteRequest.onreadystatechange=function()
	{
		if(myOverheadDeleteRequest.readyState==4) {
			if(myOverheadDeleteRequest.status==200) {
				var xmlDoc=myOverheadDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myOverheadDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myOverheadDeleteRequest.send(null);
}

/*
 * gets checked rows from table with ID $tblId$
 */
/*
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
}*/
/*
 * deletes checked rows, from the table with ID $tblId$
 */
var deleteOverheadsChecked=function (tblId) {
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
		callDeleteOverheadsAjax(tbl,checkedObjArray,rIndex);
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
var deleteContextOverheadsChecked=function () {

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
	callDeleteOverheadsAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Add a new Overhead
 */

/*
 * This method is called from context menu, adds an ADD box at the end
 * of the list as many times it is called, uses addNewJobBox internally
 */
var addContextOverheadsBox=function() {
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
	var estimateId=div.getAttribute("estimateRef");
	//alert(billId);
	//row.myRow.content[0].checked=true;
	addNewOverheadBox(INNER_OVERHEAD_TABLE_NAME_PREFIX,estimateId);
};

/*
 * This method will be called from Nav bar, inserts an ADD box
 * at the end of the Jobs list
 */
var addNewOverheadBox=function(tblIdprefix,estimateId) {
	var tbl=document.getElementById(tblIdprefix+estimateId);
	var nextRow = tbl.tBodies[0].rows.length;
	var num = nextRow;
	var iteration = num + ROW_BASE;

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	var cell=Array();
	//Cell0: Image(OK)
	cell[0] = row.insertCell(0);
	//cell[0].innerHTML="<img src='images/common/url.gif' border='0'>";
	cell[0].innerHTML="<a href='javascript:void(0);' onclick='addNewOverhead(event,"+estimateId+",\"add\");'><img src='images/common/tick.gif' border='0'></a>";
	//alert(cell[0].childNodes[0].childNodes[0].tagName);

	//Cell1: Image(DISCARD)
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	//slNo.style.display='none';
	cell[1].innerHTML="<a href='javascript:void(0);' onclick='addNewOverhead(event,"+estimateId+",\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
	//cell[1].appendChild(slNo);

	//Cell2: Description
	cell[2]=row.insertCell(2);
	var descriptionTb=getTextBox(20,"-");
	var description=document.createTextNode("");
	cell[2].appendChild(descriptionTb);
	cell[2].appendChild(description);


	//Cell3: percent
	cell[3]=row.insertCell(3);
	var percentTb=getTextBox(10,"-");
	var percent=document.createTextNode("");
	cell[3].appendChild(percentTb);
	cell[3].appendChild(percent);


	//Cell4: Type
	cell[4]=row.insertCell(4);
	var type=document.createTextNode("");

	var typeTb=getSelectBox(row);
	var objOption1=getOptionBox('Actual','Actual','');
	var objOption2=getOptionBox('DR','DR','');
	var objOption3=getOptionBox('Amount','Amount','');
	typeTb.appendChild(objOption1);
	typeTb.appendChild(objOption2);
	typeTb.appendChild(objOption3);
	cell[4].appendChild(typeTb);
	cell[4].appendChild(type);

	//Cell5: Amount
	cell[5]=row.insertCell(5);
	var amountTb=getTextBox(10,"-");
	amountTb.style.display='none';
	var amount=document.createTextNode("");
	cell[5].appendChild(amountTb);
	cell[5].appendChild(amount);


	//Cell6: Checkbox
	cell[6]=row.insertCell(6);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	checkBox.disabled=true;
	cell[6].appendChild(checkBox);


	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;

	rowContents[4]=description;
	rowContents[5]=descriptionTb;

	rowContents[6]=percent;
	rowContents[7]=percentTb;

	rowContents[8]=type;
	rowContents[9]=typeTb;

	rowContents[10]=amount;
	rowContents[11]=amountTb;

	rowContents[12]=0;				//ID
	rowContents[13]=estimateId;			//ESTIMATE_ID

	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/*
 * Adds a new job to the list, sends data to the server and
 * updates the list accordingly
 */
var addNewOverhead=function(e,estimateId,flag) {
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
		var percent=URLEncode(row.myRow.content[7].value);
		var type=URLEncode(row.myRow.content[9].value);
		var amount=URLEncode(row.myRow.content[11].value);
		var myJobAddData="estimateId="+estimateId;
		myJobAddData+="&description="+description;
		myJobAddData+="&percent="+percent;
		myJobAddData+="&type="+type;
		myJobAddData+="&amount="+amount;
		//myJobAddData=myJobAddData.replace(/\+/g,'%2B');
		//myJobAddData=myJobAddData.replace(/\+/g,'%2B');

		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20390+"&method=addOverhead";
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
						row.myRow.content[4].data=row.myRow.content[5].value;
						row.myRow.content[6].data=row.myRow.content[7].value;
						row.myRow.content[8].data=row.myRow.content[9].value;
						row.myRow.content[10].data=row.myRow.content[11].value;
						row.myRow.content[12]=""+newId;
						row.myRow.content[13]=""+estimateId;
						for(var i=5;i<=11;i+=2)
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
 * Edit a overhead
 */

/*
 * This method will be called from context menu
 * It calls editCheckedoverheadsBox, with setting checkbox to checked
 * for the source row, so it opens edit window which have been checked too
 */
var editContextOverheadsBox=function() {
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
	var estimateId=div.getAttribute("estimateRef");
	row.myRow.content[0].checked=true;
	editCheckedOverheadsBox(INNER_OVERHEAD_TABLE_NAME_PREFIX,estimateId);
};

/*
 * This method will be called from nav bar, it opens edit bar for
 * all selected jobs, no communication with the server is peformed here
 */
var editCheckedOverheadsBox=function(tblIdPrefix,estimateId) {
	var tbl=document.getElementById(tblIdPrefix+estimateId);
	for (var i=0; i<tbl.tBodies[0].rows.length; i++)
	{

		if(tbl.tBodies[0].rows[i].myRow.content[0].checked) {
			var row=tbl.tBodies[0].rows[i];
			//Preserve Sl No.
			row.myRow.content[3]=document.createTextNode(row.myRow.content[3].data);
			row.cells[0].innerHTML="";
			row.cells[1].innerHTML="";
			row.cells[0].innerHTML="<a href='javascript:void(0);' onclick='editSelectedOverhead(event,"+estimateId+",\"edit\");'><img src='images/common/tick.gif' border='0'></a>";
			row.cells[1].innerHTML="<a href='javascript:void(0);' onclick='editSelectedOverhead(event,"+estimateId+",\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
			var textNodes=Array();
			for(var j=4;j<=10;j+=2)
			{
				var displayedText=row.myRow.content[j];
				var sp=document.createElement('span');
				sp.appendChild(document.createTextNode(displayedText.data));
				sp.style.display='none';
				displayedText.parentNode.appendChild(sp);
				displayedText.data='';
			}
			for(var k=5;k<=11;k+=2)
			{
				if(k==11){
					//alert(row.myRow.content[9].value);
					if(row.myRow.content[9].value=='Actual'||row.myRow.content[9].value=='DR')
						row.myRow.content[k].style.display='none';
					else
						row.myRow.content[k].style.display='';
				}else{row.myRow.content[k].style.display='';
				}
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
var editSelectedOverhead=function(e,estimateId,flag) {
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
		for(var w=4;w<=10;w+=2)
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
		var percent=URLEncode(row.myRow.content[7].value);
		var type=URLEncode(row.myRow.content[9].value);
		var amount=URLEncode(row.myRow.content[11].value);
		var myJobEditData="id="+row.myRow.content[12];
		myJobEditData+="&description="+description;
		myJobEditData+="&percent="+percent;
		myJobEditData+="&type="+type;
		myJobEditData+="&amount="+amount;
		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20391+"&method=updateOverhead";
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
						for(w=4;w<=10;w+=2)
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
							//If We have toggled from Amount to Actual/DR reset the amount column

							else if(w==10 && row.myRow.content[8].data!="Amount")
							{
								displayedText.data=editBox.value="-";
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


/**********************************************************/
/*
 * Init the first level
 */
initializeProjectTable(10410);