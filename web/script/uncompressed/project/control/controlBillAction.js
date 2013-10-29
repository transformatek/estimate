/**********************************************************
 * Create execution-plan and record as-built data
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

var billTablecontainer="blankContent";	//this DIV will contain our bill
var TABLE_NAME="controlBillSample";			//Should be named in HTML
var DIV_NAV_NAME="controlBillNavDiv";			//Navigation Bar
var ROW_BASE=1;	
var controlEstimateId=0;

/* ============================================================= */
/*
 * Initializes Context Menu for Control Estimate Table
 * and then populates the table
 */
var contextMenu=null;
contextMenu = new DHTMLSuite.contextMenu();
//DHTMLSuite.commonObj.setCssCacheStatus(false);
contextMenu.setWidth(140);

var myCurrentControlEstimateId=0;
var myCurrentEstimateId=0;
var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			//getContextMenuModel();
			callControlBillAjax(myCurrentControlEstimateId,myCurrentEstimateId);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeControlBillTable=function(id,controlEstimateId,estimateId)
{
	myCurrentMenuParent=id;
	myCurrentControlEstimateId=controlEstimateId;
	myCurrentEstimateId=estimateId;
	writeWaitMsg(billTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

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
	//TR->TBODY/THEAD->TABLE
	var tbl=tmp.parentNode.parentNode;
	var div=tbl.parentNode;

	//If context menu has been opened inside jobs sub window
	if(div.getAttribute("entryRef")!=null && div.getAttribute("entryRef")!="")
	{
		//alert(div.getAttribute("billRef"));
		hideMenuItem(212310);
		hideMenuItem(212330);

		showMenuItem(212340);
		showMenuItem(212350);

		if(tmp.myRow==null)
		{
			setMenuItemState(212350,'disabled');	//DELETE WORK
		}
		else
		{
			if(tmp.myRow.content[21]==0)
				setMenuItemState(212350,'disabled');	//DELETE WORK
			else
				setMenuItemState(212350,'regular');	//DELETE WORK
		}
	}
	else
	{
		//alert(div.getAttribute("billRef"));
		hideMenuItem(212340);
		hideMenuItem(212350);

		showMenuItem(212310);
		showMenuItem(212330);
		if(tmp.myRow==null)
		{
			setMenuItemState(212310,'disabled');	//SCHEDULE
			setMenuItemState(212330,'disabled');	//FINISHED JOBS
		}
		else
		{
			//alert(tmp.myRow.content[4]);
			if(tmp.myRow.content[4]=="plannedJobs")
			{
				//alert(tmp.myRow.content[5]);
				setMenuItemState(212310,'regular');	//SCHEDULE
				if(tmp.myRow.content[5]=='1')
					setMenuItemState(212330,'regular');	//FINISHED JOBS
				else
					setMenuItemState(212330,'disabled');	//FINISHED JOBS
			}
		}
	}
	//Impose Menu Permissions
	setMenuPermissions(currentMenuBar);
};


/**********************************************************/
function callControlBillAjax(id,estimateId) {
	//alert(id+", "+estimateId);

	if(document.getElementById(billTablecontainer)==null) return;
	controlEstimateId=id;
	var myBillRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21120+"&id="+id+"&estimateId="+estimateId+"&method=get";
	myBillRequest.open("GET",url,true);
	myBillRequest.onreadystatechange=function()
	{
		if(myBillRequest.readyState==4) {
			if(myBillRequest.status==200) {
				renderControlBill(myBillRequest);
			}
			else {
				alert("Connection Problem:"+myBillRequest.statusText);
			}
		}
	};
	writeWaitMsg(billTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");
	myBillRequest.send(null);

}

function renderControlBill(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(billTablecontainer,systemMsg);
	if(errorFlag==0) return;
	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead><tr><td width='10px'>&nbsp;</td><td width='1%'>Sl</td><td width='15%'>Name</td><td width='100%'>Description</td><td width='16px'>&nbsp;</td></tr></thead>";
	str+="<tbody></tbody></table>";
	document.getElementById(billTablecontainer).innerHTML=str;
	//Update the bill navigation bar
	updateBillNav(xmlDoc,DIV_NAV_NAME);
	populateTable(xmlDoc,TABLE_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	//contextMenu.attachTo(ctx_THEAD,menu2());
	//contextMenu.attachTo(ctx_TBODY,menu2());
}

/*
 * Update navigation bar for Bill Table according to current level
 */
var updateBillNav=function (xmlDoc,element) {
	var str="<table class='innerNavTable'><tr>";
	//str+="<td><h3>Plan Start And Finish Date</h3></td>";
	str+="<td>Filter: <input name='filter' onKeyUp='filter(this, \""+TABLE_NAME+"\")' type='text'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};

/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("bill");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;	//Bill ID
		param[1]=content[i].childNodes[1].firstChild.data;	//Assembly NAME
		param[2]=content[i].childNodes[2].firstChild.data;	//Assembly Description
		addRowToTable1(tbl,rowToInsertAt,param);
		addHiddenRowToTable(tbl,rowToInsertAt+1,param[0]);
	}
	//reorderJobRows(tbl, 0);
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
var reorderJobRows=function (tbl, startingIndex) {
	if (tbl.tBodies[0].rows[startingIndex]) {
		var count = startingIndex + ROW_BASE;
		for (var i=startingIndex; i<tbl.tBodies[0].rows.length; i++) {
			tbl.tBodies[0].rows[i].myRow.content[0].data = count; // text
			count++;
		}
	}
}
 */
var addRowToTable1=function (tbl,num,param) {
	var nextRow = tbl.tBodies[0].rows.length;
	var iteration = nextRow + ROW_BASE;
	if(num==-1) {
		num = nextRow;
	}
	else {
		iteration = (num + ROW_BASE+1)/2;
	}

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	cell[0].innerHTML="<img src='images/project/entry.png' border='0'>";

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

	//Cell4: show detail
	cell[4]=row.insertCell(4);
	//var show=document.createTextNode('show detail');
	cell[4].innerHTML="<a style='text-decoration: none;' href='javascript:void(0);' onclick='showBillDetail("+param[0]+");'>Show</a>";
	cell[4].id='td'+param[0];

	var rowContents=Array();
	rowContents[0]=slNo; 	//Sl No.
	rowContents[1]=param[0]; 	//ID
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/*
 * Filters Table rows for phrase
 */
function filter (phrase, _id){
	var words = phrase.value.toLowerCase().split(" ");
	var table = document.getElementById(_id);
	//alert(_id);
	var ele;
	for (var r = 0; r < table.tBodies[0].rows.length; r+=2){
		ele = table.tBodies[0].rows[r].innerHTML.replace(/<[^>]+>/g,"");
		var displayStyle = 'none';
		for (var i = 0; i < words.length; i++) {
			if (ele.toLowerCase().indexOf(words[i])>=0)
				displayStyle = '';
			else {
				displayStyle = 'none';
				break;
			}
		}
		if(displayStyle=='' && table.tBodies[0].rows[r].style.display=='none')
		{
			var currentId=table.tBodies[0].rows[r].myRow.content[1];
			if(table.tBodies[0].rows[r].style.display=='none')
				table.tBodies[0].rows[r].cells[4].innerHTML="<a style='text-decoration: none;' href='javascript:void(0);' onclick='showBillDetail("+currentId+");'>Show</a>";
		}
		table.tBodies[0].rows[r].style.display = displayStyle;
		if(displayStyle=='none' && table.tBodies[0].rows[r+1].style.display=='')
		{
			table.tBodies[0].rows[r+1].style.display = displayStyle;
		}
		else if(displayStyle=='' && table.tBodies[0].rows[r+1].style.display=='none')
			table.tBodies[0].rows[r+1].style.display = 'none';
	}
}

var addHiddenRowToTable=function (tbl,num,param) {
	var row=tbl.tBodies[0].insertRow(num);
	row.id="jobsRow"+param;
	row.style.display='none';
	contextMenu.attachTo(row.id,menu2());

	var cell=Array();

	cell[1]=row.insertCell(0);
	cell[1].colSpan=7;
	cell[1].width = '100%';
	var srcTable = document.createElement("table");
	srcTable.id='table'+param;
	srcTable.className='ControlJobtable';
	srcTable.cellPadding= '0';
	srcTable.cellSpacing='0';

	var tmpRow = srcTable.insertRow(0);
	tmpRow.className='classControlHeader';
	appendCell(tmpRow,'3%','Sl',0);
	appendCell(tmpRow,'4%','ID',1);
	appendCell(tmpRow,'20%','Description',2);
	appendCell(tmpRow,'9%','Number',3);
	appendCell(tmpRow,'9%','Length',4);
	appendCell(tmpRow,'9%','Breadth',5);
	appendCell(tmpRow,'9%','Height',6);
	appendCell(tmpRow,'9%','Weight',7);
	appendCell(tmpRow,'7%','Total',8);
	appendCell(tmpRow,'8%','Start',9);
	appendCell(tmpRow,'8%','Finish',10);
	appendCell(tmpRow,'5%','Status',11);
	cell[1].appendChild(srcTable);
	initiateTableRollover('table'+param,'tableRollOverEffect2','tableRowClickEffect2');
};

var appendCell=function(row,width,text,num){
	tmpCell=row.insertCell(num);
	tmpCell.width=width;
	tmpCell.appendChild(document.createTextNode(text));
};

var showBillDetail=function(id) {
	showBillTable(id);
	var tbl=document.getElementById('table'+id);
	var rowToInsertAt = tbl.tBodies[0].rows.length;
	if(rowToInsertAt <= 1){
		var myBillRequest=getHTMLHTTPRequest();
		var myRandom=parseInt(Math.random()*99999999);
		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21130+"&id="+id+"&method=get";
		myBillRequest.open("GET",url,true);
		myBillRequest.onreadystatechange=function()
		{
			if(myBillRequest.readyState==4) {
				if(myBillRequest.status==200) {
					renderBillDetail(myBillRequest);
				}
				else {
					alert("Connection Problem:"+myBillRequest.statusText);
				}
				closeSplashScreen();
			}
		};
		//writeWaitMsg(billTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");
		openSplashScreen();
		myBillRequest.send(null);
	}
};

var showBillTable=function(id) {
	//alert(id);
	if(document.getElementById("jobsRow"+id).style.display=='none')
	{
		document.getElementById("jobsRow"+id).style.display='';
		document.getElementById("td"+id).innerHTML="<a style='text-decoration: none;' href='javascript:void(0);' onclick='showBillDetail("+id+");'>Hide</a>";
	}
	else
	{
		document.getElementById("jobsRow"+id).style.display='none';
		document.getElementById("td"+id).innerHTML="<a style='text-decoration: none;' href='javascript:void(0);' onclick='showBillDetail("+id+");'>Show</a>";
	}
};


var renderBillDetail=function(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(null,systemMsg);
	if(errorFlag==0) return;
	var key=xmlDoc.getElementsByTagName("Key");
	if(key!=null && key.length>0)
	{
		var billId=xmlDoc.getElementsByTagName("Key")[0].getAttribute("id");
		populateDetailTable(xmlDoc,'table'+billId);
	}
	//alert("Got the List of Jobs");
};

var populateDetailTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("entry");
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
		param[5]=content[i].childNodes[5].firstChild.data;
		param[6]=content[i].childNodes[6].firstChild.data;
		param[7]=content[i].childNodes[7].firstChild.data;
		param[8]=content[i].childNodes[8].firstChild.data;
		param[9]=content[i].childNodes[9].firstChild.data;
		param[10]=content[i].childNodes[10].firstChild.data;
		param[11]=tableName;	//Inner table name, to get Plan start/finish date
		addRowToDetailTable(tbl,rowToInsertAt,param);
	}
};

var addRowToDetailTable=function (tbl,num,param) {
	var nextRow = tbl.tBodies[0].rows.length;
	var iteration = nextRow + ROW_BASE;
	if(num==-1) {
		num = nextRow;
	}
	else {
		iteration = num + ROW_BASE-1;
	}

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	var cell=Array();

	//Cell1: Sl No.
	cell[0]=row.insertCell(0);
	var slNo = document.createTextNode(iteration);
	cell[0].appendChild(slNo);

	//Cell0: ID
	cell[1] = row.insertCell(1);
	var entryId=document.createTextNode(param[0]);
	cell[1].appendChild(entryId);

	//Cell2: Description
	cell[2]=row.insertCell(2);
	var description=document.createTextNode(param[1]);
	cell[2].appendChild(description);
	//cell[2].innerHTML="<a href='javascript:void(0);' onclick='openEntryWindow("+param[0]+");'>"+param[1]+"</a>";

	//Cell3: Numbers
	cell[3]=row.insertCell(3);
	var numbers=document.createTextNode(param[2]);
	cell[3].appendChild(numbers);

	//Cell4: Length
	cell[4]=row.insertCell(4);
	var length=document.createTextNode(param[3]);
	cell[4].appendChild(length);

	//Cell5: Breadth
	cell[5]=row.insertCell(5);
	var breadth=document.createTextNode(param[4]);
	cell[5].appendChild(breadth);

	//Cell6: Height
	cell[6]=row.insertCell(6);
	var height=document.createTextNode(param[5]);
	cell[6].appendChild(height);

	//Cell7: Weight
	cell[7]=row.insertCell(7);
	var weight=document.createTextNode(param[6]);
	cell[7].appendChild(weight);

	//Cell8: Total
	cell[8]=row.insertCell(8);
	var total=document.createTextNode(param[7]);
	cell[8].appendChild(total);

	//Cell9: Start Date
	cell[9]=row.insertCell(9);
	var sdate=document.createTextNode(param[8]);
	cell[9].appendChild(sdate);

	//Cell10: Finish Date
	cell[10]=row.insertCell(10);
	var fdate=document.createTextNode(param[9]);
	cell[10].appendChild(fdate);

	//Cell11: Status
	cell[11]=row.insertCell(11);
	var statusString="";
	if(param[10]=='0')
		statusString="Planned";
	else if(param[10]=='1')
		statusString="Running";
	else if(param[10]=='2')
		statusString="Halted";
	else if(param[10]=='3')
		statusString="Finished";
	else
		statusString="Undefined";
	var status=document.createTextNode(statusString);
	cell[11].appendChild(status);

	var rowContents=Array();
	rowContents[0]=param[0]; 	//entry_id
	rowContents[1]=sdate;		//Start
	rowContents[2]=fdate;		//Finish
	rowContents[3]=status;		//Status String
	rowContents[4]="plannedJobs";
	rowContents[5]=param[10];	//Status Code
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Edit Jobs schedule (Planned)
 */
var jobPropertiesWindowDiv="blankHidden1";
var jobPropertiesWindowId="jobPropertiesWindowId";
var jobPropertiesWindow=null;
var rowToEdit=null;
var planShcedule=function() {
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
	if(row!=null && row.myRow!=null && row.myRow.content[4]=="plannedJobs")
	{
		//alert(row.myRow.content[0]);
		rowToEdit=row;
		populateShceduleEditWin(row);
	}
	else return;
};

var populateShceduleEditWin=function(row) {
	var innerStr="<table>";
	innerStr+="<tr><td><label>Planned Start:</label></td><td><input size='40' type='text' id='editStartDate' value='"+row.myRow.content[1].data+"' onclick='pickDate(this,this,0);' readonly='readonly'> dd/mm/yyyy</td></tr>";
	innerStr+="<tr><td><label>Planned Finish:</label></td><td><input size='40' type='text' id='editFinishDate' value='"+row.myRow.content[2].data+"' onclick='pickDate(this,this,0);' readonly='readonly'> dd/mm/yyyy</td></tr>";

	innerStr+="<tr><td><label>Job Status:</label></td>";
	innerStr+="<td><select id='editStatus'>";
	innerStr+="<option value='0' "+(rowToEdit.myRow.content[5]=='0'?"selected='selected'":"")+">Planned</option>";
	innerStr+="<option value='1' "+(rowToEdit.myRow.content[5]=='1'?"selected='selected'":"")+">Running</option>";
	innerStr+="<option value='2' "+(rowToEdit.myRow.content[5]=='2'?"selected='selected'":"")+">Halted</option>";
	innerStr+="<option value='3' "+(rowToEdit.myRow.content[5]=='3'?"selected='selected'":"")+">Finished</option>";
	innerStr+="</select></td></tr>";

	innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditScheduleAjax();'>Update</a>&nbsp;&nbsp;";
	innerStr+="<a href='javascript:void(0)' onclick='jobPropertiesWindow.close()'>Discard</a></td></tr>";

	innerStr+="</table>";

	var editableDiv=document.getElementById(jobPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;

	openScheduleEditWin();
};

var openScheduleEditWin=function() {
	jobPropertiesWindow=internalWindow.open(jobPropertiesWindowId, 'div', jobPropertiesWindowDiv, '#Schedule Window', 'width=450px,height=350px,left=200px,top=150px,resize=1,scrolling=1');
	jobPropertiesWindow.onclose=function(){
		if(calendarObjForForm.isVisible()){
			calendarObjForForm.hide();
		}
		return true;
	};
};

var callEditScheduleAjax=function() {
	var myScheduleUpdateData="";
	var myScheduleEditRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var editStartDate=document.getElementById('editStartDate').value;
	var editFinishDate=document.getElementById('editFinishDate').value;
	var editStatus=document.getElementById('editStatus').value;

	myScheduleUpdateData="id="+rowToEdit.myRow.content[0];
	myScheduleUpdateData+="&start="+URLEncode(editStartDate);
	myScheduleUpdateData+="&finish="+URLEncode(editFinishDate);
	myScheduleUpdateData+="&status="+editStatus;
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21140+"&method="+"updateJobSchedule";
	//alert(myScheduleUpdateData);
	myScheduleEditRequest.open('POST', url, true);
	myScheduleEditRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myScheduleEditRequest.setRequestHeader("Content-length", myScheduleUpdateData.length);
	myScheduleEditRequest.onreadystatechange=function()
	{
		if(myScheduleEditRequest.readyState==4) {
			if(myScheduleEditRequest.status==200) {
				var xmlDoc=myScheduleEditRequest.responseXML;
				var statusFlag=0;
				if(xmlDoc==null) {alert("Data Error");}
				else
				{
					var systemMsg=xmlDoc.getElementsByTagName("status");
					statusFlag=systemStatus(null,systemMsg);
				}
				if(statusFlag==1) {
					rowToEdit.myRow.content[1].data=editStartDate;
					rowToEdit.myRow.content[2].data=editFinishDate;

					var statusString="";
					if(editStatus=='0')
						statusString="Planned";
					else if(editStatus=='1')
						statusString="Running";
					else if(editStatus=='2')
						statusString="Halted";
					else if(editStatus=='3')
						statusString="Finished";
					else
						statusString="Undefined";
					rowToEdit.myRow.content[3].data=statusString;
					rowToEdit.myRow.content[5]=editStatus;
				}
				else if(statusFlag==2){
					alert("EDIT: System Error");
				}
				jobPropertiesWindow.close();
			}
			else {
				alert("Connection Problem:"+myScheduleEditRequest.statusText);
				jobPropertiesWindow.close();
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myScheduleEditRequest.send(myScheduleUpdateData);
};

/**********************************************************/
/*
 * Open list of Work done under a particular job
 */

var worksContainerDiv="blankHidden1";
var worksInnerDivPrefix="worksInnerDivPrefix";
var worksWindowIdPrefix="worksWindowIdPrefix";
var INNER_TABLE_NAME_PREFIX="innerTableNamePrefix";
var INNER_NAV_DIV_PREFIX="innerNavDivPrefix";

var showWorkDone=function() {
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
	if(row!=null && row.myRow!=null && row.myRow.content[4]=="plannedJobs")
	{
		//alert(row.myRow.content[0]);
		rowToEdit=row;
		openWorksWindow(row.myRow.content[0]);
	}
	else return;
};

var openWorksWindow=function(entryId) {
	//var work=row.myRow.content[5];
	//var entryNumber=myBillRow.myRow.content[3].data;
	var innerStr="<div id='"+INNER_NAV_DIV_PREFIX+entryId+"'>Loading content for"+entryId+" , please wait...</div><div id='"+worksInnerDivPrefix+entryId+"' class='smallText'></div>";
	document.getElementById(worksContainerDiv).innerHTML=innerStr;
	worksWindow=internalWindow.open(worksWindowIdPrefix+entryId, 'div', worksContainerDiv, 'Works for # '+entryId, 'width=850px,height=500px,left=5px,top=5px,resize=1,scrolling=1');
	worksWindow.onclose=function(){
		if(calendarObjForForm.isVisible()){
			calendarObjForForm.hide();
		}
		return true;
	};
	callShowWorksAjax(entryId);
};


var callShowWorksAjax=function(entryId) {
	if(document.getElementById(INNER_NAV_DIV_PREFIX+entryId)==null) return;
	if(document.getElementById(worksInnerDivPrefix+entryId)==null) return;
	var myShowWorksRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21150+"&entryId="+entryId+""+"&controlEstimateId="+controlEstimateId+"&method="+"getWorksList";
	myShowWorksRequest.open("GET",url,true);
	myShowWorksRequest.onreadystatechange=function() {
		if(myShowWorksRequest.readyState==4) {
			if(myShowWorksRequest.status==200) {
				renderWorks(myShowWorksRequest);
			}
			else {
				alert("Connection Problem:"+myShowWorksRequest.statusText);
			}
		}
	};
	myShowWorksRequest.send(null);
};

var renderWorks=function(myShowWorksRequest) {
	var xmlDoc=myShowWorksRequest.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");

	var entryTags=xmlDoc.getElementsByTagName("entry");
	var entryId=0;
	if(entryTags!=null && entryTags.length>0)
	{
		entryId=entryTags[0].getAttribute("id");

		var worksDiv=document.getElementById(worksInnerDivPrefix+entryId);
		worksDiv.setAttribute("entryRef", entryId);

		var str="<table width='97%' class='innerContentTable' id='"+INNER_TABLE_NAME_PREFIX+entryId+"'><thead id='WORKTHEAD"+entryId+"'><tr><td width='16px'>&nbsp;</td><td width='16px'>Sl</td><td width='20%'>Description</td><td>Numbers</td><td>Length</td><td>Breadth</td><td>Height</td><td>Weight</td><td width='7%'>Started</td><td width='7%'>Finished</td><td align='right'>Total</td><td>D</td></tr></thead><tbody id='WORKTBODY"+entryId+"'></tbody></table>";
		worksDiv.innerHTML=str;
		contextMenu.attachTo('WORKTHEAD'+entryId,menu2());
		contextMenu.attachTo('WORKTBODY'+entryId,menu2());
		updateWorksNav(xmlDoc,INNER_NAV_DIV_PREFIX,INNER_TABLE_NAME_PREFIX,entryId);
		populateWorksTable(xmlDoc,INNER_TABLE_NAME_PREFIX,entryId);
		addTableRolloverEffect(INNER_TABLE_NAME_PREFIX+entryId,'tableRollOverEffect1','tableRowClickEffect1');
	}
	else
	{
		var errorFlag=systemStatus(null,systemMsg);
		if(errorFlag==0) return;
	}

};

var updateWorksNav=function(xmlDoc,divPrefix,tableNamePrefix,entryId) {
	var str="<table class='innerNavTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='addNewWorkBox(\""+tableNamePrefix+"\","+entryId+");'>Add New</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteWorksChecked(\""+tableNamePrefix+entryId+"\");'>Delete[D]</a></td>";
	str+="</tr></table>";
	document.getElementById(divPrefix+entryId).innerHTML=str;
};

var populateWorksTable=function(xmlDoc,tableNamePrefix,entryId){
	var tableName=tableNamePrefix+entryId;
	var content=xmlDoc.getElementsByTagName("works");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;
		param[1]=content[i].childNodes[2].firstChild.data;
		param[2]=content[i].childNodes[3].firstChild.data;
		param[3]=content[i].childNodes[4].firstChild.data;
		param[4]=content[i].childNodes[5].firstChild.data;
		param[5]=content[i].childNodes[6].firstChild.data;
		param[6]=content[i].childNodes[7].firstChild.data;
		param[7]=content[i].childNodes[8].firstChild.data;
		param[8]=content[i].childNodes[1].firstChild.data;
		param[9]=content[i].childNodes[9].firstChild.data;
		param[10]=content[i].childNodes[10].firstChild.data;
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


	//Cell3: Numbers
	cell[3]=row.insertCell(3);
	var numbersTb=getTextBox(10,param[2]);
	numbersTb.style.display='none';
	var numbers=document.createTextNode(param[2]);
	cell[3].appendChild(numbersTb);
	cell[3].appendChild(numbers);


	//Cell4: Length
	cell[4]=row.insertCell(4);
	var lengthTb=getTextBox(10,param[3]);
	lengthTb.style.display='none';
	var length=document.createTextNode(param[3]);
	cell[4].appendChild(lengthTb);
	cell[4].appendChild(length);

	//Cell5: Breadth
	cell[5]=row.insertCell(5);
	var breadthTb=getTextBox(10,param[4]);
	breadthTb.style.display='none';
	var breadth=document.createTextNode(param[4]);
	cell[5].appendChild(breadthTb);
	cell[5].appendChild(breadth);

	//Cell6: Height
	cell[6]=row.insertCell(6);
	var heightTb=getTextBox(10,param[5]);
	heightTb.style.display='none';
	var height=document.createTextNode(param[5]);
	cell[6].appendChild(heightTb);
	cell[6].appendChild(height);

	//Cell7: Weight
	cell[7]=row.insertCell(7);
	var weightTb=getTextBox(10,param[6]);
	weightTb.style.display='none';
	var weight=document.createTextNode(param[6]);
	cell[7].appendChild(weightTb);
	cell[7].appendChild(weight);

	//Cell8: Actual Start
	cell[8]=row.insertCell(8);
	var startTb=getTextBox(10,param[9]);
	startTb.style.display='none';
	var start=document.createTextNode(param[9]);
	cell[8].appendChild(startTb);
	cell[8].appendChild(start);

	//Cell9: Actual Finish
	cell[9]=row.insertCell(9);
	var finishTb=getTextBox(10,param[10]);
	finishTb.style.display='none';
	var finish=document.createTextNode(param[10]);
	cell[9].appendChild(finishTb);
	cell[9].appendChild(finish);

	//Cell10: Total
	cell[10]=row.insertCell(10);
	cell[10].setAttribute("align","right");
	var total=document.createTextNode(param[7]);
	cell[10].appendChild(total);

	//Cell9: Checkbox
	cell[11]=row.insertCell(11);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[11].appendChild(checkBox);

	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;

	rowContents[4]=description;
	rowContents[5]=descriptionTb;

	rowContents[6]=numbers;
	rowContents[7]=numbersTb;

	rowContents[8]=length;
	rowContents[9]=lengthTb;

	rowContents[10]=breadth;
	rowContents[11]=breadthTb;

	rowContents[12]=height;
	rowContents[13]=heightTb;

	rowContents[14]=weight;
	rowContents[15]=weightTb;

	rowContents[16]=start;
	rowContents[17]=startTb;

	rowContents[18]=finish;
	rowContents[19]=finishTb;

	rowContents[20]=total;

	rowContents[21]=param[0];			//ID
	rowContents[22]=param[8];			//ENTRY_ID

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


/**********************************************************/
/*
 * Delete selected works and rows
 */
function callDeleteWorksAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myWorkDeleteRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	for(var i=0; i<obj.length; i++) {
		if(i==0) {
			id+=obj[i].myRow.content[21];
		}
		else
			id+=","+obj[i].myRow.content[21];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21160+"&id="+URLEncode(id)+"&method="+"deleteSelectedWorks";
	myWorkDeleteRequest.open("GET",url,true);

	myWorkDeleteRequest.onreadystatechange=function()
	{
		if(myWorkDeleteRequest.readyState==4) {
			if(myWorkDeleteRequest.status==200) {
				var xmlDoc=myWorkDeleteRequest.responseXML;
				var statusFlag=0;
				if(xmlDoc==null) {alert("Data Error");}
				else
				{
					var systemMsg=xmlDoc.getElementsByTagName("status");
					statusFlag=systemStatus(null,systemMsg);
				}
				if(statusFlag==1) {
					deleteWorkRows(obj);
					reorderWorkRows(tbl, rIndex);
				}
				else if(statusFlag==2) {
					alert("DELETE: System Error");
				}
			}
			else {
				alert("Connection Problem:"+myWorkDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myWorkDeleteRequest.send(null);
}

/*
 * gets checked rows from table with ID $tblId$
 */
var getWorksChecked=function (tblId) {
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
	return checkedObjArray;
};
/*
 * deletes checked rows, from the table with ID $tblId$
 */
var deleteWorksChecked=function (tblId) {
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
		callDeleteWorksAjax(tbl,checkedObjArray,rIndex);
	}
};

var deleteWorkRows=function (rowObjArray) {
	for (var i=0; i<rowObjArray.length; i++) {
		var rIndex = rowObjArray[i].sectionRowIndex;
		rowObjArray[i].parentNode.deleteRow(rIndex);
	}
};

var reorderWorkRows=function (tbl, startingIndex) {
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
var deleteContextWorksChecked=function () {

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
	callDeleteWorksAjax(tbl,checkedObjArray,rIndex);
};



/**********************************************************/
/*
 * Add a new Work
 */

/*
 * This method is called from context menu, adds an ADD box at the end
 * of the list as many times it is called, uses addNewWorkBox internally
 */
var addContextWorksBox=function() {
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
	var entryId=div.getAttribute("entryRef");
	addNewWorkBox(INNER_TABLE_NAME_PREFIX,entryId);
};

/*
 * This method will be called from Nav bar, inserts an ADD box
 * at the end of the Works list
 */
var addNewWorkBox=function(tblIdprefix,entryId) {
	var tbl=document.getElementById(tblIdprefix+entryId);
	var nextRow = tbl.tBodies[0].rows.length;
	//var num = nextRow;
	var num=0;
	var iteration = num + ROW_BASE;

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	var cell=Array();
	//Cell0: Image(OK)
	cell[0] = row.insertCell(0);
	//cell[0].innerHTML="<img src='images/common/url.gif' border='0'>";
	cell[0].innerHTML="<a href='javascript:void(0);' onclick='addNewWork(event,"+entryId+",\"add\");'><img src='images/common/tick.gif' border='0'></a>";
	//alert(cell[0].childNodes[0].childNodes[0].tagName);

	//Cell1: Image(DISCARD)
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	//slNo.style.display='none';
	cell[1].innerHTML="<a href='javascript:void(0);' onclick='addNewWork(event,"+entryId+",\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
	//cell[1].appendChild(slNo);

	//Cell2: Description
	cell[2]=row.insertCell(2);
	var descriptionTb=getTextBox(20,"-");
	var description=document.createTextNode("");
	cell[2].appendChild(descriptionTb);
	cell[2].appendChild(description);


	//Cell3: Numbers
	cell[3]=row.insertCell(3);
	var numbersTb=getTextBox(10,"-");
	var numbers=document.createTextNode("");
	cell[3].appendChild(numbersTb);
	cell[3].appendChild(numbers);


	//Cell4: Length
	cell[4]=row.insertCell(4);
	var lengthTb=getTextBox(8,"-");
	var length=document.createTextNode("");
	cell[4].appendChild(lengthTb);
	cell[4].appendChild(length);

	//Cell5: Breadth
	cell[5]=row.insertCell(5);
	var breadthTb=getTextBox(8,"-");
	var breadth=document.createTextNode("");
	cell[5].appendChild(breadthTb);
	cell[5].appendChild(breadth);

	//Cell6: Height
	cell[6]=row.insertCell(6);
	var heightTb=getTextBox(8,"-");
	var height=document.createTextNode("");
	cell[6].appendChild(heightTb);
	cell[6].appendChild(height);

	//Cell7: Weight
	cell[7]=row.insertCell(7);
	var weightTb=getTextBox(8,"-");
	var weight=document.createTextNode("");
	cell[7].appendChild(weightTb);
	cell[7].appendChild(weight);

	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var dateString=((day<10?"0"+day:""+day) + "/" + (month<10?"0"+month:""+month) + "/" + year);

	//Cell8: Actual Start
	cell[8]=row.insertCell(8);
	var startTb=getTextBox(8,dateString);
	startTb.readOnly=true;
	startTb.onclick=new Function("pickDate(this,this,-120);");
	var start=document.createTextNode("");
	cell[8].appendChild(startTb);
	cell[8].appendChild(start);

	//Cell9: Actual finish
	cell[9]=row.insertCell(9);
	var finishTb=getTextBox(8,dateString);
	finishTb.readOnly=true;
	finishTb.onclick=new Function("pickDate(this,this,-120);");
	var finish=document.createTextNode("");
	cell[9].appendChild(finishTb);
	cell[9].appendChild(finish);

	//Cell10: Total
	cell[10]=row.insertCell(10);
	cell[10].setAttribute("align","right");
	var total=document.createTextNode("-");
	cell[10].appendChild(total);

	//Cell11: Checkbox
	cell[11]=row.insertCell(11);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	checkBox.disabled=true;
	cell[11].appendChild(checkBox);


	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;

	rowContents[4]=description;
	rowContents[5]=descriptionTb;

	rowContents[6]=numbers;
	rowContents[7]=numbersTb;

	rowContents[8]=length;
	rowContents[9]=lengthTb;

	rowContents[10]=breadth;
	rowContents[11]=breadthTb;

	rowContents[12]=height;
	rowContents[13]=heightTb;

	rowContents[14]=weight;
	rowContents[15]=weightTb;

	rowContents[16]=start;
	rowContents[17]=startTb;

	rowContents[18]=finish;
	rowContents[19]=finishTb;

	rowContents[20]=total;

	rowContents[21]=0;			        //ID
	rowContents[22]=entryId;			//ENTRY_ID

	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
	//reorderWorkRows(tbl, 0);
};




/*
 * Adds a new work to the list, sends data to the server and
 * updates the list accordingly
 */
var addNewWork=function(e,entryId,flag) {
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
		deleteWorkRows(discardRowsArray);
		//reorderWorkRows(tbl,rowIndex);
	}
	else if(flag=="add")
	{
		//alert("add");
		var myAddWorkRequest=getHTMLHTTPRequest();
		var myRandom=parseInt(Math.random()*99999999);
		var description=URLEncode(row.myRow.content[5].value);
		var number=URLEncode(row.myRow.content[7].value);
		var length=URLEncode(row.myRow.content[9].value);
		var breadth=URLEncode(row.myRow.content[11].value);
		var height=URLEncode(row.myRow.content[13].value);
		var weight=URLEncode(row.myRow.content[15].value);
		var start=URLEncode(row.myRow.content[17].value);
		var finish=URLEncode(row.myRow.content[19].value);
		var myWorkAddData="entryId="+entryId;
		myWorkAddData+="&description="+description;
		myWorkAddData+="&number="+number;
		myWorkAddData+="&length="+length;
		myWorkAddData+="&breadth="+breadth;
		myWorkAddData+="&height="+height;
		myWorkAddData+="&weight="+weight;
		myWorkAddData+="&start="+start;
		myWorkAddData+="&finish="+finish;
		myWorkAddData+="&controlEstimateId="+controlEstimateId;
		//myWorkAddData=myWorkAddData.replace(/\+/g,'%2B');
		//myWorkAddData=myWorkAddData.replace(/\+/g,'%2B');

		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+21170+"&method="+"addNewWork";
		myAddWorkRequest.open('POST', url, true);
		myAddWorkRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		myAddWorkRequest.setRequestHeader("Content-length", myAddWorkRequest.length);
		myAddWorkRequest.onreadystatechange=function()
		{
			if(myAddWorkRequest.readyState==4) {
				if(myAddWorkRequest.status==200) {
					var xmlDoc=myAddWorkRequest.responseXML;
					var statusFlag=0;
					if(xmlDoc==null) {alert("Data Error");}
					else
					{
						var systemMsg=xmlDoc.getElementsByTagName("status");
						statusFlag=systemStatus(null,systemMsg);
					}
					if(statusFlag==1) {
						var newId=xmlDoc.getElementsByTagName("key")[0].getAttribute("value");
						var total=xmlDoc.getElementsByTagName("key")[0].getAttribute("total");
						row.myRow.content[4].data=row.myRow.content[5].value;
						row.myRow.content[6].data=row.myRow.content[7].value;
						row.myRow.content[8].data=row.myRow.content[9].value;
						row.myRow.content[10].data=row.myRow.content[11].value;
						row.myRow.content[12].data=row.myRow.content[13].value;
						row.myRow.content[14].data=row.myRow.content[15].value;
						row.myRow.content[16].data=row.myRow.content[17].value;
						row.myRow.content[18].data=row.myRow.content[19].value;
						row.myRow.content[20].data=""+total;
						row.myRow.content[21]=""+newId;
						row.myRow.content[22]=""+entryId;
						for(var i=5;i<=19;i+=2)
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
					alert("Connection Problem:"+myAddWorkRequest.statusText);
					//assemblyPropertiesWindow.close();
				}
				reorderWorkRows(tbl,0);
				closeSplashScreen();
			}
		};
		openSplashScreen();
		myAddWorkRequest.send(myWorkAddData);
	}
};

