/**********************************************************
 * Creates basic facilities for managing DNITs
 * Copyright (C) 2010, 2011  Amit Kumar(amitkriit@gmail.com)
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
 *---------------------------------------------------
 *Modified on: 28/10/2013
 *Removed misplaced </textarea> tags
 *---------------------------------------------------
 ***********************************************************/
/*
 * Global vars
 */
var tenderCatTableparent=1;	//Up one level
var tenderCatTableTop=1;		//Top Level
var tenderCatTableCurrentParent=1;			//parent of current level
var tenderCatTablecontainer="blankContent";	//this DIV will contain our cbCat

//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="tendirDirSample";			//Should be named in HTML
var DIV_NAV_NAME="tenderDirNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="TENDER_TTHEAD123";				
var ctx_TBODY="TENDER_TTBODY123";

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
 * Initializes Context Menu for Definite Estimate Table
 * and then populates the table
 */


var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			//getContextMenuModel();
			callTenderCatAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeTendersTable=function(id)
{
	myCurrentMenuParent=id;
	writeWaitMsg(tenderCatTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

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
		setMenuItemState(213480,'disabled');	//EDIT
		setMenuItemState(213490,'disabled');	//DELETE
		setMenuItemState(213510,'disabled');	//CUT
		setMenuItemState(213550,'disabled');	//MODIFY TENDER
	}
	else
	{
		if(tmp.myRow.content[7]=="tender")
		{
			//If this is a costBook enable edit price option
			if(tmp.myRow.content[14]=="0")
				setMenuItemState(213550,'regular');	//MODIFY TENDER
			else
				setMenuItemState(213550,'disabled');	//MODIFY TENDER
		}
		else
		{
			setMenuItemState(213550,'disabled');	//MODIFY TENDER
		}
		setMenuItemState(213480,'regular');	//EDIT
		setMenuItemState(213490,'regular');	//DELETE
		setMenuItemState(213510,'regular');	//CUT
	}
	//Show paste option only if something has been cut
	if(myMoveAction.movableItemType==null)
		setMenuItemState(213530,'disabled');
	else
		setMenuItemState(213530,'regular');
	
	if(tenderCatTableCurrentParent==1)
	{
		setMenuItemState(213410,'disabled');	//UP
		setMenuItemState(213420,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(213410,'regular');	//UP
		setMenuItemState(213420,'regular');	//TOP
	}
	
	//Impose Menu Permissions
	setMenuPermissions(currentMenuBar);
};


/**********************************************************/
/*
 * Ajax call to populate Tender Directory at level $id$
 */


function callTenderCatAjax(id) {
	if(document.getElementById(tenderCatTablecontainer)==null) return;
	var myTenderCatRequest=getHTMLHTTPRequest();
	tenderCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22010+"&parent="+id+"&method="+"get";

	myTenderCatRequest.open("GET",url,true);
	myTenderCatRequest.onreadystatechange=function()
	{
		if(myTenderCatRequest.readyState==4) {
			if(myTenderCatRequest.status==200) {
				renderTenderCat(myTenderCatRequest);
			}
			else {
				alert("Connection Problem:"+myTenderCatRequest.statusText);
			}
		}
	};
	writeWaitMsg(tenderCatTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myTenderCatRequest.send(null);
}


function renderTenderCat(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(tenderCatTablecontainer,systemMsg);
	if(errorFlag==0) return;
	
	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='100%'>Description</td><td>D</td><td>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(tenderCatTablecontainer).innerHTML=str;
	//Update the cbCat navigation bar
	updateTenderCatNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
}
/*
 * Update navigation bar for CbCat Table according to current level
 */
var updateTenderCatNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		tenderCatTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callTenderCatAjax("+tenderCatTableparent+")'><img src='images/project/tender/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callTenderCatAjax("+tenderCatTableTop+")'><img src='images/project/tender/top.png' border='0' alt='Top level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myTenderCatAddWindow(\""+TABLE_NAME+"\",\"tenderDir\");'>Add Directory</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initProjectWin(\""+TABLE_NAME+"\",\"tender\");'>Add Tender</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myTenderCatEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
	}
	else
	{
		str+="<td><img src='images/project/tender/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/project/tender/top1.png' alt='Top level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myTenderCatAddWindow(\""+TABLE_NAME+"\",\"tenderDir\");'>Add Directory</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initProjectWin(\""+TABLE_NAME+"\",\"tender\");'>Add Tender</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myTenderCatEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		tenderCatTableparent=1;
	}
	str+="<td>&nbsp;</td><td align='right'><input type='button' name='search' value='Search' onclick='populateSearchWin();'/></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("tenderDir");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="tenderDir";		//Row type is cbCat
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToTable1(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("tender");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="tender";		//Row type is cbCat
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		param[6]=content[i].childNodes[5].firstChild.data;
		param[7]=content[i].childNodes[6].firstChild.data;
		param[8]=content[i].childNodes[7].firstChild.data;
		param[9]=content[i].childNodes[8].firstChild.data;
		param[10]=content[i].childNodes[9].firstChild.data;
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
	if(param[0]=="tenderDir")
		row.className='classCbCat';
	else
		row.className='classcb';
	//Highlight Search
	if(param[1]==sid)
		row.className='searchClass';
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[0]=="tenderDir")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callTenderCatAjax("+param[1]+")'><img src='images/project/tender/directory1.png' border='0'></a>";
	else if(param[9]=="0")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='initBidWindow(event);'><img src='images/project/tender/tender.png' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);'><img src='images/project/tender/tender_closed.png' border='0'></a>";
	cell[0].className='iconCbImage';
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
	cell[4].className='classCbedit';
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
	rowContents[2]=cell[0];
	rowContents[3]=slNo;
	rowContents[4]=name;
	rowContents[5]=description;
	rowContents[6]=param[1];			//ID
	rowContents[7]=param[0];			//Type
	if(param[0]=="tenderDir")
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	else
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[10];	//Parent
		
		rowContents[10]=param[5];	//Amount
		rowContents[11]=param[6];	//Earnest Money
		rowContents[12]=param[7];	//TimeLimit
		rowContents[13]=param[8];	//Open Date
		rowContents[14]=param[9];	//Status
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Tenders/Directories Asynchronously using Ajax
 */

function callDeleteTenderCatAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myTenderCatDeleteRequest=getHTMLHTTPRequest();
	var myDelTable=tbl;
	var myDelRowsArray=obj;
	var myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	var id1="";
	for(var i=0; i<obj.length; i++) {
		if(obj[i].myRow.content[7]=="tenderDir" && id=="")
			id+=obj[i].myRow.content[6];
		else if(obj[i].myRow.content[7]=="tender" && id1=="")
			id1+=obj[i].myRow.content[6];
		else
		{
			if(obj[i].myRow.content[7]=="tenderDir")
				id+=","+obj[i].myRow.content[6];
			else
				id1+=","+obj[i].myRow.content[6];
		}
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22020+"&tenderDirId="+id+"&tenderId="+id1+"&method="+"delete";
	myTenderCatDeleteRequest.open("GET",url,true);
	myTenderCatDeleteRequest.onreadystatechange=function()
	{
		if(myTenderCatDeleteRequest.readyState==4) {
			if(myTenderCatDeleteRequest.status==200) {
				var xmlDoc=myTenderCatDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myTenderCatDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myTenderCatDeleteRequest.send(null);
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
		callDeleteTenderCatAjax(tbl,checkedObjArray,rIndex);
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
	callDeleteTenderCatAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Edit Tenders Asynchronously using Ajax
 */
var tenderCatPropertiesWindowDiv="blankHidden";
var tenderCatPropertiesWindow=null;
var tenderCatPropertiesWindowTitle="Properties";
var tenderCatPropertiesWindowId="tenderCatPropertiesWindowId";
var indexOfRowToEdit=-1;
var rowToEdit=null;

var myContextTenderCatEditWindow=function() {
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
		populateTenderCatEditWin();
};

var myTenderCatEditWindow=function(tblId) {
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
		populateTenderCatEditWin();
};

var populateTenderCatEditWin=function() {
	var innerStr="<table>";
	if(rowToEdit!=null) {
		if(rowToEdit.myRow.content[7]=="tenderDir")
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditTenderCatAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='tenderCatPropertiesWindow.close()'>Discard</a></td></tr>";
		}
		else
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			
			innerStr+="<tr><td><label>Tender Amount:</label></td><td><input size='40' type='text' id='editTenderAmount' value='"+rowToEdit.myRow.content[10]+"'></td></tr>";
			innerStr+="<tr><td><label>Earnest Money:</label></td><td><input size='40' type='text' id='editEarnestMoney' value='"+rowToEdit.myRow.content[11]+"'></td></tr>";
			innerStr+="<tr><td><label>Time Limit:</label></td><td><input size='40' type='text' id='editTimeLimit' value='"+rowToEdit.myRow.content[12]+"'></td></tr>";
			innerStr+="<tr><td><label>Opening Date:</label></td><td><input size='40' type='text' id='editTenderOpenDate' value='"+rowToEdit.myRow.content[13]+"' onclick='pickDate(this,this,0);' readonly='readonly'></td></tr>";
			
			innerStr+="<tr><td><label>Status:</label></td>";
			innerStr+="<td><select id='editStatus'>";
			innerStr+="<option value='0' "+(rowToEdit.myRow.content[14]=='0'?"selected='selected'":"")+">Open</option>";
			innerStr+="<option value='1' "+(rowToEdit.myRow.content[14]=='1'?"selected='selected'":"")+">Closed</option>";
			innerStr+="<option value='2' "+(rowToEdit.myRow.content[14]=='2'?"selected='selected'":"")+">Aborted</option>";
			
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8]+"</textarea></td></tr>";
			
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditTenderCatAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='tenderCatPropertiesWindow.close()'>Discard</a></td></tr>";

		}
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(tenderCatPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyTenderCatPropertiesWin();
};

var openMyTenderCatPropertiesWin=function() {

	tenderCatPropertiesWindow=internalWindow.open('tenderCatPropertiesWindowId', 'div', tenderCatPropertiesWindowDiv, '#Properties Window', 'width=450px,height=420px,left=200px,top=150px,resize=1,scrolling=1');
	tenderCatPropertiesWindow.onclose=function(){
		if(calendarObjForForm.isVisible()){
			calendarObjForForm.hide();
		}
		return true;
	};
};

var myTenderCatUpdateData="";
var myTenderCatEditRequest=getHTMLHTTPRequest();
var callEditTenderCatAjax=function() {
	var myRandom=parseInt(Math.random()*99999999);
	var myTenderCatUpdateData="";
	var method;
	if(rowToEdit.myRow.content[7]=="tenderDir")
	{
		method="updateTenderDir";
		myTenderCatUpdateData="id="+rowToEdit.myRow.content[6];
		myTenderCatUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myTenderCatUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myTenderCatUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		method="updateTenderDoc";
		myTenderCatUpdateData="id="+rowToEdit.myRow.content[6];
		myTenderCatUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myTenderCatUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myTenderCatUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
		
		myTenderCatUpdateData+="&amount="+URLEncode(document.getElementById('editTenderAmount').value);
		myTenderCatUpdateData+="&earnestMoney="+URLEncode(document.getElementById('editEarnestMoney').value);
		myTenderCatUpdateData+="&timeLimit="+URLEncode(document.getElementById('editTimeLimit').value);
		myTenderCatUpdateData+="&openDate="+URLEncode(document.getElementById('editTenderOpenDate').value);
		myTenderCatUpdateData+="&status="+URLEncode(document.getElementById('editStatus').value);
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22030+"&method="+method;
	//alert(""+myTenderCatUpdateData);
	myTenderCatEditRequest.open('POST', url, true);
	myTenderCatEditRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myTenderCatEditRequest.setRequestHeader("Content-length", myTenderCatUpdateData.length);
	myTenderCatEditRequest.onreadystatechange=updateTenderCatAction;
	openSplashScreen();
	myTenderCatEditRequest.send(myTenderCatUpdateData);

};

function updateTenderCatAction() {
	if(myTenderCatEditRequest.readyState==4) {
		if(myTenderCatEditRequest.status==200) {
			var xmlDoc=myTenderCatEditRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				if(rowToEdit.myRow.content[7]=="tenderDir")
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8]=document.getElementById('editRemarks').value;
				}
				else
				{
					if(document.getElementById('editStatus').value=="0")
						rowToEdit.myRow.content[2].innerHTML="<a href='javascript:void(0);' onclick='initBidWindow(event);'><img src='images/project/tender/tender.png' border='0'></a>";
					else
						rowToEdit.myRow.content[2].innerHTML="<a href='javascript:void(0);'><img src='images/project/tender/tender_closed.png' border='0'></a>";
					
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8]=document.getElementById('editRemarks').value;
					
					rowToEdit.myRow.content[10]=document.getElementById('editTenderAmount').value;
					rowToEdit.myRow.content[11]=document.getElementById('editEarnestMoney').value;
					rowToEdit.myRow.content[12]=document.getElementById('editTimeLimit').value;
					rowToEdit.myRow.content[13]=document.getElementById('editTenderOpenDate').value;
					rowToEdit.myRow.content[14]=document.getElementById('editStatus').value;
				}
			}
			else if(statusFlag==2) {
				alert("EDIT: System Error");
			}
			tenderCatPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myTenderCatEditRequest.statusText);
			tenderCatPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}


/**********************************************************/
/*
 * Add new row
 */
var myTenderCatTable=null;
var myTenderCatAddWindow=function(tblId,type) {
	var tbl=document.getElementById(tblId);
	myTenderCatTable=tbl;
	populateTenderCatAddWin(type);
};


var populateTenderCatAddWin=function(type) {
	var innerStr="<table>";
	if(type=="tenderDir")
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddCbCatAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='tenderCatPropertiesWindow.close()'>Discard</a></td></tr>";
	}
	else
	{
		return;
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(tenderCatPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyTenderCatPropertiesWin();
};

var myTenderCatAddData="";
var myTenderCatAddRequest=getHTMLHTTPRequest();
var callAddCbCatAjax=function(type) {
	var myRandom=parseInt(Math.random()*99999999);
	var method="addTenderDir";
	myTenderCatAddData="id="+tenderCatTableCurrentParent;
	myTenderCatAddData+="&name="+URLEncode(document.getElementById('editName').value);
	myTenderCatAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
	myTenderCatAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22040+"&method="+method;
	myTenderCatAddRequest.open('POST', url, true);
	myTenderCatAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myTenderCatAddRequest.setRequestHeader("Content-length", myTenderCatAddData.length);
	myTenderCatAddRequest.onreadystatechange=addTenderCatAction;
	openSplashScreen();
	myTenderCatAddRequest.send(myTenderCatAddData);

};

function addTenderCatAction() {
	if(myTenderCatAddRequest.readyState==4) {
		if(myTenderCatAddRequest.status==200) {
			var xmlDoc=myTenderCatAddRequest.responseXML;
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
				if(type=='tenderDir')
				{
					param[0]="tenderDir";		//Row type is cbCat
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editRemarks').value;
					param[5]=""+tenderCatTableCurrentParent;
					rowNum=getMaxTenderDirRow();
				}
				else
				{
					alert("ADD: Protocol Error");
				}

				addRowToTable1(myTenderCatTable,rowNum,param);
				reorderRows(myTenderCatTable, rowNum);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
			tenderCatPropertiesWindow.close();
		}
		else {
			alert("Connection Problem:"+myTenderCatAddRequest.statusText);
			tenderCatPropertiesWindow.close();
		}
		closeSplashScreen();
	}
}

var getMaxTenderRow=function() {
	var tbl=myTenderCatTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="tender" && rowNum<=i)
			rowNum=i;

	}
	if(rowNum==-1)
	{
		for (i=0; i<tbl.tBodies[0].rows.length; i++) {
			if(tbl.tBodies[0].rows[i].myRow.content[7]=="tenderDir" && rowNum<=i)
				rowNum=i;

		}
	}
	return rowNum+1;
};

var getMaxTenderDirRow=function() {
	var tbl=myTenderCatTable;
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="tenderDir" && rowNum<=i)
			rowNum=i;
	}
	return rowNum+1;
};


/*************************** Create New Tender ****************************************/
/*
 * Open Definitive estimates window for selection
 */
var projectManagerContainer="blankHidden1";	//Main div containing the DHTML window
var PROJOptionsContainer='projOptions';			//Contains link to assembly/item menu
var PROJInnnerContainer="innerPROJContainer";		//Main inner window
var projOptionsWindow=null;
var projOptionsWindowId="projOptionsWindowId";

var PROJ_INNER_TABLE_NAME="projInnerSample";			//Should be named in HTML
var PROJ_INNER_DIV_NAV_NAME="projInnerNavDiv";			//Navigation Bar
var tenderTable;
var initProjectWin=function(tableName) {
	tenderTable=tableName;
	var tbl=document.getElementById(tenderTable);
	myTenderCatTable=tbl;
	var div=document.getElementById(projectManagerContainer);
	div.innerHTML="<div id='"+PROJInnnerContainer+"' class='smallText'>Please click on one of the options above</div>";
	openProjectOptionsWindow();
};

var openProjectOptionsWindow=function() {
	projOptionsWindow=internalWindow.open(projOptionsWindowId, 'div', projectManagerContainer, 'Select Project for DNIT', 'width=600px,height=450px,left=5px,top=5px,resize=1,scrolling=1');
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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22050+"&parent="+id+"&method="+"get";
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
	str+="<table id='"+PROJ_INNER_TABLE_NAME+"' width='100%' class='contentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='60%'>Description</td><td width='100%'>CostBook</td><td width='16px'>Select</td></tr></thead>";
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
	if(param[0]=="project")
		row.className='classProject';
	else
		row.className='classEstimate';
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	cell[0].className='projIconImage';
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
	cell[5].className='classProjEdit';
	cell[5].className='classAedit';
	if(!isFolder)
		cell[5].innerHTML="&nbsp;&nbsp;&nbsp;";
	else
		cell[5].innerHTML="<a href='javascript:void(0);' onclick='importFinlize(\""+tbl.getAttribute("id")+"\","+row.sectionRowIndex+")'><img src='images/common/tick.gif' border='0'></a>";

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


var importFinlize=function(tableName,rowNum)
{
	var myProjectTable=document.getElementById(tableName);
	var row=myProjectTable.tBodies[0].rows[rowNum];
	var id=row.myRow.content[6];
	var description="Detailed notification inviting tender for: "+row.myRow.content[5].data;
	var parent=row.myRow.content[9];
	var innerStr="<p><fieldset><legend>Create New Tender</legend><table>";
	
	innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='Name'></td></tr>";
	innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+description+"</textarea></td></tr>";
	
	innerStr+="<tr><td><label>Tender Amount:</label></td><td><input size='40' type='text' id='editTenderAmount' value='-'></td></tr>";
	innerStr+="<tr><td><label>Earnest Money:</label></td><td><input size='40' type='text' id='editEarnestMoney' value='-'></td></tr>";
	innerStr+="<tr><td><label>Time Limit:</label></td><td><input size='40' type='text' id='editTimeLimit' value='-'></td></tr>";
	innerStr+="<tr><td><label>Opening Date:</label></td><td><input size='40' type='text' id='editTenderOpenDate' value='' onclick='pickDate(this,this,0);' readonly='readonly'></td></tr>";
	
	innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>Remarks</textarea></td></tr>";
	
	innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callProjectAjax(\""+parent+"\");'>Back</a>&nbsp;&nbsp;";
	innerStr+="<a href='javascript:void(0)' onclick='callAddTenderAjax(\""+id+"\");'>Add</a>&nbsp;&nbsp;";
	innerStr+="<a href='javascript:void(0)' onclick='projOptionsWindow.close()'>Discard</a></td></tr>";
	innerStr+="</table></fieldset></p>";
	
	document.getElementById(projectTablecontainer).innerHTML=innerStr;
};
 

var myTenderAddRequest=getHTMLHTTPRequest();
var myProjectAddData;
//var myEstimateRow;
var projectId;
var callAddTenderAjax=function(projectId) {
	var myRandom=parseInt(Math.random()*99999999);
	myProjectAddData="projectId="+projectId;
	myProjectAddData+="&id="+tenderCatTableCurrentParent;
	
	myProjectAddData+="&name="+URLEncode(document.getElementById('editName').value);
	myProjectAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
	myProjectAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	
	myProjectAddData+="&amount="+URLEncode(document.getElementById('editTenderAmount').value);
	myProjectAddData+="&earnestMoney="+URLEncode(document.getElementById('editEarnestMoney').value);
	myProjectAddData+="&timeLimit="+URLEncode(document.getElementById('editTimeLimit').value);
	myProjectAddData+="&openDate="+URLEncode(document.getElementById('editTenderOpenDate').value);
	
	//alert(myProjectAddData);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22060+"&method=addTender";
	myTenderAddRequest.open('POST', url, true);
	myTenderAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myTenderAddRequest.setRequestHeader("Content-length", myProjectAddData.length);
	myTenderAddRequest.onreadystatechange=importProjectToTender;
	openSplashScreen();
	myTenderAddRequest.send(myProjectAddData);
};

var importProjectToTender=function() {
	if(myTenderAddRequest.readyState==4) {
		if(myTenderAddRequest.status==200) {
			var xmlDoc=myTenderAddRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				var newId=xmlDoc.getElementsByTagName("key")[0].getAttribute("value");
				
				param=Array();
				param[0]="tender";		//Row type is tender
				param[1]=""+newId;
				param[2]=document.getElementById('editName').value;
				param[3]=document.getElementById('editDescription').value;
				param[4]=document.getElementById('editRemarks').value;
				param[5]=document.getElementById('editTenderAmount').value;
				param[6]=document.getElementById('editEarnestMoney').value;
				param[7]=document.getElementById('editTimeLimit').value;
				param[8]=document.getElementById('editTenderOpenDate').value;
				param[9]="0";
				param[10]=tenderCatTableCurrentParent;
				
				addRowToTable1(document.getElementById(TABLE_NAME),getMaxTenderRow(),param);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
		}
		else {
			alert("Connection Problem:"+myTenderAddRequest.statusText);
		}
		closeSplashScreen();
		projOptionsWindow.close();
	}
};

/*****************************  End Import Estimate **************************************************/



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
	if(row.myRow.content[7]=="tenderDir")
	{
		//Params: type,id, parentId
		myMoveAction.cut("tenderDir",row.myRow.content[6],row.myRow.content[9]);
		
		tmpArr[0]="tenderDir";		   				//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8];			//REMARKS
		tmpArr[5]=""+row.myRow.content[9];			//PARENT
	}
	else if(row.myRow.content[7]=="tender")
	{
		//Params: type,id, parentId
		myMoveAction.cut("tender",row.myRow.content[6],row.myRow.content[9]);
		
		tmpArr[0]="tender";		   						//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8];			//REMARKS
		
		tmpArr[5]=row.myRow.content[10];
		tmpArr[6]=row.myRow.content[11];
		tmpArr[7]=row.myRow.content[12];
		tmpArr[8]=row.myRow.content[13];
		tmpArr[9]=row.myRow.content[14];
		tmpArr[10]=""+row.myRow.content[9];			//PARENT
		
		
	}
	myMoveAction.initParams(tmpArr);
};

var callPasteToLocationAjax=function() {
	myMoveAction.verify=function() {
		if(this.movableItemType=="tenderDir")
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
		else if(this.movableItemType=="tender")
		{
			if(this.movableFromCurrentParentId==this.movableToParentId)
			{
				alert("Please chose a different location");
				return false;
			}
		}
		return true;
	};
	
	if(myMoveAction.paste(tenderCatTableCurrentParent)==false)
		return;
	var id=""+myMoveAction.movableItemId;
	var type=""+myMoveAction.movableItemType;
	var pid=""+myMoveAction.movableFromCurrentParentId;
	var newPid=""+myMoveAction.movableToParentId;
	var params=myMoveAction.paramArray;
	if(type=="tender")
	{
		//alert(params.length);
		params[10]=newPid;
	}
	else if(type=="tenderDir")
	{
		//alert(params.length);
		params[5]=newPid;
	}
	
	var myAjaxRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20690+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;
	
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
					myTenderCatTable=document.getElementById(TABLE_NAME);
					if(type=="tender")
					addRowToTable1(document.getElementById(TABLE_NAME),getMaxTenderRow(),params);
					else if(type=="tenderDir")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxTenderDirRow(),params);
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


/***********************Search************************/
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
	projectPropertiesWindow=internalWindow.open('searchWindow', 'div', 'blankHidden1', 'Search Tenders', 'width=600px,height=400px,left=200px,top=150px,resize=1,scrolling=1');
};

function vaildateKey()
{
	key=document.getElementById('searchKey').value;
	if(key.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchTenderAjax();
//		alert(key);
	}
}

function callSearchTenderAjax() {
	var mySearchRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22010+"&key="+searchString+"&method="+"searchCostBook";
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
	var content=xmlDoc.getElementsByTagName("tenderDir");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="tenderDir";		//Row type is cbCat
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToSearchTable(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("tender");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="tender";		//Row type is cbCat
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		param[6]=content[i].childNodes[5].firstChild.data;
		param[7]=content[i].childNodes[6].firstChild.data;
		param[8]=content[i].childNodes[7].firstChild.data;
		param[9]=content[i].childNodes[8].firstChild.data;
		param[10]=content[i].childNodes[9].firstChild.data;
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
	if(param[0]=="tenderDir")
		row.className='classCbCat';
	else
		row.className='classcb';
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[0]=="tenderDir")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callTenderCatAjax("+param[5]+")'><img src='images/project/tender/directory1.png' border='0'></a>";
	else if(param[9]=="0")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callTenderCatAjax("+param[10]+")'><img src='images/project/tender/tender.png' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callTenderCatAjax("+param[10]+")'><img src='images/project/tender/tender_closed.png' border='0'></a>";
	cell[0].className='iconCbImage';
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
	if(param[0]=="tenderDir")
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	else
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[10];	//Parent

		rowContents[10]=param[5];	//Amount
		rowContents[11]=param[6];	//Earnest Money
		rowContents[12]=param[7];	//TimeLimit
		rowContents[13]=param[8];	//Open Date
		rowContents[14]=param[9];	//Status
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

function doHighlight(bodyText, searchTerm) 
{
  // the highlightStartTag and highlightEndTag parameters are optional
  //if ((!highlightStartTag) || (!highlightEndTag)) {
    highlightStartTag = "<font style='color:blue; background-color:#FFCE9D;'>";
    highlightEndTag = "</font>";
  //}
  
  // find all occurences of the search term in the given text,
  // and add some "highlight" tags to them (we're not using a
  // regular expression search, because we want to filter out
  // matches that occur within HTML tags and script blocks, so
  // we have to do a little extra validation)
  var newText = "";
  var i = -1;
  var lcSearchTerm = searchTerm.toLowerCase();
  var lcBodyText = bodyText.toLowerCase();
    
  while (bodyText.length > 0) {
    i = lcBodyText.indexOf(lcSearchTerm, i+1);
    if (i < 0) {
      newText += bodyText;
      bodyText = "";
    } else {
      // skip anything inside an HTML tag
      if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
        // skip anything inside a <script> block
        //if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i)) {
          newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
          bodyText = bodyText.substr(i + searchTerm.length);
          lcBodyText = bodyText.toLowerCase();
          i = -1;
        }
      //}
    }
  }
  return newText;
}
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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22050+"&key="+searchString+"&method="+"searchProject";
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
 * Notes attached to a tender Document
*/

//Notes
/**********************************************************/
/*
 * add new note to selected tender
 */
var myNoteRow;
var initItemWinNotes=function(context,arg) {
	myNoteRow=null;
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
		myNoteRow=tmp;
	}
	else
	{
		var tbl=document.getElementById(arg);
		for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
			if(tbl.tBodies[0].rows[i].myRow && tbl.tBodies[0].rows[i].myRow.content[1].getAttribute('type') == 'radio' && tbl.tBodies[0].rows[i].myRow.content[1].checked) {
				myNoteRow=tbl.tBodies[0].rows[i];
			}
		}
	}
	if(myNoteRow!=null)
		openAddJobsWin();
};

var notesContainerDiv="blankHidden1";
var notesInnerDivPrefix="notesInnerDivPrefix";
var notesWindowIdPrefix="notesWindowIdPrefix";
var NOTES_TABLE_NAME_PREFIX="innerTableNamePrefix";
var NOTES_NAV_DIV_PREFIX="innerNavDivPrefix";
var openAddJobsWin=function() {
	var noteTenderId=myNoteRow.myRow.content[6];
	var tenderName=myNoteRow.myRow.content[4].data;
	var innerStr="<div id='"+NOTES_NAV_DIV_PREFIX+noteTenderId+"'>Loading content, please wait...</div><div id='"+notesInnerDivPrefix+noteTenderId+"' class='smallText'></div>";
	document.getElementById(notesContainerDiv).innerHTML=innerStr;
	internalWindow.open(notesWindowIdPrefix+noteTenderId, 'div', notesContainerDiv, 'Notes for #'+tenderName, 'width=850px,height=500px,left=5px,top=5px,resize=1,scrolling=1');
	callShowNotesAjax(noteTenderId);
};

var callShowNotesAjax=function(tenderId) {
	if(document.getElementById(NOTES_NAV_DIV_PREFIX+tenderId)==null) return;
	if(document.getElementById(notesInnerDivPrefix+tenderId)==null) return;
	var myShowNotesRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22070+"&tenderId="+tenderId+"&method="+"getNotes";
	myShowNotesRequest.open("GET",url,true);
	myShowNotesRequest.onreadystatechange=function() {
		if(myShowNotesRequest.readyState==4) {
			if(myShowNotesRequest.status==200) {
				renderNotes(myShowNotesRequest);
			}
			else {
				alert("Connection Problem:"+myShowNotesRequest.statusText);
			}
		}
	};
	myShowNotesRequest.send(null);
};

var renderNotes=function(myShowNotesRequest) {
	var xmlDoc=myShowNotesRequest.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	//alert(myShowNotesRequest.responseText);
	var tenderTags=xmlDoc.getElementsByTagName("tender");
	var tenderId=0;
	if(tenderTags!=null && tenderTags.length>0)
	{
		tenderId=tenderTags[0].getAttribute("id");
		
		var notesDiv=document.getElementById(notesInnerDivPrefix+tenderId);
		notesDiv.setAttribute("tenderRef", tenderId);
		
		var str="<table width='97%' class='innerContentTable' id='"+NOTES_TABLE_NAME_PREFIX+tenderId+"'><thead id='NOTETHEAD"+tenderId+"'><tr><td width='16px'>&nbsp;</td><td width='16px'>Sl</td><td width='95%'>Notes Description</td><td>D</td></tr></thead><tbody id='NOTETBODY"+tenderId+"'></tbody></table>";
		notesDiv.innerHTML=str;
		//contextMenu.attachTo('JOBTHEAD'+tenderId,menu2());
		//contextMenu.attachTo('JOBTBODY'+tenderId,menu2());
		updateNotesNav(xmlDoc,NOTES_NAV_DIV_PREFIX,NOTES_TABLE_NAME_PREFIX,tenderId);
		populateNotesTable(xmlDoc,NOTES_TABLE_NAME_PREFIX,tenderId);
		addTableRolloverEffect(NOTES_TABLE_NAME_PREFIX+tenderId,'tableRollOverEffect1','tableRowClickEffect1');
	}
	else
	{
		var errorFlag=systemStatus(null,systemMsg);
		if(errorFlag==0) return;
	}
		
};

var updateNotesNav=function(xmlDoc,divPrefix,tableNamePrefix,billId) {
	var str="<table class='innerNavTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='addNewNoteBox(\""+tableNamePrefix+"\","+billId+");'>Add New</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='editCheckedNotesBox(\""+tableNamePrefix+"\","+billId+");'>Edit[D]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteNotesChecked(\""+tableNamePrefix+billId+"\");'>Delete[D]</a></td>";
	
	str+="</tr></table>";
	document.getElementById(divPrefix+billId).innerHTML=str;
};

var populateNotesTable=function(xmlDoc,tableNamePrefix,noteId){
	var tableName=tableNamePrefix+noteId;
	var content=xmlDoc.getElementsByTagName("entry");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data; // note id
		param[1]=content[i].childNodes[1].firstChild.data; //description
		param[2]=content[i].childNodes[2].firstChild.data; // tender id
		addRowToTable4(tbl,rowToInsertAt,param);
	}
};

/*
 * add a new row at index $num$ using params $param$ into table $tbl$
 */
var addRowToTable4=function (tbl,num,param) {
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
	cell[0].innerHTML="<img src='images/project/tender/note.gif' border='0'>";

	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: Description
	cell[2]=row.insertCell(2);
	var descriptionTb=getTextBox(100,param[1]);
	descriptionTb.style.display='none';
	var description=document.createTextNode(param[1]);
	cell[2].appendChild(descriptionTb);
	cell[2].appendChild(description);

		
	//Cell3: Checkbox
	cell[3]=row.insertCell(3);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[3].appendChild(checkBox);

	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	
	rowContents[4]=description;
	rowContents[5]=descriptionTb;
	
	rowContents[6]=param[0];			//ID
	rowContents[7]=param[2];			//ESTIMATE_ID
	
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
 * Delete selected notes and rows
 */
function callDeleteNotesAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myNoteDeleteRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	for(var i=0; i<obj.length; i++) {
		if(i==0)
			id+=obj[i].myRow.content[6];
		else
			id+=","+obj[i].myRow.content[6];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22071+"&id="+id+"&method=deleteNote";
	//alert(url);
	myNoteDeleteRequest.open("GET",url,true);
	
	myNoteDeleteRequest.onreadystatechange=function()
	{
		if(myNoteDeleteRequest.readyState==4) {
			if(myNoteDeleteRequest.status==200) {
				var xmlDoc=myNoteDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myNoteDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myNoteDeleteRequest.send(null);
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
var deleteNotesChecked=function (tblId) {
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
		callDeleteNotesAjax(tbl,checkedObjArray,rIndex);
	}
};

var deleteNotesRows=function (rowObjArray) {
	for (var i=0; i<rowObjArray.length; i++) {
		var rIndex = rowObjArray[i].sectionRowIndex;
		rowObjArray[i].parentNode.deleteRow(rIndex);
	}
};

var reorderNotesRows=function (tbl, startingIndex) {
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
var deleteContextNotesChecked=function () {
	
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
	callDeleteNotesAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Add a new Note
 */

/*
 * This method is called from context menu, adds an ADD box at the end
 * of the list as many times it is called, uses addNewJobBox internally
 */
var addContextNotesBox=function() {
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
	var tenderId=div.getAttribute("tenderRef");
	//alert(billId);
	//row.myRow.content[0].checked=true;
	addNewNoteBox(NOTES_TABLE_NAME_PREFIX,tenderId);
};

/*
 * This method will be called from Nav bar, inserts an ADD box
 * at the end of the Jobs list
 */
var addNewNoteBox=function(tblIdprefix,tenderId) {
	var tbl=document.getElementById(tblIdprefix+tenderId);
	var nextRow = tbl.tBodies[0].rows.length;
	var num = nextRow;
	var iteration = num + ROW_BASE;

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	var cell=Array();
	//Cell0: Image(OK)
	cell[0] = row.insertCell(0);
	//cell[0].innerHTML="<img src='images/common/url.gif' border='0'>";
	cell[0].innerHTML="<a href='javascript:void(0);' onclick='addNewNote(event,"+tenderId+",\"add\");'><img src='images/common/tick.gif' border='0'></a>";
	//alert(cell[0].childNodes[0].childNodes[0].tagName);
	
	//Cell1: Image(DISCARD)
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	//slNo.style.display='none';
	cell[1].innerHTML="<a href='javascript:void(0);' onclick='addNewNote(event,"+tenderId+",\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
	//cell[1].appendChild(slNo);

	//Cell2: Description
	cell[2]=row.insertCell(2);
	var descriptionTb=getTextBox(100,"-");
	var description=document.createTextNode("");
	cell[2].appendChild(descriptionTb);
	cell[2].appendChild(description);


	//Cell3: Checkbox
	cell[3]=row.insertCell(3);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	checkBox.disabled=true;
	cell[3].appendChild(checkBox);

	
	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	
	rowContents[4]=description;
	rowContents[5]=descriptionTb;
	
	rowContents[6]=0;				//ID
	rowContents[7]=tenderId;			//TENDER_ID
	
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/*
 * Adds a new job to the list, sends data to the server and
 * updates the list accordingly
 */
var addNewNote=function(e,tenderId,flag) {
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
		deleteNotesRows(discardRowsArray);
		reorderNotesRows(tbl,rowIndex);
	}
	else if(flag=="add")
	{
		//alert("add");
		var myAddNoteRequest=getHTMLHTTPRequest();
		var myRandom=parseInt(Math.random()*99999999);
		var description=URLEncode(row.myRow.content[5].value);
		var myNoteAddData="tenderId="+tenderId;
		myNoteAddData+="&description="+description;
		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22073+"&method=addNote";
		myAddNoteRequest.open('POST', url, true);
		myAddNoteRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		myAddNoteRequest.setRequestHeader("Content-length", myAddNoteRequest.length);
		myAddNoteRequest.onreadystatechange=function()
		{
			if(myAddNoteRequest.readyState==4) {
				if(myAddNoteRequest.status==200) {
					var xmlDoc=myAddNoteRequest.responseXML;
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
						row.myRow.content[6]=""+newId;
						row.myRow.content[7]=""+tenderId;
						//for(var i=5;i<=5;i+=2)
						//{
							row.myRow.content[5].style.display='none';
						//}
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
					alert("Connection Problem:"+myAddNoteRequest.statusText);
					//assemblyPropertiesWindow.close();
				}
				closeSplashScreen();
			}
		};
		openSplashScreen();
		myAddNoteRequest.send(myNoteAddData);
	}
};

/**********************************************************/
/*
 * Edit a note
 */

/*
 * This method will be called from context menu
 * It calls editCheckednotesBox, with setting checkbox to checked
 * for the source row, so it opens edit window which have been checked too
 */
var editContextNotesBox=function() {
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
	var tenderId=div.getAttribute("tenderRef");
	row.myRow.content[0].checked=true;
	editCheckedNotesBox(NOTES_TABLE_NAME_PREFIX,tenderId);
};

/*
 * This method will be called from nav bar, it opens edit bar for
 * all selected jobs, no communication with the server is peformed here
 */
var editCheckedNotesBox=function(tblIdPrefix,tenderId) {
	var tbl=document.getElementById(tblIdPrefix+tenderId);
	for (var i=0; i<tbl.tBodies[0].rows.length; i++)
	{
		
		if(tbl.tBodies[0].rows[i].myRow.content[0].checked) {
			var row=tbl.tBodies[0].rows[i];
			//Preserve Sl No.
			row.myRow.content[3]=document.createTextNode(row.myRow.content[3].data);
			row.cells[0].innerHTML="";
			row.cells[1].innerHTML="";
			row.cells[0].innerHTML="<a href='javascript:void(0);' onclick='editSelectedNote(event,"+tenderId+",\"edit\");'><img src='images/common/tick.gif' border='0'></a>";
			row.cells[1].innerHTML="<a href='javascript:void(0);' onclick='editSelectedNote(event,"+tenderId+",\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
			//var textNodes=Array();
			//for(var j=4;j<=4;j+=2)
			//{
				var displayedText=row.myRow.content[4];
				var sp=document.createElement('span');
				sp.appendChild(document.createTextNode(displayedText.data));
				sp.style.display='none';
				displayedText.parentNode.appendChild(sp);
				displayedText.data='';
			//}
			//for(var k=5;k<=5;k+=2)
			//{
				row.myRow.content[5].style.display='inline';
				
			//}
			row.myRow.content[0].checked=false;
			row.myRow.content[0].disabled=true;
		}
	}
};

/*
 * Perform edit command, send request to server and update jobs list
 * accordingly
 */
var editSelectedNote=function(e,tenderId,flag) {
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
		//for(var w=4;w<=4;w+=2)
		//{
			//Reset Values inside textBoxes and textNodes
			displayedText=row.myRow.content[4];
			editBox=row.myRow.content[5];
			span=displayedText.parentNode.childNodes[2];
			newText=span.firstChild.data;
			
			displayedText.data=newText;
			editBox.value=newText;
			editBox.style.display='none';
			//Remove inserted span, to reset the configuration
			span.parentNode.removeChild(span);
		//}
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
		var myEditNoteRequest=getHTMLHTTPRequest();
		var myRandom=parseInt(Math.random()*99999999);
		var description=URLEncode(row.myRow.content[5].value);
		var myNoteEditData="id="+row.myRow.content[6];
		myNoteEditData+="&description="+description;
		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+22072+"&method=updateNote";
		myEditNoteRequest.open('POST', url, true);
		myEditNoteRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		myEditNoteRequest.setRequestHeader("Content-length", myEditNoteRequest.length);
		myEditNoteRequest.onreadystatechange=function()
		{
			if(myEditNoteRequest.readyState==4) {
				if(myEditNoteRequest.status==200) {
					var xmlDoc=myEditNoteRequest.responseXML;
					var statusFlag=0;
					if(xmlDoc==null) {alert("Data Error");}
					else
					{
						var systemMsg=xmlDoc.getElementsByTagName("status");
						statusFlag=systemStatus(null,systemMsg);
					}
					if(statusFlag==1) {
						//for(w=4;w<=4;w+=2)
						//{
							displayedText=row.myRow.content[4];
							editBox=row.myRow.content[5];
							editBox.style.display='none';
							//update
							if(editBox.value=="")
							{
								displayedText.data="-";
								editBox.value="-";
							}
							else
							displayedText.data=editBox.value;
							span=displayedText.parentNode.childNodes[2];
							span.parentNode.removeChild(span);
						//}
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
					alert("Connection Problem:"+myEditNoteRequest.statusText);
					//assemblyPropertiesWindow.close();
				}
				closeSplashScreen();
			}
		};
		openSplashScreen();
		myEditNoteRequest.send(myNoteEditData);
	}
};

/*******************************************************/
/*
 * Open a Bid-Management window to manage Bidders and their Bids
 */
var initBidWindowContext=function(context,arg) {
	var myBidRow=null;
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
		myBidRow=tmp;
	}
	
	if(myBidRow!=null)
	{
		var tenderId=myBidRow.myRow.content[6];
		var bidWindowId="bidWindow"+tenderId;
		var tenderName=myBidRow.myRow.content[4].data;
		internalWindow.open(bidWindowId, "iframe","MyActionDispatcher?path=23010&method=get&tenderId="+tenderId , "Insert Bids for Tender: ["+tenderName+"]",'width=900px,height=600px,left=10px,top=10px,resize=1,scrolling=1',"recal");
	}
	
};

var initBidWindow=function(e)
{
	var eventSrc=e;
	var myBidRow=null;
	var tbl=null;
	if(eventSrc.target)
	{
		myBidRow=eventSrc.target.parentNode.parentNode.parentNode;
	}
	else if(eventSrc.srcElement)
	{
		myBidRow=eventSrc.srcElement.parentNode.parentNode.parentNode;
	}	
	
	if(myBidRow!=null)
	{
		var tenderId=myBidRow.myRow.content[6];
		var bidWindowId="bidWindow"+tenderId;
		var tenderName=myBidRow.myRow.content[4].data;
		internalWindow.open(bidWindowId, "iframe","MyActionDispatcher?path=23010&method=get&tenderId="+tenderId , "Insert Bids for Tender: ["+tenderName+"]",'width=900px,height=600px,left=10px,top=10px,resize=1,scrolling=1',"recal");
	}
};

/**********************************************************/
/*
 * Init the first level
 */
initializeTendersTable(10440);