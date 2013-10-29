/**********************************************************
 * Light-weight document-management
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
//alert("DOCUMENT");
var dmsTableparent=1;	//Up one level
var dmsTableTop=1;		//Top Level
var dmsTableCurrentParent=1;			//parent of current level
var dmsTablecontainer="blankContent";	//this DIV will contain our contCat
//var fileUploadWindow=null;
var dmsPropertiesWindowTitle=null;		//Handle to the properties window(add/edit)
//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="dmsSample";			//Should be named in HTML
var DIV_NAV_NAME="dmsNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row numbering starts from here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="DMS_TTHEAD123";				
var ctx_TBODY="DMS_TTBODY123";
var upload_FRAME="DMS_FRAME123";
var uploadWindow="blankHidden1";

/*
 * For Search
 */
var key='qwerty';
var sid=0;
/* ============================================================= */
/*
 * Initializes Context Menu for Documents Table
 * and then populates the table
 */


var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			//getContextMenuModel();
			callDmsAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeDocumentsTable=function(id)
{
	myCurrentMenuParent=id;
	writeWaitMsg(dmsTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

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
		setMenuItemState(213180,'disabled');	//EDIT
		setMenuItemState(213190,'disabled');	//DELETE
		setMenuItemState(213210,'disabled');	//CUT

	}
	else
	{

		setMenuItemState(213180,'regular');	//EDIT
		setMenuItemState(213190,'regular');	//DELETE
		setMenuItemState(213210,'regular');	//CUT
	}
	//Show paste option only if something has been cut
	if(myMoveAction.movableItemType==null)
		setMenuItemState(213230,'disabled');
	else
		setMenuItemState(213230,'regular');


	if(dmsTableCurrentParent==1)
	{
		setMenuItemState(213110,'disabled');	//UP
		setMenuItemState(213120,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(213110,'regular');	//UP
		setMenuItemState(213120,'regular');	//TOP
	}
	//Impose Menu Permissions
	setMenuPermissions(currentMenuBar);
};

/**********************************************************/
/*
 * Ajax call to populate contCat at level $id$
 */
function callDmsAjax(id) {
	if(document.getElementById(dmsTablecontainer)==null) return;
	if(dmsPropertiesWindowTitle!=null) dmsPropertiesWindowTitle.close();
	var myDmsRequest=getHTMLHTTPRequest();
	dmsTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path=24010&parent="+id+"&method="+"get";

	myDmsRequest.open("GET",url,true);
	myDmsRequest.onreadystatechange=function()
	{
		if(myDmsRequest.readyState==4) {
			if(myDmsRequest.status==200) {
				renderDms(myDmsRequest);
			}
			else {
				alert("Connection Problem:"+myDmsRequest.statusText);
			}
		}
	};
	writeWaitMsg(dmsTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myDmsRequest.send(null);
}


//var filesWindowId="FilesWIndowId";

function renderUploadedFile()
{

	document.getElementById('file_upload_form').target = 'upload_target';

	var ifrm = document.getElementById('upload_target');
	var remarks=document.getElementById("myRemarks").value;
	//alert(ifrm.innerHTML);
	if (navigator.userAgent.indexOf("MSIE") > -1 && !window.opera){
		ifrm.onreadystatechange = function(){
			//alert("HELLO");
			if(ifrm.readyState == 'complete'){   
				var iframeBody=ifrm.contentWindow.document.body;
				if(iframeBody!=null)
				{
					var childDivs=ifrm.contentWindow.document.body.childNodes;
					//alert(ifrm.contentWindow.document.body.innerHTML);
					if(childDivs.length<2)
						alert("ERROR: File Upload failed");
					else
					{
						var newId=childDivs[0].innerText;
						var name=childDivs[1].innerText;
						//alert(newId);
						var type="file";
						var param=Array();
						var rowNum=0;

						param[0]="file";		//Row type is contCat
						param[1]=""+newId;

						param[2]=name;

						param[3]=remarks;
						param[4]=""+dmsTableCurrentParent;
						rowNum=getMaxFileRow();
						var tbl=document.getElementById(TABLE_NAME);
						addRowToTable1(tbl,rowNum,param);

						reorderRows(tbl, rowNum);
						//dmsPropertiesWindowTitle.close();
					}
				}
				//var responseStr=new Array();
				// responseStr=innerStr.split("@");
				//addFileAction(responseStr);
				//alert(innerStr);
			}   

		}; 
	}
	else
	{
		ifrm.onload = function(){
			if(true){   
				var iframeBody=ifrm.contentWindow.document.body;
				if(iframeBody!=null)
				{
					var childDivs=iframeBody.childNodes;
					//alert(iframeBody.innerHTML);
					//alert(ifrm.contentWindow.document.body.innerHTML);
					if(childDivs.length<2)
						alert("ERROR: File Upload failed");
					else
					{
						var newId=""+childDivs[0].innerHTML;
						var name=""+childDivs[1].innerHTML;
						//alert("##"+newId+"##"+name);
						//alert(newId);
						var type="file";
						var param=Array();
						var rowNum=0;

						param[0]="file";		//Row type is contCat
						param[1]=""+newId;

						param[2]=name;

						param[3]=remarks;
						param[4]=""+dmsTableCurrentParent;
						rowNum=getMaxFileRow();
						var tbl=document.getElementById(TABLE_NAME);
						addRowToTable1(tbl,rowNum,param);

						reorderRows(tbl, rowNum);
						//dmsPropertiesWindowTitle.close();
					}
				}
				//var responseStr=new Array();
				// responseStr=innerStr.split("@");
				//addFileAction(responseStr);
				//alert(innerStr);
			}

		};
	}

}


function openFileUploadWindow(id) {

	var path=24050;
	var  method="uploadReference";
	var str="<fieldset><legend>Upload File</legend>\n";
	str+="<form method=\"post\" id=\"file_upload_form\" action=\"MyActionDispatcher?path="+path+"&method="+method+"&documentId="+id+"\" enctype=\"multipart/form-data\" onsubmit=\"renderUploadedFile();\" >\n";
	str+="<label>File Name:&nbsp;&nbsp;</label><input type=\"file\" size=\"30\" name=\"fname\" class=\"pgInp\"><br>\n";
	str+="<label>Comments:&nbsp;</label><input type=\"text\" id=\"myRemarks\" size=\"30\" name=\"fremarks\"><br>\n";
	//str+="<input type=\"hidden\" name=\"documentId\" value="+id+">";
	str+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n";
	str+="<input type=\"submit\" value=\"upload\" class=\"btn\">\n";
	//str+="<iframe id=\"upload_target\" name=\"upload_target\" src=\"#\" style=\"width:0;height:0;border:0px solid #fff;\"></iframe>";
	str+="</form></fieldset>\n";

	var div=document.getElementById(uploadWindow);
	div.innerHTML=str;
	dmsPropertiesWindowTitle=internalWindow.open('dmsPropertiesWindowTitleId', 'div', uploadWindow, '#Upload File', 'width=450px,height=300px,left=200px,top=150px,resize=1,scrolling=1');;
}

function renderDms(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(dmsTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='45%'>Description</td><td width='30%'>Remarks</td><td>D</td><td>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	str+="<iframe id=\"upload_target\" name=\"upload_target\" style=\"display:none;\"></iframe>";
	//str+="<iframe id=\"upload_target\" name=\"upload_target\" src=\"#\"></iframe>";
	document.getElementById(dmsTablecontainer).innerHTML=str;
	//Update the contCat navigation bar
	updateDmsNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
}
/*
 * Update navigation bar for ContCat Table according to current level
 */
var updateDmsNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		dmsTableparent=parentId[0].getAttribute("id");
		//alert(dmsTableparent);
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callDmsAjax("+dmsTableparent+")'><img src='images/utilities/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callDmsAjax("+dmsTableTop+")'><img src='images/utilities/top.png' border='0' alt='Top level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myDmsAddWindow(\""+TABLE_NAME+"\",\"document\");'>Add Folder</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='openFileUploadWindow("+dmsTableCurrentParent+");'>Add File</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myDMsEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
	}
	else
	{
		str+="<td><img src='images/utilities/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/utilities/top1.png' alt='Top level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myDmsAddWindow(\""+TABLE_NAME+"\",\"document\");'>Add Folder</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='openFileUploadWindow("+dmsTableCurrentParent+");'>Add File</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myDMsEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		dmsTableparent=1;
	}
	str+="<td>&nbsp;</td><td align='right'><input type='button' name='search' value='Search' onclick='populateSearchWin();'/></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("document");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="document";		//Row type is document
		param[1]=content[i].childNodes[0].firstChild.data;

		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToTable1(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("file");
	for(i=0;i<content.length;i++)
	{

		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="file";		//Row type is file
		param[1]=content[i].childNodes[0].firstChild.data;	//ID

		param[2]=content[i].childNodes[1].firstChild.data;	//NAME
		param[3]=content[i].childNodes[2].firstChild.data;	//REMARKS
		param[4]=content[i].childNodes[3].firstChild.data;	//PARENT
		//param[5]=content[i].childNodes[4].firstChild.data;

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
	if(param[0]=="document")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callDmsAjax("+param[1]+")'><img src='images/utilities/directory.png' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='downloadFileAction(event);'><img src='images/utilities/reference.png' border='0'></a>";
	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: Name
	var name;
	if(param[0]=='document')
	{
		cell[2]=row.insertCell(2);
		name=document.createTextNode(param[2]);
		cell[2].appendChild(name);
	}
	else
	{
		cell[2]=row.insertCell(2);
		name=document.createTextNode(param[2]);

		cell[2].innerHTML="<a href='javascript:void(0);' onclick='downloadFileAction(event);'>"+param[2]+"</a>";
	}
	//Cell3: Description
	var description;
	if(param[0]=="document")
	{
		cell[3]=row.insertCell(3);
		description=document.createTextNode(param[3]);
		cell[3].appendChild(description);
	}
	else
	{
		cell[3]=row.insertCell(3);
		description=document.createTextNode("---");
		cell[3].appendChild(description);
	}
	//Cell4: Remarks
	var remarks;
	if(param[0]=="document")
	{
		cell[4]=row.insertCell(4);
		remarks=document.createTextNode(param[4]);
		cell[4].appendChild(remarks);
	}
	else{
		cell[4]=row.insertCell(4);
		remarks=document.createTextNode(param[3]);
		cell[4].appendChild(remarks);
	}
	//Cell6: Checkbox
	cell[5]=row.insertCell(5);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[5].appendChild(checkBox);

	//cell7:Radio Button
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
	rowContents[7]=param[0];//Type
	if((param[0]=="document"))
	{
		rowContents[8]=remarks;	//Remarks
		rowContents[9]=param[5];	//Parent
	}

	else{
		rowContents[8]=remarks;	//Remarks
		rowContents[9]=param[4];
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Conts Asynchronously using Ajax
 */

function callDeleteDmsAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myDmsDeleteRequest=getHTMLHTTPRequest();
	var myDelTable=tbl;
	var myDelRowsArray=obj;
	var myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	var id1="";
	for(var i=0; i<obj.length; i++) {
		if(obj[i].myRow.content[7]=="document" && id=="")
			id+=obj[i].myRow.content[6];
		else if(obj[i].myRow.content[7]=="file" && id1=="")
			id1+=obj[i].myRow.content[6];
		else
		{
			if(obj[i].myRow.content[7]=="document")
				id+=","+obj[i].myRow.content[6];
			else
				id1+=","+obj[i].myRow.content[6];
		}
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+24020+"&dmsId="+URLEncode(id)+"&fileId="+URLEncode(id1)+"&method="+"delete";
	myDmsDeleteRequest.open("GET",url,true);
	myDmsDeleteRequest.onreadystatechange=function()
	{
		if(myDmsDeleteRequest.readyState==4) {
			if(myDmsDeleteRequest.status==200) {
				var xmlDoc=myDmsDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myDmsDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myDmsDeleteRequest.send(null);
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
		callDeleteDmsAjax(tbl,checkedObjArray,rIndex);
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
	callDeleteDmsAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Edit References Asynchronously using Ajax
 */
var dmsPropertiesWindowDiv="blankHidden";
//var dmsPropertiesWindowTitle=null;
var dmsPropertiesWindowTitleTitle="Properties";
var dmsPropertiesWindowTitleId="dmsPropertiesWindowTitleId";
var indexOfRowToEdit=-1;
var rowToEdit=null;

var myContextDmsEditWindow=function() {
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
		populateDmsEditWin();
};

var myDMsEditWindow=function(tblId) {
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
		populateDmsEditWin();
};

var populateDmsEditWin=function() {
	var innerStr="<table>";
	if(rowToEdit!=null) {
		if(rowToEdit.myRow.content[7]=="document")
		{
			innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
			innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";
			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8].data+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditDmsAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='dmsPropertiesWindowTitle.close()'>Discard</a></td></tr>";
		}
		else
		{
			innerStr+="<tr><td><label>Name(not editable):</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"' readonly='true'></td></tr>";
			//innerStr+="<tr><td><label>Description:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";

			innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[8].data+"</textarea></td></tr>";
			innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditDmsAjax();'>Update</a>&nbsp;&nbsp;";
			innerStr+="<a href='javascript:void(0)' onclick='dmsPropertiesWindowTitle.close()'>Discard</a></td></tr>";

		}
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(dmsPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyDmsPropertiesWin();
};

var openMyDmsPropertiesWin=function() {

	dmsPropertiesWindowTitle=internalWindow.open('dmsPropertiesWindowTitleId', 'div', dmsPropertiesWindowDiv, '#Properties Window', 'width=450px,height=350px,left=200px,top=150px,resize=1,scrolling=1');
};

var myDmsUpdateData="";
var myDmsEditRequest=getHTMLHTTPRequest();
var callEditDmsAjax=function() {
	var myRandom=parseInt(Math.random()*99999999);
	var myDmsUpdateData="";
	var method;
	if(rowToEdit.myRow.content[7]=="document")
	{
		method="updateDms";
		myDmsUpdateData="id="+rowToEdit.myRow.content[6];
		myDmsUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		myDmsUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myDmsUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);

	}
	else {
		method="updateFile";
		myDmsUpdateData="id="+rowToEdit.myRow.content[6];
		myDmsUpdateData+="&name="+URLEncode(document.getElementById('editName').value);
		//myDmsUpdateData+="&description="+URLEncode(document.getElementById('editDescription').value);

		myDmsUpdateData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);

	}
	//alert(myDmsUpdateData);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+24030+"&method="+method;
	myDmsEditRequest.open('POST', url, true);
	myDmsEditRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myDmsEditRequest.setRequestHeader("Content-length", myDmsUpdateData.length);
	myDmsEditRequest.onreadystatechange=upadtedmsAction;
	openSplashScreen();
	myDmsEditRequest.send(myDmsUpdateData);

};

function upadtedmsAction() {
	if(myDmsEditRequest.readyState==4) {
		if(myDmsEditRequest.status==200) {
			var xmlDoc=myDmsEditRequest.responseXML;
			var statusFlag=0;
			if(xmlDoc==null) {alert("Data Error");}
			else
			{
				var systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
			}
			if(statusFlag==1) {
				if(rowToEdit.myRow.content[7]=="document")
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8].data=document.getElementById('editRemarks').value;

				}
				else
				{
					rowToEdit.myRow.content[4].data=document.getElementById('editName').value;
					//rowToEdit.myRow.content[5].data=document.getElementById('editDescription').value;
					rowToEdit.myRow.content[8].data=document.getElementById('editRemarks').value;
				}
			}
			else if(statusFlag==2) {
				alert("EDIT: System Error");
			}
			dmsPropertiesWindowTitle.close();
		}
		else {
			alert("Connection Problem:"+myDmsEditRequest.statusText);
			dmsPropertiesWindowTitle.close();
		}
		closeSplashScreen();
	}
}


/**********************************************************/
/*
 * Add new row
 */
var myDmsTable=null;
var myDmsAddWindow=function(tblId,type) {
	var tbl=document.getElementById(tblId);
	myDmsTable=tbl;
	populateDmsAddWin(type);
};


var populateDmsAddWin=function(type) {
	var innerStr="<table>";
	if(type=="document")
	{
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
		innerStr+="<tr><td><label>Specification:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";
		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddDmsAjax(\""+type+"\");'>Add</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='dmsPropertiesWindowTitle.close()'>Discard</a></td></tr>";
	}
	else
	{
		return;
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(dmsPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;
	openMyDmsPropertiesWin();
};

var myDmsAddData="";
var myDmsAddRequest=getHTMLHTTPRequest();
var callAddDmsAjax=function(type) {
	var myRandom=parseInt(Math.random()*99999999);
	if(type=="document")
	{
		method="addDms";
		myDmsAddData="id="+dmsTableCurrentParent;
		myDmsAddData+="&name="+URLEncode(document.getElementById('editName').value);
		myDmsAddData+="&description="+URLEncode(document.getElementById('editDescription').value);
		myDmsAddData+="&remarks="+URLEncode(document.getElementById('editRemarks').value);
	}
	else {
		return;
	}

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+24040+"&method="+method;

	myDmsAddRequest.open('POST', url, true);
	myDmsAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myDmsAddRequest.setRequestHeader("Content-length", myDmsAddData.length);
	myDmsAddRequest.onreadystatechange=addDmsAction;
	openSplashScreen();
	myDmsAddRequest.send(myDmsAddData);

};

function addDmsAction() {
	if(myDmsAddRequest.readyState==4) {
		if(myDmsAddRequest.status==200) {
			var xmlDoc=myDmsAddRequest.responseXML;
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
				if(type=='document')
				{
					param[0]="document";		//Row type
					param[1]=""+newId;
					param[2]=document.getElementById('editName').value;
					param[3]=document.getElementById('editDescription').value;
					param[4]=document.getElementById('editRemarks').value;
					param[5]=""+dmsTableCurrentParent;
					rowNum=getMaxDmsRow();

				}

				addRowToTable1(myDmsTable,rowNum,param);
				reorderRows(myDmsTable, rowNum);
			}
			else if(statusFlag==2) {
				alert("ADD: System Error");
			}
			dmsPropertiesWindowTitle.close();
		}
		else {
			alert("Connection Problem:"+myDmsAddRequest.statusText);
			dmsPropertiesWindowTitle.close();
		}
		closeSplashScreen();
	}
}


/*function addFileAction(responseStr) {

				var newId;
				var type;
				var param=Array();
				var rowNum=0;
				newId=responseStr[0];
				type=responseStr[2];
				type=type.trim();

				if(type=="file")
				{

					param[0]="file";		//Row type is contCat
					param[1]=""+newId;

					param[2]=responseStr[1];

					param[3]=document.getElementById('myRemarks').value;
					//param[4]="";

					param[4]=""+dmsTableCurrentParent;
					rowNum=getMaxFileRow();

				}
				var tbl=document.getElementById(TABLE_NAME);
				addRowToTable1(tbl,rowNum,param);

				reorderRows(tbl, rowNum);
				dmsPropertiesWindowTitle.close();



	}*/

var getMaxFileRow=function() {
	var tbl=document.getElementById(TABLE_NAME);
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="document" && rowNum<=i)
			rowNum=i;
	}

	for (i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="file" && rowNum<=i)
			rowNum=i;
	}

	return rowNum+1;
};

var getMaxDmsRow=function() {
	var tbl=document.getElementById(TABLE_NAME);
	var rowNum=-1;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow.content[7]=="document" && rowNum<=i)
			rowNum=i;
	}
	return rowNum+1;
};

/**********************************************************/
/*
 * Download selected file
 */
var downloadFileAction=function(e) {
	var eventSrc=e;
	var row;
	var tbl;
	if(eventSrc.target)
	{
		row=eventSrc.target.parentNode;
	}
	else if(eventSrc.srcElement)
	{
		row=eventSrc.srcElement.parentNode;
	}
	//alert(row.tagName);
	while(row.tagName!='TR')
	{
		row=row.parentNode;
	}
	//alert(row.tagName);
	var rowIndex=row.sectionRowIndex;
	tbl=row.parentNode.parentNode;
	var fileId=row.myRow.content[6];
	//alert(fileId);
	//window.location="MyActionDispatcher?path=24060&fileId="+fileId+"&method=downloadFile";
	window.open("MyActionDispatcher?path=24060&fileId="+fileId+"&method=downloadFile");
};


/**********************************************************/
/*
 * Move Directory/Files from one location to other
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
	if(row.myRow.content[7]=="document")
	{
		//Params: type,id, parentId
		myMoveAction.cut("document",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="document";		   					//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[4]=""+row.myRow.content[8].data;			//REMARKS
		tmpArr[5]=""+row.myRow.content[9];			//PARENT
	}
	else if(row.myRow.content[7]=="file")
	{
		//Params: type,id, parentId
		myMoveAction.cut("file",row.myRow.content[6],row.myRow.content[9]);

		tmpArr[0]="file";		   						//TYPE
		tmpArr[1]=""+row.myRow.content[6];   		//ID
		tmpArr[2]=""+row.myRow.content[4].data;   	//NAME
		//tmpArr[3]=""+row.myRow.content[5].data;   	//DESCRIPTION
		tmpArr[3]=""+row.myRow.content[8].data;			//REMARKS
		tmpArr[4]=""+row.myRow.content[9];			//PARENT
	}
	myMoveAction.initParams(tmpArr);
};

var callPasteToLocationAjax=function() {
	myMoveAction.verify=function() {
		if(this.movableItemType=="document")
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
		else if(this.movableItemType=="file")
		{
			if(this.movableFromCurrentParentId==this.movableToParentId)
			{
				alert("Please chose a different location");
				return false;
			}
		}
		return true;
	};

	if(myMoveAction.paste(dmsTableCurrentParent)==false)
		return;
	var id=""+myMoveAction.movableItemId;
	var type=""+myMoveAction.movableItemType;
	var pid=""+myMoveAction.movableFromCurrentParentId;
	var newPid=""+myMoveAction.movableToParentId;
	var params=myMoveAction.paramArray;
	if(type=="file")
	{
		//alert(params.length);
		params[4]=newPid;
	}
	else if(type=="document")
	{
		//alert(params.length);
		params[5]=newPid;
	}

	var myAjaxRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+24070+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;

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
					if(type=="file")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxFileRow(),params);
					else if(type=="document")
						addRowToTable1(document.getElementById(TABLE_NAME),getMaxDmsRow(),params);
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
/**********************************************************/
/*
 * Search
 */
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
		callSearchDmsAjax();
//		alert(key);
	}
}

function callSearchDmsAjax() {
	var mySearchRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+24010+"&key="+searchString+"&method="+"searchCostBook";
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
	innerStr+="<table id='searchTable' width='100%' class='contentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='45%'>Description</td><td width='30%'>Remarks</td></tr></thead>";
	innerStr+="<tbody id='searchbody'></tbody></table>";
	document.getElementById('searchResult').innerHTML=innerStr;
	populateSearchTable(xmlDoc,'searchTable');
	var bodyText=document.getElementById('searchResult').innerHTML;
	document.getElementById('searchResult').innerHTML=doHighlight(bodyText, key);
	addTableRolloverEffect('searchTable','tableRollOverEffect2','tableRowClickEffect2');
}

var populateSearchTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("document");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="document";		//Row type is document
		param[1]=content[i].childNodes[0].firstChild.data;

		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToSearchTable(tbl,rowToInsertAt,param);
		//reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("file");
	for(i=0;i<content.length;i++)
	{

		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="file";		//Row type is file
		param[1]=content[i].childNodes[0].firstChild.data;	//ID

		param[2]=content[i].childNodes[1].firstChild.data;	//NAME
		param[3]=content[i].childNodes[2].firstChild.data;	//REMARKS
		param[4]=content[i].childNodes[3].firstChild.data;	//PARENT
		//param[5]=content[i].childNodes[4].firstChild.data;

		addRowToSearchTable(tbl,rowToInsertAt,param);
		//reorderRows(tbl, rowToInsertAt);
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
	if(param[0]=="document")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callDmsAjax("+param[5]+")'><img src='images/utilities/directory.png' border='0'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[1]+";callDmsAjax("+param[4]+")'><img src='images/utilities/reference.png' border='0'></a>";
	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: Name
	var name;
	if(param[0]=='document')
	{
		cell[2]=row.insertCell(2);
		name=document.createTextNode(param[2]);
		cell[2].appendChild(name);
	}
	else
	{
		cell[2]=row.insertCell(2);
		name=document.createTextNode(param[2]);
		cell[2].appendChild(name);
		//cell[2].innerHTML="<a href='javascript:void(0);' onclick='downloadFileAction(event);'>"+param[2]+"</a>";
	}
	//Cell3: Description
	var description;
	if(param[0]=="document")
	{
		cell[3]=row.insertCell(3);
		description=document.createTextNode(param[3]);
		cell[3].appendChild(description);
	}
	else
	{
		cell[3]=row.insertCell(3);
		description=document.createTextNode("---");
		cell[3].appendChild(description);
	}
	//Cell4: Remarks
	var remarks;
	if(param[0]=="document")
	{
		cell[4]=row.insertCell(4);
		remarks=document.createTextNode(param[4]);
		cell[4].appendChild(remarks);
	}
	else{
		cell[4]=row.insertCell(4);
		remarks=document.createTextNode(param[3]);
		cell[4].appendChild(remarks);
	}

};


/**********************************************************/
/*
 * Init the first level
 */
initializeDocumentsTable(10140);
/**********************************************************/


/***********************************************************/