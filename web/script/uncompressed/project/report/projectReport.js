/**********************************************************
 * Project Reports(Cost-sheet, Bill of Quantity)
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

//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="projectSample";			//Should be named in HTML
var DIV_NAV_NAME="projectNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="PROJREP_TTHEAD123";				
var ctx_TBODY="PROJREP_TTBODY123";
/*
 * For Search
 */
var key='qwerty';
var sid=0;
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
	if(tmp.myRow==null)
	{
		setMenuItemState(211740,'disabled');	//REPORTS
		//setMenuItemState(150012,'disabled');	//CHANGE CB
	}
	else
	{
		setMenuItemState(211740,'regular');	//REPORTS

		if(tmp.myRow.content[7]=="project")
		{
			setMenuItemState(211780,'disabled');	//BILL
			//setMenuItemState(211790,'disabled');	//BOQ
			setMenuItemState(211790,'regular');	//BOQ
			//setMenuItemState(150012,'disabled');	//CHANGE CB

			setMenuItemState(211750,'regular');	//REFERENCES
			setMenuItemState(211760,'regular');	//PROJECT SUMMARY
		}
		else
		{
			setMenuItemState(211780,'regular');	//BILL
			setMenuItemState(211790,'regular');	//BOQ
			//setMenuItemState(150012,'disabled');	//CHANGE CB

			setMenuItemState(211750,'disabled');	//REFERENCES
			setMenuItemState(211760,'disabled');	//PROJECT SUMMARY
		}

	}
	if(projectTableCurrentParent==1)
	{
		setMenuItemState(211710,'disabled');	//UP
		setMenuItemState(211720,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(211710,'regular');	//UP
		setMenuItemState(211720,'regular');	//TOP
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
	var myProjectRequest=getHTMLHTTPRequest();
	projectTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+102100+"&parent="+id+"&method="+"get";

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
	str+="<table id='"+TABLE_NAME+"' width='100%' class='reportTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='35%'>Description</td><td width='35%'>Remarks</td><td width='100%'>CostBook</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(projectTablecontainer).innerHTML=str;
	//Update the project navigation bar
	updateProjectNav(xmlDoc,DIV_NAV_NAME);
	populateTable(xmlDoc,TABLE_NAME);
	addTableRolloverEffect(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
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
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callProjectAjax("+projectTableparent+")'><img src='images/project/report/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callProjectAjax("+projectTableTop+")'><img src='images/project/report/top.png' border='0' alt='Top level'></a></td>";
		//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCostBookEditWindow(\""+TABLE_NAME+"\");'>Change CostBook[E]</a></td>";
	}
	else
	{
		str+="<td><img src='images/project/report/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/project/report/top1.png' alt='Top level'></td>";
		//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCostBookEditWindow(\""+TABLE_NAME+"\");'>Change CostBook[E]</a></td>";
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
		cell[0].innerHTML="<img src='images/project/estimate.png' border='0' width='16' height='16'>";
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

	//Cell4: Remarks
	cell[4]=row.insertCell(4);
	var remarks=document.createTextNode(param[4]);
	cell[4].appendChild(remarks);

	//Cell5: CostBook Name
	cell[5]=row.insertCell(5);
	var costBook;
	if(param[0]=="project")
		costBook=document.createTextNode("--");
	else
		costBook=document.createTextNode(param[7]);
	cell[5].appendChild(costBook);

	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=0;					//keep it at $1 to access easily
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
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
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
	internalWindow.open(filesWindowId, "iframe","MyActionDispatcher?path=102400&method=getProjectRefForView&id="+projectId, "Files for Project: ["+projectName+"]",'width=900px,height=400px,left=10px,top=10px,resize=1,scrolling=1');
};


/**********************************************************/
/*
 * Open Project Summary
 */

var openProjectSummary=function() {
	//alert("projectSummary");
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

	window.open("MyActionDispatcher?path=102600&projectId="+projectId+"&method=projectSummaryPDF");
};

var openEstimateDetails=function() {
	var estimateId;
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

	estimateId=""+row.myRow.content[6];
	var estimateName=row.myRow.content[4].data;

	window.open("MyActionDispatcher?path=102700&estimateId="+estimateId+"&method=estimateDetailsPDF");
};

var openBiilOfQuantity=function() {
	var projectId;
	var estimateId;
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
	if(row.myRow.content[7]=="project")
	{
		projectId=""+row.myRow.content[6];
		var projectName=row.myRow.content[4].data;
		window.open("MyActionDispatcher?path=102800&projectId="+projectId+"&method=projectBoqPDF");
	}
	else
	{
		estimateId=""+row.myRow.content[6];
		var estimateName=row.myRow.content[4].data;
		window.open("MyActionDispatcher?path=102800&estimateId="+estimateId+"&method=estimateBoqPDF");
	}
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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+102100+"&key="+searchString+"&method="+"searchProject";
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
	innerStr+="<table id='searchTable' width='100%' class='reportTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td>Description</td></tr></thead>";
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

/**********************************************************/
/*
 * Init the first level
 */
initializeProjectTable(10260);
//callProjectAjax(1);