/**********************************************************
 * Creates basic facilities for Manipulating Schedule-of-Rates
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
var assemblyTableparent=1;	//Up one level
var assemblyTableTop=1;		//Top Level
var assemblyTableCurrentParent=1;			//parent of current level
var assemblyTablecontainer="blankContent";	//this DIV will contain our assembly
var assemblyPropertiesWindow=null;			//Handle to the properties(edit/add window)
//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="assemblySample";			//Should be named in HTML
var DIV_NAV_NAME="assemblyNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row numbering starts from here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="ASM_TTHEAD123";				
var ctx_TBODY="ASM_TTBODY123";

/*
 * For Search
 */
var key='qwerty';
var sid=0;

/* ============================================================= */
/*
 * Initializes Context Menu for Assembly Table
 * and then populates the table
 */
var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu();
			callAssemblyAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeAssemblyTable=function(id)
{
	writeWaitMsg(assemblyTablecontainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

	callContextMenuAjax(id, callBack);
};

var menu2=function()
{
	return configureContextMenuModel();
};


contextMenu.modifyMenu=function() {
	//clickOnTableRow();
	var srcObj=this.srcElement;
	currentMenuBar=this.menuBar;
	//setMenuPermissions(currentMenuBar,null);
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
	//var tblObject=tmp.parentNode.parentNode;
	clickOnTableRowContext(tmp);
	//Only Activate Menu Items relevant to context
	if(tmp.myRow==null)
	{
		setMenuItemState(210060,'disabled');	//EDIT
		setMenuItemState(210070,'disabled');	//DELETE
		setMenuItemState(210090,'disabled');	//CUT
		setMenuItemState(210100,'disabled');	//COPY
		//setMenuItemState(150012,'disabled');	//ADD MATERIAL
	}
	else
	{
		setMenuItemState(210060,'regular');	//EDIT
		setMenuItemState(210070,'regular');	//DELETE
		setMenuItemState(210090,'regular');	//CUT
		setMenuItemState(210100,'regular');	//COPY
		//if(tmp.myRow.content[7].data=="")
		//setMenuItemState(150012,'disabled');	//ADD MATERIAL
		//else
		//setMenuItemState(150012,'regular');	//ADD MATERIAL
	}
	//Show paste option only if something has been cut
	if(myMoveAction.movableItemType==null)
		setMenuItemState(210110,'disabled');
	else
		setMenuItemState(210110,'regular');
	//If this is top level, no need for navigation
	if(assemblyTableCurrentParent==1)
	{
		setMenuItemState(210010,'disabled');	//UP
		setMenuItemState(210020,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(210010,'regular');	//UP
		setMenuItemState(210020,'regular');	//TOP
	}
	//Finally set Menu Permissions if we missed earlier
	setMenuPermissions(currentMenuBar);
};
/**********************************************************/
/*
 * Ajax call to populate assembly at level $id$
 */

function callAssemblyAjax(id) {
	if(document.getElementById(assemblyTablecontainer)==null)return;
	if(assemblyPropertiesWindow!=null) assemblyPropertiesWindow.close();
	var myAssemblyRequest=getHTMLHTTPRequest();
	assemblyTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20010+"&parent="+id+"&method="+"get";

	myAssemblyRequest.open("GET",url,true);
	myAssemblyRequest.onreadystatechange=function()
	{
		if(myAssemblyRequest.readyState==4) {
			if(myAssemblyRequest.status==200) {
				renderAssembly(myAssemblyRequest);
			}
			else {
				alert("Connection Problem:"+myAssemblyRequest.statusText);
			}
		}
	};
	writeWaitMsg(assemblyTablecontainer,"themes/icons/ajax_loading/22.gif","Processing request, please wait...");

	myAssemblyRequest.send(null);
}

function renderAssembly(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(assemblyTablecontainer,systemMsg);
	if(errorFlag==0) return;
	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='15%'>Name</td><td width='60%'>Description</td><td>Price</td><td>Premium(%)</td><td width='16px'>D</td><td width='16px'>E</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(assemblyTablecontainer).innerHTML=str;
	//Update the assembly navigation bar
	updateAssemblyNav(xmlDoc,DIV_NAV_NAME);
	initiateTableRollover(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	populateTable(xmlDoc,TABLE_NAME);
	contextMenu.attachTo(ctx_THEAD,menu2());
	contextMenu.attachTo(ctx_TBODY,menu2());
	//addTableRolloverEffect(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
}
/*
 * Update navigation bar for Assembly Table according to current level
 */
var updateAssemblyNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='navTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		assemblyTableparent=parentId[0].getAttribute("id");

		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableparent+")'><img src='images/assembly/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableTop+")'><img src='images/assembly/top.png' border='0' alt='Top level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myAssemblyAddWindow(\""+TABLE_NAME+"\");'>Add</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myAssemblyEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initItemWin(false,\""+TABLE_NAME+"\");'>Add Material[E]</a></td>";
	}
	else
	{
		str+="<td><img src='images/assembly/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/assembly/top1.png' alt='Top level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myAssemblyAddWindow(\""+TABLE_NAME+"\");'>Add</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myAssemblyEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteChecked(\""+TABLE_NAME+"\");'>Delete[D]</a></td>";
		//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initItemWin(false,\""+TABLE_NAME+"\");'>Add Material[E]</a></td>";
		assemblyTableparent=1;
	}
	str+="<td>&nbsp;</td><td align='right'><input type='button' name='search' value='Search' onclick='populateSearchWin();'/></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("item");

	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		//alert(content[i].childNodes.length);
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
	var isFolder=(param[3]=="--");
	//Highlight Search
	if(param[0]==sid)
		row.className='searchClass';
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	//Show any assembly as a container whose price has been set to zero
	if(isFolder)
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callAssemblyAjax("+param[0]+")'><img src='images/assembly/folder.gif' border='0' width='16' height='16'></a>";
	else
		//cell[0].innerHTML="<a href='javascript:void(0);' onclick='callAssemblyAjax("+param[0]+")'><img src='images/assembly/item.png' border='0' width='16' height='16'></a>";
		cell[0].innerHTML="<img src='images/assembly/item.png' border='0' width='16' height='16'>";

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

	//Cell4: price
	cell[4]=row.insertCell(4);
	var unit;
	var sep;
	var price;
	if(isFolder)
	{
		unit=document.createTextNode("");
		sep=document.createTextNode("");
		price=document.createTextNode("-");
	}
	else
	{
		unit=document.createTextNode(param[3]);
		sep=document.createTextNode("/");
		price=document.createTextNode(param[4]);
	}
	cell[4].appendChild(price);
	cell[4].appendChild(sep);
	cell[4].appendChild(unit);

	//Cell5: Premium
	cell[5]=row.insertCell(5);
	var premium;
	if(isFolder)
		premium=document.createTextNode("-");
	else
		premium=document.createTextNode(param[5]);
	cell[5].appendChild(premium);

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
	rowContents[6]=param[0];			//ID
	rowContents[7]=unit;				//UNIT
	rowContents[8]=price;				//PRICE
	rowContents[9]=premium;				//PREMIUM
	rowContents[10]=param[6];			//REMARKS
	rowContents[11]=param[7];			//PARENT
	rowContents[12]=param[8];			//DISPLAY UNIT
	rowContents[13]=param[9];			//PRICE MULTIPLIER
	//alert(rowContents[12]+"   "+rowContents[13]);
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;

	addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Delete Items Asynchronously using Ajax
 */

function callDeleteAssemblyAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myAssemblyDeleteRequest=getHTMLHTTPRequest();
	var myDelTable;
	var myDelRowsArray=Array();
	var myDelrIndex;

	myDelTable=tbl;
	myDelRowsArray=obj;
	myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	for(var i=0; i<obj.length; i++) {
		if(i==0) {
			id+=obj[i].myRow.content[6];
		}
		else
			id+=","+obj[i].myRow.content[6];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20020+"&id="+URLEncode(id)+"&method="+"delete";
	myAssemblyDeleteRequest.open("GET",url,true);
	myAssemblyDeleteRequest.onreadystatechange=function()
	{
		if(myAssemblyDeleteRequest.readyState==4) {
			if(myAssemblyDeleteRequest.status==200) {
				var xmlDoc=myAssemblyDeleteRequest.responseXML;
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
				alert("Connection Problem:"+myAssemblyDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myAssemblyDeleteRequest.send(null);
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
		callDeleteAssemblyAjax(tbl,checkedObjArray,rIndex);
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
	callDeleteAssemblyAjax(tbl,checkedObjArray,rIndex);
};

/**********************************************************/
/*
 * Edit Items Asynchronously using Ajax
 */
var assemblyPropertiesWindowDiv="blankHidden";
var assemblyPropertiesWindowTitle="Properties";
var assemblyPropertiesWindowId="assemblyPropertiesWindowId";
var indexOfRowToEdit=-1;
var rowToEdit=null;

var myContextAssemblyEditWindow=function() {
	indexOfRowToEdit=-1;
	rowToEdit=null;
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
	var tbl=rowToEdit.parentNode.parentNode;
	if(rowToEdit!=null) {
		populateAssemblyEditWin();
	}
};

var myAssemblyEditWindow=function(tblId) {
	var tbl=document.getElementById(tblId);
	indexOfRowToEdit=-1;
	rowToEdit=null;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++) {
		if(tbl.tBodies[0].rows[i].myRow && tbl.tBodies[0].rows[i].myRow.content[1].getAttribute('type') == 'radio' && tbl.tBodies[0].rows[i].myRow.content[1].checked) {
			indexOfRowToEdit=i;
			rowToEdit=tbl.tBodies[0].rows[i];
		}
	}
	if(rowToEdit!=null) {
		populateAssemblyEditWin();
	}
};

var populateAssemblyEditWin=function() {
	var innerStr="<table>";
	if(rowToEdit!=null) {
		innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='"+rowToEdit.myRow.content[4].data+"'></td></tr>";
		innerStr+="<tr><td><label>Description:</label></td><td><textarea rows='6' cols='30' id='editDescription'>"+rowToEdit.myRow.content[5].data+"</textarea></td></tr>";

		innerStr+="<tr><td><label>Unit:</label></td>";
		innerStr+="<td><select id='editUnit' onchange='showUnitOptions()'>";
		innerStr+="<option value='--' "+(rowToEdit.myRow.content[7].data=='--'?"selected='selected'":"")+">--</option>";
		innerStr+="<option value='LS' "+(rowToEdit.myRow.content[7].data=='LS'?"selected='selected'":"")+">lump sum(LS)</option>";
		innerStr+="<option value='Nos.' "+(rowToEdit.myRow.content[7].data=='Nos.'?"selected='selected'":"")+">numbers(Nos.)</option>";
		innerStr+="<option value='m' "+(rowToEdit.myRow.content[7].data=='m'?"selected='selected'":"")+">metre(m)</option>";
		innerStr+="<option value='sqm' "+(rowToEdit.myRow.content[7].data=='sqm'?"selected='selected'":"")+">square metre(sqm)</option>";
		innerStr+="<option value='cum' "+(rowToEdit.myRow.content[7].data=='cum'?"selected='selected'":"")+">cubic metre(cum)</option>";
		innerStr+="<option value='kg' "+(rowToEdit.myRow.content[7].data=='kg'?"selected='selected'":"")+">kilogram(kg)</option>";
		innerStr+="<option value='hr' "+(rowToEdit.myRow.content[7].data=='hr'?"selected='selected'":"")+">hour(hr)</option>";
		innerStr+="<option value='Mandays' "+(rowToEdit.myRow.content[7].data=='Mandays'?"selected='selected'":"")+">Mandays</option>";
		innerStr+="</select></td></tr>";

		//innerStr+="<tr><td><label>Unit:</label></td><td><input size='40' type='text' id='editUnit' value='"+rowToEdit.myRow.content[7].data+"'></td></tr>";
		innerStr+="<tr><td><label>Price:</label></td><td><input size='40' type='text' id='editPrice' value='"+(rowToEdit.myRow.content[8].data!="-"?rowToEdit.myRow.content[8].data:0)+"'></td></tr>";
		innerStr+="<tr><td><label>Premium:</label></td><td><input size='40' type='text' id='editPremium' value='"+(rowToEdit.myRow.content[9].data!="-"?rowToEdit.myRow.content[9].data:0)+"'></td></tr>";

		//Modification for ALT_UNIT
		innerStr+="<tr><td><label>Displayed Unit:</label></td><td><input size='40' type='text' id='editDisplayedUnit' value='"+rowToEdit.myRow.content[12]+"'></td></tr>";
		innerStr+="<tr><td><label>Unit Multiplier:</label></td><td><input size='40' type='text' id='editPriceMultiplier' value='"+rowToEdit.myRow.content[13]+"'></td></tr>";
		//END: Modification for ALT_UNIT

		innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>"+rowToEdit.myRow.content[10]+"</textarea></td></tr>";
		innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callEditAssemblyAjax();'>Update</a>&nbsp;&nbsp;";
		innerStr+="<a href='javascript:void(0)' onclick='assemblyPropertiesWindow.close()'>Discard</a></td></tr>";
	}
	innerStr+="</table>";
	var editableDiv=document.getElementById(assemblyPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;

	//Modification for ALT_UNIT
	if(rowToEdit.myRow.content[7].data=='--' || rowToEdit.myRow.content[7].data=='') {
		document.getElementById('editPrice').parentNode.parentNode.childNodes[0].style.display='none';
		document.getElementById('editPrice').parentNode.parentNode.childNodes[1].style.display='none';
		document.getElementById('editPremium').parentNode.parentNode.childNodes[0].style.display='none';
		document.getElementById('editPremium').parentNode.parentNode.childNodes[1].style.display='none';

		document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[0].style.display='none';
		document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[1].style.display='none';
		document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[0].style.display='none';
		document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[1].style.display='none';
	}
	else {
		document.getElementById('editPrice').parentNode.parentNode.childNodes[0].style.display='';
		document.getElementById('editPrice').parentNode.parentNode.childNodes[1].style.display='';
		document.getElementById('editPremium').parentNode.parentNode.childNodes[0].style.display='';
		document.getElementById('editPremium').parentNode.parentNode.childNodes[1].style.display='';

		//If want to display then modify display property to blank
		document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[0].style.display='';
		document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[1].style.display='';
		document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[0].style.display='';
		document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[1].style.display='';
	}
	//END:Modification for ALT_UNIT

	openMyAssemblyPropertiesWin();
};

var showUnitOptions=function() {
	if(document.getElementById('editUnit').value=='--') {
		document.getElementById('editPrice').parentNode.parentNode.childNodes[0].style.display='none';
		document.getElementById('editPrice').parentNode.parentNode.childNodes[1].style.display='none';
		document.getElementById('editPremium').parentNode.parentNode.childNodes[0].style.display='none';
		document.getElementById('editPremium').parentNode.parentNode.childNodes[1].style.display='none';

		document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[0].style.display='none';
		document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[1].style.display='none';
		document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[0].style.display='none';
		document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[1].style.display='none';
	}
	else {
		document.getElementById('editPrice').parentNode.parentNode.childNodes[0].style.display='';
		document.getElementById('editPrice').parentNode.parentNode.childNodes[1].style.display='';
		document.getElementById('editPremium').parentNode.parentNode.childNodes[0].style.display='';
		document.getElementById('editPremium').parentNode.parentNode.childNodes[1].style.display='';

		//If want to display then modify display property to blank
		document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[0].style.display='';
		document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[1].style.display='';
		document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[0].style.display='';
		document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[1].style.display='';
	}
};

var openMyAssemblyPropertiesWin=function() {
	assemblyPropertiesWindow=internalWindow.open('assemblyPropertiesWindowId', 'div', assemblyPropertiesWindowDiv, '#Properties Window', 'width=500px,height=450px,left=150px,top=100px,resize=1,scrolling=1');
};


var callEditAssemblyAjax=function() {
	var myAssemblyUpdateData="";
	var myAssemblyEditRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var editName=document.getElementById('editName').value;
	var editDescription=document.getElementById('editDescription').value;
	var editUnit=document.getElementById('editUnit').value;
	document.getElementById('editUnit').style.display='none';
	document.getElementById('editUnit').parentNode.insertBefore(document.createTextNode(editUnit), document.getElementById('editUnit'));
	var editPrice=document.getElementById('editPrice').value;
	var editPremium=document.getElementById('editPremium').value;
	var editDisplayedUnit=document.getElementById('editDisplayedUnit').value==""?"-":document.getElementById('editDisplayedUnit').value;
	var editPriceMultiplier=document.getElementById('editPriceMultiplier').value==""?"0":document.getElementById('editPriceMultiplier').value;
	var editRemarks=document.getElementById('editRemarks').value;
	myAssemblyUpdateData="id="+rowToEdit.myRow.content[6];
	myAssemblyUpdateData+="&name="+URLEncode(editName);
	myAssemblyUpdateData+="&description="+URLEncode(editDescription);
	myAssemblyUpdateData+="&unit="+URLEncode(editUnit);
	myAssemblyUpdateData+="&price="+editPrice;
	myAssemblyUpdateData+="&premium="+editPremium;
	myAssemblyUpdateData+="&displayUnit="+URLEncode(editDisplayedUnit);
	myAssemblyUpdateData+="&priceMultiplier="+editPriceMultiplier;
	myAssemblyUpdateData+="&remarks="+URLEncode(editRemarks);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20030+"&method="+"update";

	myAssemblyEditRequest.open('POST', url, true);
	myAssemblyEditRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myAssemblyEditRequest.setRequestHeader("Content-length", myAssemblyUpdateData.length);
	myAssemblyEditRequest.onreadystatechange=function()
	{
		if(myAssemblyEditRequest.readyState==4) {
			if(myAssemblyEditRequest.status==200) {
				var xmlDoc=myAssemblyEditRequest.responseXML;
				var statusFlag=0;
				if(xmlDoc==null) {alert("Data Error");}
				else
				{
					var systemMsg=xmlDoc.getElementsByTagName("status");
					statusFlag=systemStatus(null,systemMsg);
				}
				if(statusFlag==1) {
					rowToEdit.myRow.content[4].data=editName;
					rowToEdit.myRow.content[5].data=editDescription;
					rowToEdit.myRow.content[7].data=editUnit=="--"?"":editUnit;
					rowToEdit.myRow.content[8].data=editUnit=="--"?"-":editPrice;
					rowToEdit.myRow.content[8].parentNode.childNodes[1].data=editUnit=="--"?"":"/";
					rowToEdit.myRow.content[9].data=editUnit=="--"?"-":editPremium;
					rowToEdit.myRow.content[10]=editRemarks;
					rowToEdit.myRow.content[12]=editDisplayedUnit;
					rowToEdit.myRow.content[13]=editPriceMultiplier;
					if(editUnit=="--") {
						rowToEdit.cells[0].innerHTML="<a href='javascript:void(0);' onclick='callAssemblyAjax("+rowToEdit.myRow.content[6]+")'><img src='images/assembly/folder.gif' border='0' width='16' height='16'></a>";
					}
						//rowToEdit.cells[0].firstChild.firstChild.src="images/assembly/folder.gif";
					else {
						rowToEdit.cells[0].innerHTML="<img src='images/assembly/item.png' border='0' width='16' height='16'>";
					}
						//rowToEdit.cells[0].firstChild.firstChild.src="images/assembly/item.png";
						//rowToEdit.cells[0].firstChild.src="images/assembly/item.png";
				}
				else if(statusFlag==2){
					alert("EDIT: System Error");
				}
				assemblyPropertiesWindow.close();
			}
			else {
				alert("Connection Problem:"+myAssemblyEditRequest.statusText);
				assemblyPropertiesWindow.close();
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myAssemblyEditRequest.send(myAssemblyUpdateData);
};


/**********************************************************/
/*
 * Add new row
 */
var myAssemblyTable=null;
var myAssemblyAddWindow=function(tblId) {
	var tbl=document.getElementById(tblId);
	myAssemblyTable=tbl;
	populateMaterialAddWin();
};

var populateMaterialAddWin=function() {
	//alert(document.getElementById(assemblyPropertiesWindowDiv).innerHTML);
	var innerStr="<table>";
	innerStr+="<tr><td><label>Name:</label></td><td><input size='40' type='text' id='editName' value='name'></td></tr>";
	innerStr+="<tr><td><label>Description:</label></td><td><textarea rows='6' cols='30' id='editDescription'>specification</textarea></td></tr>";

	innerStr+="<tr><td><label>Unit:</label></td>";
	innerStr+="<td><select id='editUnit'  onchange='showUnitOptions()'>";
	innerStr+="<option value='--'>--</option>";
	innerStr+="<option value='LS'>lump sum(LS)</option>";
	innerStr+="<option value='Nos.'>number(Nos.)</option>";
	innerStr+="<option value='m'>metre(m)</option>";
	innerStr+="<option value='sqm'>square metre(sqm)</option>";
	innerStr+="<option value='cum'>cubic metre(cum)</option>";
	innerStr+="<option value='kg'>kilogram(kg)</option>";
	innerStr+="<option value='Hours'>hour(hr)</option>";
	innerStr+="<option value='Mandays'>Mandays</option>";
	innerStr+="</select></td></tr>";

	//innerStr+="<tr><td><label>Unit:</label></td><td><input size='40' type='text' id='editUnit' value='unit'></td></tr>";
	innerStr+="<tr><td><label>Price:</label></td><td><input size='40' type='text' id='editPrice' value='0.000'></td></tr>";
	innerStr+="<tr><td><label>Premium:</label></td><td><input size='40' type='text' id='editPremium' value='0'></td></tr>";

	//Modification for HAFED
	innerStr+="<tr><td><label>Displayed Unit:</label></td><td><input size='40' type='text' id='editDisplayedUnit' value='-'></td></tr>";
	innerStr+="<tr><td><label>Unit Multiplier:</label></td><td><input size='40' type='text' id='editPriceMultiplier' value='0'></td></tr>";
	//END: Modification for HAFED

	innerStr+="<tr><td><label>Remarks:</label></td><td><textarea rows='6' cols='30' id='editRemarks'>remarks</textarea></td></tr>";
	innerStr+="<tr><td colspan='2' align='center'><a href='javascript:void(0)' onclick='callAddAssemblyAjax();'>Add</a>&nbsp;&nbsp;";
	innerStr+="<a href='javascript:void(0)' onclick='assemblyPropertiesWindow.close()'>Discard</a></td></tr>";

	innerStr+="</table>";
	var editableDiv=document.getElementById(assemblyPropertiesWindowDiv);
	editableDiv.innerHTML=innerStr;

	//Modification for ALT_UNIT
	document.getElementById('editPrice').parentNode.parentNode.childNodes[0].style.display='none';
	document.getElementById('editPrice').parentNode.parentNode.childNodes[1].style.display='none';
	document.getElementById('editPremium').parentNode.parentNode.childNodes[0].style.display='none';
	document.getElementById('editPremium').parentNode.parentNode.childNodes[1].style.display='none';

	document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[0].style.display='none';
	document.getElementById('editDisplayedUnit').parentNode.parentNode.childNodes[1].style.display='none';
	document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[0].style.display='none';
	document.getElementById('editPriceMultiplier').parentNode.parentNode.childNodes[1].style.display='none';
	//END: Modification for ALT_UNIT

	openMyAssemblyPropertiesWin();
};

var callAddAssemblyAjax=function() {
	var myAssemblyAddData="";
	var myAssemblyAddRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);

	var editName=document.getElementById('editName').value;
	var editDescription=document.getElementById('editDescription').value;
	var editUnit=document.getElementById('editUnit').value;
	document.getElementById('editUnit').style.display='none';
	document.getElementById('editUnit').parentNode.insertBefore(document.createTextNode(editUnit), document.getElementById('editUnit'));

	var editPrice=document.getElementById('editPrice').value;
	var editPremium=document.getElementById('editPremium').value;
	var editDisplayedUnit=document.getElementById('editDisplayedUnit').value==""?"-":document.getElementById('editDisplayedUnit').value;
	var editPriceMultiplier=document.getElementById('editPriceMultiplier').value==""?"0":document.getElementById('editPriceMultiplier').value;
	var editRemarks=document.getElementById('editRemarks').value;

	myAssemblyAddData="id="+assemblyTableCurrentParent;
	myAssemblyAddData+="&name="+URLEncode(editName);
	myAssemblyAddData+="&description="+URLEncode(editDescription);
	myAssemblyAddData+="&unit="+URLEncode(editUnit);
	myAssemblyAddData+="&price="+editPrice;
	myAssemblyAddData+="&premium="+editPremium;
	myAssemblyAddData+="&displayUnit="+URLEncode(editDisplayedUnit);
	myAssemblyAddData+="&priceMultiplier="+editPriceMultiplier;
	myAssemblyAddData+="&remarks="+URLEncode(editRemarks);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20040+"&method="+"add";
	//alert(myAssemblyAddData);
	myAssemblyAddRequest.open('POST', url, true);
	myAssemblyAddRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myAssemblyAddRequest.setRequestHeader("Content-length", myAssemblyAddData.length);
	myAssemblyAddRequest.onreadystatechange=function()
	{
		if(myAssemblyAddRequest.readyState==4) {
			if(myAssemblyAddRequest.status==200) {
				var xmlDoc=myAssemblyAddRequest.responseXML;
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
					param[0]=""+newId;
					param[1]=editName;
					param[2]=editDescription;
					param[3]=editUnit;
					param[4]=editPrice;
					param[5]=editPremium;
					param[6]=editRemarks;
					param[7]=""+assemblyTableCurrentParent;
					param[8]=""+editDisplayedUnit;
					param[9]=""+editPriceMultiplier;
					addRowToTable1(myAssemblyTable,-1,param);
				}
				else if(statusFlag==2){
					alert("ADD: System Error");
				}
				assemblyPropertiesWindow.close();
			}
			else {
				alert("Connection Problem:"+myAssemblyAddRequest.statusText);
				assemblyPropertiesWindow.close();
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myAssemblyAddRequest.send(myAssemblyAddData);
};

/**********************************************************/
/*
 * Move Assembly from one parent to other
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
	//Params: type,id, parentId
	myMoveAction.cut("cutAssembly",row.myRow.content[6],row.myRow.content[11]);
	var tmpArr=new Array();
	tmpArr[0]=""+row.myRow.content[6];   		//ID
	tmpArr[1]=""+row.myRow.content[4].data;   	//NAME
	tmpArr[2]=""+row.myRow.content[5].data;   	//DESCRIPTION
	tmpArr[3]=""+(row.myRow.content[7].data==""?"--":row.myRow.content[7].data);		//UNIT
	tmpArr[4]=""+row.myRow.content[8].data;		//PRICE
	tmpArr[5]=""+row.myRow.content[9].data;		//PREMIUM
	tmpArr[6]=""+row.myRow.content[10];			//REMARKS
	tmpArr[7]=""+row.myRow.content[11];			//PARENT
	tmpArr[8]=""+row.myRow.content[12];			//DISPLAYED_UNIT
	tmpArr[9]=""+row.myRow.content[13];			//UNIT_MULTIPLIER
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
	//Params: type,id, parentId
	myMoveAction.cut("copyAssembly",row.myRow.content[6],row.myRow.content[11]);
	var tmpArr=new Array();
	tmpArr[0]=""+row.myRow.content[6];   		//ID
	tmpArr[1]=""+row.myRow.content[4].data;   	//NAME
	tmpArr[2]=""+row.myRow.content[5].data;   	//DESCRIPTION
	tmpArr[3]=""+(row.myRow.content[7].data==""?"--":row.myRow.content[7].data);		//UNIT
	tmpArr[4]=""+row.myRow.content[8].data;		//PRICE
	tmpArr[5]=""+row.myRow.content[9].data;		//PREMIUM
	tmpArr[6]=""+row.myRow.content[10];			//REMARKS
	tmpArr[7]=""+row.myRow.content[11];			//PARENT
	tmpArr[8]=""+row.myRow.content[12];			//DISPLAYED_UNIT
	tmpArr[9]=""+row.myRow.content[13];			//UNIT_MULTIPLIER
	myMoveAction.initParams(tmpArr);

};

var callPasteToLocationAjax=function() {
	myMoveAction.verify=function() {
		if(this.movableItemType=="cutAssembly")
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
			return true;
		}
		else
			return true;
	};
	if(myMoveAction.paste(assemblyTableCurrentParent)==false)
		return;

	var myAjaxRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var id=myMoveAction.movableItemId;
	var type=myMoveAction.movableItemType;
	var pid=myMoveAction.movableFromCurrentParentId;
	var newPid=myMoveAction.movableToParentId;
	var params=myMoveAction.paramArray;
	params[7]=newPid;

	var type=""+myMoveAction.movableItemType;
	var url="";
	if(type=="cutAssembly")
		url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20610+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;
	else
		url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20611+"&id="+id+"&pid="+pid+"&newPid="+newPid+"&method="+type;
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
					if(type=="cutAssembly")
						addRowToTable1(document.getElementById(TABLE_NAME),-1,params);
					else if(type=="copyAssembly")
					{
						var newKey=xmlDoc.getElementsByTagName("key");
						params[0]=""+newKey[0].getAttribute("value");
						addRowToTable1(document.getElementById(TABLE_NAME),-1,params);
					}
				}
				else if(statusFlag==2) {
					alert("Copy/Move: an error occured");
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
	projectPropertiesWindow=internalWindow.open('searchWindow', 'div', 'blankHidden1', 'Search Assemblies', 'width=600px,height=400px,left=200px,top=150px,resize=1,scrolling=1');
};

function vaildateKey()
{
	key=document.getElementById('searchKey').value;
	if(key.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchAssembliesAjax();
		//alert(key);
	}
}

function callSearchAssembliesAjax() {
	var mySearchRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20010+"&key="+searchString+"&method="+"searchAssemblies";
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
	innerStr+="<table id='searchTable' width='100%' class='contentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td>Description</td><td>Price</td><td>Premium</td></tr></thead>";
	innerStr+="<tbody id='searchbody'></tbody></table>";
	document.getElementById('searchResult').innerHTML=innerStr;
	//initiateTableRollover('searchTable','tableRollOverEffect1','tableRowClickEffect1');
	populateSearchTable(xmlDoc,'searchTable');
	var bodyText=document.getElementById('searchResult').innerHTML;
	document.getElementById('searchResult').innerHTML=doHighlight(bodyText, key);
	addTableRolloverEffect('searchTable','tableRollOverEffect2','tableRowClickEffect2');
}



var populateSearchTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("item");

	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		//alert(content[i].childNodes.length);
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
	//alert('classA' + (iteration % 2));
	var isFolder=(param[3]=="--");
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	//Show any assembly as a container whose price has been set to zero
	if(isFolder)
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[0]+";callAssemblyAjax("+param[7]+");'><img src='images/assembly/folder.gif' border='0' width='16' height='16'></a>";
	else
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='sid="+param[0]+"; callAssemblyAjax("+param[7]+");'><img src='images/assembly/item.png' border='0' width='16' height='16'></a>";

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

	//Cell4: price
	cell[4]=row.insertCell(4);
	var unit;
	var sep;
	var price;
	if(isFolder)
	{
		unit=document.createTextNode("");
		sep=document.createTextNode("");
		price=document.createTextNode("-");
	}
	else
	{
		unit=document.createTextNode(param[3]);
		sep=document.createTextNode("/");
		price=document.createTextNode(param[4]);
	}
	cell[4].appendChild(price);
	cell[4].appendChild(sep);
	cell[4].appendChild(unit);

	//Cell5: Premium
	cell[5]=row.insertCell(5);
	var premium;
	if(isFolder)
		premium=document.createTextNode("-");
	else
		premium=document.createTextNode(param[5]);
	cell[5].appendChild(premium);



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
	rowContents[7]=unit;				//UNIT
	rowContents[8]=price;				//PRICE
	rowContents[9]=premium;				//PREMIUM
	rowContents[10]=param[6];			//REMARKS
	rowContents[11]=param[7];			//PARENT
	rowContents[12]=param[8];			//DISPLAY UNIT
	rowContents[13]=param[9];			//PRICE MULTIPLIER
	//alert(rowContents[12]+"   "+rowContents[13]);
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	//addRowRolloverEffect(row);
};

/**********************************************************/
/*
 * Init the first level
 */
initializeAssemblyTable(10010);