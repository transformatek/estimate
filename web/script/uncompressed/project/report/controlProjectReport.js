/**********************************************************
 * Project Reports: Schedule, audit and reconciliation
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

//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="controlProjectSample";	//Should be named in HTML
var DIV_NAV_NAME="controlProjectNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="CPROJREPORT_TTHEAD123";				
var ctx_TBODY="CPROJREPORT_TTBODY123";

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
		setMenuItemState(212540,'disabled');	//PROJECT REPORT
		setMenuItemState(212550,'disabled');	//ESTIMATE REPORT
	}
	else
	{
		if(tmp.myRow.content[7]=="controlProject")
		{
			setMenuItemState(212540,'regular');	//PROJECT REPORT
			setMenuItemState(212550,'disabled');	//ESTIMATE REPORT
		}
		else
		{
			setMenuItemState(212540,'disabled');	//PROJECT REPORT
			setMenuItemState(212550,'regular');	//ESTIMATE REPORT
		}
	}


	if(controlProjectTableCurrentParent==1)
	{
		setMenuItemState(212510,'disabled');	//UP
		setMenuItemState(212520,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(212510,'regular');	//UP
		setMenuItemState(212520,'regular');	//TOP
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
	var myControlProjectRequest=getHTMLHTTPRequest();
	controlProjectTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+103100+"&parent="+id+"&method="+"get";

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
	str+="<table id='"+TABLE_NAME+"' width='100%' class='reportTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='100%'>Description</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(controlProjectTablecontainer).innerHTML=str;
	//Update the controlProject navigation bar
	updateControlProjectNav(xmlDoc,DIV_NAV_NAME);
	populateTable(xmlDoc,TABLE_NAME);
	addTableRolloverEffect(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
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
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callControlProjectAjax("+controlProjectTableparent+")'><img src='images/project/report/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callControlProjectAjax("+controlProjectTableTop+")'><img src='images/project/report/top.png' border='0' alt='Top level'></a></td>";
		//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myCostBookEditWindow(\""+TABLE_NAME+"\");'>Change CostBook[E]</a></td>";
	}
	else
	{
		str+="<td><img src='images/project/report/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/project/report/top1.png' alt='Top level'></td>";
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
		cell[0].innerHTML="<img src='images/project/control.png' border='0' width='16' height='16'>";
	//cell[0].innerHTML="<a href='javascript:void(0);' onclick='openControlBillWindow(event);'><img src='images/project/control.png' border='0' width='16' height='16'></a>";

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
 * Open Date Picker Window
 */

/**********************************************************/
/*
 * Edit Jobs schedule (Planned)
 */
var jobPickerWindowDiv="blankHidden1";
var jobPickerWindowId="jobPickerWindowId";
var jobPickerWindow=null;
var rowToEdit=null;
var jobIdentifierString;
var getTimeFrame=function(s) {
	jobIdentifierString=s;
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
	if(row!=null && row.myRow!=null)
	{
		//alert(row.myRow.content[0]);
		rowToEdit=row;
		populateDatePickerWin(row);
	}
	else return;
};

var populateDatePickerWin=function(row) {
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var dateString=(day + "/" + (month<10?"0"+month:""+month) + "/" + year);
	dateString="";
	var innerStr="<table>";
	innerStr+="<tr><td><label>From Date:</label></td><td><input size='40' type='text' id='editStartDate' value='"+dateString+"' onclick='pickDate(this,this);' readonly='readonly'> dd/mm/yyyy</td></tr>";
	innerStr+="<tr><td><label>To Date:</label></td><td><input size='40' type='text' id='editFinishDate' value='"+dateString+"' onclick='pickDate(this,this);' readonly='readonly'> dd/mm/yyyy</td></tr>";

	innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='pickReport();'>Report</a>&nbsp;&nbsp;";
	innerStr+="<a href='javascript:void(0)' onclick='resetDatePicker();'>Reset</a></td></tr>";

	innerStr+="</table>";

	var editableDiv=document.getElementById(jobPickerWindowDiv);
	editableDiv.innerHTML=innerStr;

	openScheduleEditWin();
};

var resetDatePicker=function() {
	document.getElementById('editStartDate').value="";
	document.getElementById('editFinishDate').value="";
};
var openScheduleEditWin=function() {
	var title=rowToEdit.myRow.content[4].data;
	jobPickerWindow=internalWindow.open(jobPickerWindowId, 'div', jobPickerWindowDiv, '#Date Picker: ['+title+']', 'width=450px,height=350px,left=200px,top=150px,resize=1,scrolling=1');
	jobPickerWindow.onclose=function(){
		if(calendarObjForForm.isVisible()){
			calendarObjForForm.hide();
		}
		return true;
	};
};

var pickReport=function() {
	var reportCommand=jobIdentifierString;
	if(reportCommand=="workStatus")
		openWorkStatusSummary();
	else if(reportCommand=="projectStatus")
		openProjectStatusSummary();
};

var openWorkStatusSummary=function() {
	if(rowToEdit==null) return;
	if(rowToEdit.myRow==null) return;

	var estimateId=rowToEdit.myRow.content[11];
	var controlEstimateId=rowToEdit.myRow.content[6];
	var sdate=""+document.getElementById("editStartDate").value;
	sdate=URLEncode(sdate==""?"-":sdate);
	var fdate=""+document.getElementById("editFinishDate").value;
	fdate=URLEncode(fdate==""?"-":fdate);
	window.open("MyActionDispatcher?path=103400&estimateId="+estimateId+"&controlEstimateId="+controlEstimateId+"&sdate="+sdate+"&fdate="+fdate+"&method=openWorkStatusSummaryPDF");
	jobPickerWindow.close();
};

var openProjectStatusSummary=function() {
	if(rowToEdit==null) return;
	if(rowToEdit.myRow==null) return;

	var projectId=rowToEdit.myRow.content[6];
	var sdate=""+document.getElementById("editStartDate").value;
	sdate=URLEncode(sdate==""?"-":sdate);
	var fdate=""+document.getElementById("editFinishDate").value;
	fdate=URLEncode(fdate==""?"-":fdate);
	window.open("MyActionDispatcher?path=103500&projectId="+projectId+"&sdate="+sdate+"&fdate="+fdate+"&method=openProjectStatusSummaryPDF");
	jobPickerWindow.close();
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
	internalWindow.open(filesWindowId, "iframe","MyActionDispatcher?path=103200&method=getProjectRefForUpdate&id="+projectId+"&uploadPath="+103200, "Files for Project: ["+projectName+"]",'width=900px,height=400px,left=10px,top=10px,resize=1,scrolling=1');
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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+103100+"&key="+searchString+"&method="+"searchControlProject";
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
	cell[0].className='projIconImage';
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

/**********************************************************/
/*
 * Init the first level
 */
//callControlProjectAjax(1);
initializeControlProjectTable(10270);