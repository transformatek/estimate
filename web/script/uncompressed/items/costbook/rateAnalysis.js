/**********************************************************
 * Creates basic facilities for preparation of "Analysis of Rate"
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
//Table must have <tbody>
var INPUT_NAME_PREFIX="inputName";		//set via script
var RADIO_NAME="radName";				//set via script
var TABLE_NAME="rateAnalysisSample";			//Should be named in HTML
var DIV_NAV_NAME="rateAnalysisNavDiv";			//Navigation Bar
var ROW_BASE=1;							//Row nubering starts fro here
var hasLoaded=false;
//Must be Unique across all pages
var ctx_THEAD="RATES_TTHEAD123";				
var ctx_TBODY="RATES_TTBODY123";
/*
 * For Search in Assembly sub-window
 */
var key='qwerty';
var searchFlag=false;

/*
 * For Search in Costbook sub-window
 */
var key1='qwerty';
var searchFlag1=false;

/*
 * For Search in Material sub-window
 */
var key2='qwerty';
var searchFlag2=false;

/* ============================================================= */
/*
 * Initializes Context Menu for Analysis-of-Rate
 * and then populates the table
 */

//DHTMLSuite.commonObj.setCssCacheStatus(false);
//Init Context Menu Object; One object for current page
var contextMenu=null;
contextMenu = new DHTMLSuite.contextMenu();
//DHTMLSuite.commonObj.setCssCacheStatus(false);
contextMenu.setWidth(140);

var callBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			configureContextMenu(myContextMenuRequest);
			openCostBookOptionsWindow();
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};

var initializeAnalysisTable=function(id)
{
	myCurrentMenuParent=id;
	writeWaitMsg(ratesManagerContainer,"themes/icons/ajax_loading/22.gif","Loading Menu...");

	callContextMenuAjax(id, callBack);
};
var menu2=function()
{
	return configureContextMenuModel();
};

contextMenu.modifyMenu=function() {
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
	clickOnTableRowContext(tmp);
	//TR->TBODY/THEAD->TABLE
	var tbl=tmp.parentNode.parentNode;
	var div=tbl.parentNode;
	//If context menu has been opened inside jobs sub window
	if(div.getAttribute("matRef")!=null && div.getAttribute("matRef")!="")
	{
		hideMenuItem(210510);		//UP
		hideMenuItem(210520);		//TOP
		//hideMenuItem(210530);		//SEPARATOR

		hideMenuItem(210540);		//RATE ANALYSIS

		hideMenuItem(210590);		//ADD OVERHEAD
		hideMenuItem(210600);		//IMPORT(OVERHEAD)
		//hideMenuItem(210650);		//IMPORT COSTBOOK(OVERHEAD)
		//hideMenuItem(210660);		//IMPORT ASSEMBLIES(OVERHEAD)

		hideMenuItem(210610);		//EDIT(OVERHEAD)
		hideMenuItem(210620);		//DELETE(OVERHEAD)

		showMenuItem(210550);		//ADD MATERIAL
		showMenuItem(210560);		//IMPORT(MATERIAL)
		//showMenuItem(210630);		//IMPORT COSTBOOK(MATERIAL)
		//showMenuItem(210640);		//IMPORT ASSEMBLIES(MATERIAL)
		showMenuItem(210570);		//EDIT(MATERIAL)
		showMenuItem(210580);		//DELETE(MATERIAL)

		if(tmp.myRow==null || tmp.myRow.content[9]==0 || tmp.myRow.content[5].parentNode.childNodes[2]!=null)
		{
			hideMenuItem(210570);
			hideMenuItem(210580);
		}
	}
	else if(div.getAttribute("ovhRef")!=null && div.getAttribute("ovhRef")!="")
	{
		hideMenuItem(210510);		//UP
		hideMenuItem(210520);		//TOP
		//hideMenuItem(210530);		//SEPARATOR

		hideMenuItem(210540);

		hideMenuItem(210550);
		hideMenuItem(210560);
		//hideMenuItem(210630);
		//hideMenuItem(210640);
		hideMenuItem(210570);
		hideMenuItem(210580);

		showMenuItem(210590);
		showMenuItem(210600);
		//showMenuItem(210650);
		//showMenuItem(210660);

		showMenuItem(210610);
		showMenuItem(210620);
		//If we are over the THEAD or a add-new row
		if(tmp.myRow==null || tmp.myRow.content[8]==0 || tmp.myRow.content[4].parentNode.childNodes[2]!=null)
		{
			hideMenuItem(210610);
			hideMenuItem(210620);
		}
	}
	else
	{
		showMenuItem(210510);		//UP
		showMenuItem(210520);		//TOP
		//showMenuItem(210530);		//SEPARATOR
		showMenuItem(210540);		//RATE ANALYSIS

		if(tmp.myRow==null)
		{
			setMenuItemState(210540,'disabled');
		}
		else
		{
			//alert(" :"+tmp.myRow.content[7].data+": ");
			if(tmp.myRow.content[7].data!="")  // Row is Not Folder
				setMenuItemState(210540,'regular');
			else
				setMenuItemState(210540,'disabled');
		}


		hideMenuItem(210550);
		hideMenuItem(210560);
		//hideMenuItem(210630);
		//hideMenuItem(210640);
		hideMenuItem(210570);
		hideMenuItem(210580);

		hideMenuItem(210590);
		hideMenuItem(210600);
		//hideMenuItem(210650);
		//hideMenuItem(210660);
		hideMenuItem(210610);
		hideMenuItem(210620);
		//alert(assemblyTableparent);
		if(assemblyTableCurrentParent==1)
		{
			setMenuItemState(210510,'disabled');	//UP
			setMenuItemState(210520,'disabled');	//TOP
		}
		//We are in search window
		else if(assemblyTableCurrentParent==0)
		{
			setMenuItemState(210510,'disabled');	//UP
			setMenuItemState(210520,'regular');		//TOP
		}
		else
		{
			setMenuItemState(210510,'regular');	//UP
			setMenuItemState(210520,'regular');	//TOP
		}
	}
	//Finally set Menu permissions if missed earlier
	setMenuPermissions(currentMenuBar,null);
};
/************************ANALYSIS OF RATES************************/
var costBookId;									//Referenced costbook

var ratesManagerContainer="blankContent";			//Main div containing the DHTML window
var ratesOptionsContainer='ratesOptions';			//Contains link to assembly/item menu
var ratesInnnerContainer="innerRATESContainer";		//Main inner window(Here lists of Assemblies and Resources with price defined in the selected costbook will be populated)

var openCostBookOptionsWindow=function() {
	var div=document.getElementById(ratesManagerContainer);
	div.innerHTML="<div id='"+ratesOptionsContainer+"'><a href='javascript:void(0);' onclick='openAssemblyCostTable();'>Assemblies</a>&nbsp;&nbsp;<a href='javascript:void(0);' onclick='openMaterialCostTable();'>Resources</a></div><br>"+
	"<div id='"+ratesInnnerContainer+"'>Please click on one of the options above</div>";
};

/**********************************************************/
/*
 * Open Assemblies Price Tab
 */
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


var assemblyTableparent=1;	//Up one level
var assemblyTableTop=1;		//Top Level
var assemblyTableCurrentParent=1;				//parent of current level
var analysisTableContainer=ratesInnnerContainer;	//this DIV will contain our assembly
var asmAnalysisWindow=null;	//Handle to the current analysis window
//We will close the import subwindows when rate-of-analysis window is closed
var importWindow=null;

var openAssemblyCostTable=function() {
	callAssemblyAjax(1);
};

/*
 * Ajax call to populate assembly at level $id$
 */

function callAssemblyAjax(id) {
	if(document.getElementById(analysisTableContainer)==null) return;
	if(asmAnalysisWindow!=null) asmAnalysisWindow.close();
	var myAssemblyRequest=getHTMLHTTPRequest();
	assemblyTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20250+"&parent="+id+"&cbId="+costBookId+"&method="+"getAssemblyCost";

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
	writeWaitMsg(analysisTableContainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myAssemblyRequest.send(null);
}

function renderAssembly(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(analysisTableContainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+DIV_NAV_NAME+"'></div>";
	str+="<table id='"+TABLE_NAME+"' width='97%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='15%'>Name</td><td width='70%'>Description</td><td>Price</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(analysisTableContainer).innerHTML=str;
	//Update the assembly navigation bar
	updateAssemblyNav(xmlDoc,DIV_NAV_NAME);
	populateAssemblyTable(xmlDoc,TABLE_NAME);
	addTableRolloverEffect(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
	contextMenu.attachTo(ctx_THEAD,menu2(0));
	contextMenu.attachTo(ctx_TBODY,menu2(0));
}
/*
 * Update navigation bar for Assembly Table according to current level
 */
var updateAssemblyNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='innerNavTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		assemblyTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableparent+")'><img src='images/assembly/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableTop+")'><img src='images/assembly/top.png' border='0' alt='Top level'></a></td>";
	}
	else if(searchFlag==false)
	{
		str+="<td><img src='images/assembly/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/assembly/top1.png' alt='Top level'></td>";
		assemblyTableparent=1;
	}
	else
	{
		str+="<td><img src='images/assembly/up1.png' alt='Up one level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callAssemblyAjax("+assemblyTableTop+")'><img src='images/assembly/top.png' border='0' alt='Top level'></a></td>";
		searchFlag=false;
		assemblyTableparent=1;
	}
	str+="<td><label>Enter keyword:</label></td><td><input size='40' type='text' id='searchKeyForAssembly' value=''></td><td><input type='button' value='GO' onclick='vaildateKey2();'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateAssemblyTable=function (xmlDoc,tableName) {
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
		param[5]=content[i].childNodes[5].firstChild.data;
		param[6]=content[i].childNodes[6].firstChild.data;
		param[7]=content[i].childNodes[7].firstChild.data;
		param[8]=content[i].childNodes[8].firstChild.data;
		param[9]=content[i].childNodes[9].firstChild.data;
		param[10]=content[i].childNodes[10].firstChild.data;
		param[11]=content[i].childNodes[10].firstChild.data;
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
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
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
	var cbPrice=document.createElement('input');
	cbPrice.setAttribute('type', 'text');
	cbPrice.setAttribute('size', '10');
	cbPrice.setAttribute('value', param[8]);
	if(isFolder)
		cbPrice.style.display="none";
	cell[4].appendChild(cbPrice);
	var priceSpan=document.createElement('span');
	priceSpan.appendChild(document.createTextNode(param[8]));
	priceSpan.style.display='none';
	cell[4].appendChild(priceSpan);
	if(!isFolder)
		cell[4].appendChild(document.createElement('br'));
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
	rowContents[9]=0;				//PREMIUM
	rowContents[10]=param[6];			//REMARKS
	rowContents[11]=param[7];			//PARENT
	rowContents[12]=cbPrice;			//Custom PRICE
	//rowContents[13]=0;			//Custom PREMIUM
	//rowContents[14]=priceSpan;			//Custom PRICE
	//rowContents[15]=0;		//Custom PREMIUM
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};


/**********************************************************/
/*
 * view Analysis-of-Rate for the chosen Assembly
 */
var myAsmRow=null;
var asmId=0;
var multiplier=1;
var sumTotal="0";
var overheadTotal="0";
var anlyzContainerDiv="blankHidden1";
var anlyzInnerDivPrefix="anlyzInnerDivPrefix";
var anlyzWindowIdPrefix="anlyzWindowIdPrefix";
var INNER_TABLE_NAME_PREFIX="innerTableNamePrefix";
var INNER_NAV_DIV_PREFIX="innerNavDivPrefix";
var importFlag=0;			//importFlag=1: We are in resources section, in Overhead section otherwise
var importWindowId="importWindowId";
var initAnalysisWin=function(context) {
	myAsmRow=null;
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
		myAsmRow=tmp;
	}
	if(myAsmRow!=null)
		openAddAnalysisWin();
};

var openAddAnalysisWin=function() {
	asmId=myAsmRow.myRow.content[6];
	var asmName=myAsmRow.myRow.content[4].data;
	var innerStr="<table width='97%' class='innerContentTable'><tr class='classcb'><td align='left'><b>Toggle: </b><a href='javascript:void(0)' onClick='callShowRateAnlysisAjax()'>Resources</a>/<a href='javascript:void(0)' onClick='callShowOverheadsAjax()'>Overheads</a></td></tr></table>";
	innerStr+="<div id='"+anlyzInnerDivPrefix+"' class='smallText'>Select One of the options above...</div>";
	document.getElementById(anlyzContainerDiv).innerHTML=innerStr;
	var win=internalWindow.open(anlyzWindowIdPrefix, 'div', anlyzContainerDiv, 'Analysis of Rate for: '+asmName, 'width=850px,height=500px,left=5px,top=5px,resize=1,scrolling=1');
	win.onclose=function() {
		if(importWindow!=null)
			importWindow.close();
		return true;
	};
	asmAnalysisWindow=win;
};

var callShowRateAnlysisAjax=function() {
	importFlag=1;
	if(document.getElementById(anlyzInnerDivPrefix)==null) return;
	var myShowRateAnalysisRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20261+"&costBookId="+costBookId+"&asmId="+asmId+"&method="+"getAnalysis";
	myShowRateAnalysisRequest.open("GET",url,true);

	myShowRateAnalysisRequest.onreadystatechange=function()
	{
		if(myShowRateAnalysisRequest.readyState==4) {
			if(myShowRateAnalysisRequest.status==200) {
				renderRateAnlysis(myShowRateAnalysisRequest);
			}
			else {
				alert("Connection Problem:"+myShowRateAnalysisRequest.statusText);
			}
		}
	};

	writeWaitMsg(anlyzInnerDivPrefix,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");
	myShowRateAnalysisRequest.send(null);
};

var renderRateAnlysis=function(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(anlyzInnerDivPrefix,systemMsg);
	if(errorFlag==0) return;
	var asmTags=xmlDoc.getElementsByTagName("assembly");
	//var multiplier=1;
	if(asmTags!=null && asmTags.length>0)
	{
		//asmId=asmTags[0].getAttribute("id");
		multiplier=asmTags[0].getAttribute("multiplier");
		sumTotal=asmTags[0].getAttribute("sumTotal");
		var jobsDiv=document.getElementById(anlyzInnerDivPrefix);
		jobsDiv.setAttribute("ovhRef", "");
		jobsDiv.setAttribute("matRef", asmId);
		var str="<div id='"+INNER_NAV_DIV_PREFIX+"'></div>";
		str+="<table width='97%' class='innerContentTable'><tr class='classcb' id='ANA'><td align='right'>Analysis for <span id='multi'>"+multiplier+"</span> "+myAsmRow.myRow.content[7].data+"  <a href='javascript:void(0);' id='change' onClick='editMultiplier(event,\"change\");'>Change</a> <a href='javascript:void(0);' style='display:none;' id='edit' onclick='editMultiplier(event,\"edit\");'><img src='images/common/tick.gif' border='0'></a> <a href='javascript:void(0);' id='discard' style='display:none;' onclick='editMultiplier(event,\"discard\");'><img src='images/common/cross.gif' border='0'></a></td></tr></table>";
		str+="<table width='97%' class='innerContentTable' id='"+INNER_TABLE_NAME_PREFIX+"'><thead id='ANATHEAD'><tr><td width='16px'>&nbsp;</td><td width='16px'>Sl</td><td>ID</td><td width='60%'>Description</td><td>Volume</td><td>Price</td><td align='right'>Total</td><td width='10px'>D</td></tr></thead><tbody id='ANATBODY'></tbody></table>";
		str+="<table width='97%' class='innerContentTable'><tr class='classcb'><td align='left'><b>Total:</b>&nbsp;<span id='sumTotal'>"+sumTotal+"</span></td></tr></table>";
		jobsDiv.innerHTML=str;
		contextMenu.attachTo('ANA',menu2(asmId));
		contextMenu.attachTo('ANATHEAD',menu2(asmId));
		contextMenu.attachTo('ANATBODY',menu2(asmId));
		updateAnalysisNav(xmlDoc,INNER_NAV_DIV_PREFIX,INNER_TABLE_NAME_PREFIX);
		initiateTableRollover(INNER_TABLE_NAME_PREFIX,'tableRollOverEffect1','tableRowClickEffect1');
		populateAnalysisTable(xmlDoc,INNER_TABLE_NAME_PREFIX);
		//document.getElementById("sumTotal").innerHTML=""+sumTotal+"";
	}
	else
	{
		var errorFlag=systemStatus(null,systemMsg);
		if(errorFlag==0) return;
	}
};

var updateAnalysisNav=function(xmlDoc,divPrefix,tableNamePrefix) {
	var str="<table class='innerNavTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initMaterialWin();'>Add New</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initImportAnalysisWin();'>Import[CostBook]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initAssemblyImportWin();'>Import[Assemblies]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='editCheckedMaterialsBox(\""+tableNamePrefix+"\");'>Edit[D]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteMaterialsChecked(\""+tableNamePrefix+"\");'>Delete[D]</a></td>";
	str+="</tr></table>";
	document.getElementById(divPrefix).innerHTML=str;
};

var populateAnalysisTable=function(xmlDoc,tableNamePrefix){
	var tableName=tableNamePrefix;
	var content=xmlDoc.getElementsByTagName("entry");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data; //ref_id
		param[1]=content[i].childNodes[1].firstChild.data; //asmId
		param[2]=content[i].childNodes[2].firstChild.data; //CostBookId
		param[3]=content[i].childNodes[3].firstChild.data; //description
		param[4]=content[i].childNodes[4].firstChild.data; //Unit
		param[5]=content[i].childNodes[5].firstChild.data; //fraction
		param[6]=content[i].childNodes[6].firstChild.data; //price
		param[7]=content[i].childNodes[7].firstChild.data; //total
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
	cell[0].innerHTML="<img src='images/project/job.gif' border='0'>";

	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	cell[1].appendChild(slNo);

	//Cell2: ID.
	cell[2]=row.insertCell(2);
	var id = document.createTextNode(param[0]);
	cell[2].appendChild(id);

	//Cell3: Description
	cell[3]=row.insertCell(3);
	var description=document.createTextNode(param[3]);
	cell[3].appendChild(description);


	//Cell4: Fraction
	cell[4]=row.insertCell(4);
	cell[4].setAttribute("align","right");
	var fractionTb=getTextBox(10,param[5]);
	fractionTb.style.display='none';
	var fraction=document.createTextNode(param[5]);
	cell[4].appendChild(fractionTb);
	cell[4].appendChild(fraction);

	//Cell5: price
	cell[5]=row.insertCell(5);
	var price=document.createTextNode(param[6]+"/"+param[4]);
	cell[5].appendChild(price);

	//Cell6: Total
	cell[6]=row.insertCell(6);
	cell[6].setAttribute("align","right");
	var total=document.createTextNode(param[7]);
	cell[6].appendChild(total);

	//Cell7: Checkbox
	cell[7]=row.insertCell(7);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[7].appendChild(checkBox);

	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	rowContents[4]=description;
	rowContents[5]=fraction;
	rowContents[6]=fractionTb;
	rowContents[7]=param[6];
	rowContents[8]=total;
	rowContents[9]=param[0];			//ID
	rowContents[10]=param[1];			//ASM_ID
	rowContents[11]=param[2];			//COSTBOOK_ID
	rowContents[12]=id;			//REF_ID

	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

var getTextBox=function(size,value) {
	var tb=document.createElement('input');
	tb.setAttribute('type', 'text');
	tb.setAttribute('size', size);
	tb.setAttribute('value', value);

	return tb;
};

var editMultiplier=function(e,flag) 
{
	//alert(document.getElementById("multi").innerHTML);
	if(flag=='change'){
		//var data=document.getElementById("multi").innerHTML;
		document.getElementById("multi").innerHTML="<input id='editRateMultiplier' type='text' size='5' value='"+multiplier+"'>";
		document.getElementById("change").style.display='none';
		document.getElementById("edit").style.display='';
		document.getElementById("discard").style.display='';
	}
	if(flag=='discard'){
		document.getElementById("multi").innerHTML=""+multiplier+"";
		document.getElementById("change").style.display='';
		document.getElementById("edit").style.display='none';
		document.getElementById("discard").style.display='none';
	}
	if(flag=='edit'){
		callEditMultiplierAjax(document.getElementById('editRateMultiplier').value);
		/*document.getElementById("multi").innerHTML=""+multiplier+"";
		document.getElementById("change").style.display='';
		document.getElementById("edit").style.display='none';
		document.getElementById("discard").style.display='none';*/
	}
};

var callEditMultiplierAjax=function(data)
{
	//var myAssemblyUpdateData="";
	var myMultiplierEditRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20283+"&asmId="+asmId+"&cbId="+costBookId+"&multiplier="+data+"&method="+"updateRateMultiplier";
	//alert(url);
	myMultiplierEditRequest.open("GET",url,true);
	myMultiplierEditRequest.onreadystatechange=function()
	{
		if(myMultiplierEditRequest.readyState==4) {
			if(myMultiplierEditRequest.status==200) {
				var xmlDoc=myMultiplierEditRequest.responseXML;
				var statusFlag=0;
				var systemMsg;
				if(xmlDoc==null) {alert("Data Error");}
				else
				{
					systemMsg=xmlDoc.getElementsByTagName("status");
					statusFlag=systemStatus(null,systemMsg);
				}
				if(statusFlag==1) {
					multiplier=data;
					//document.getElementById("sumTotal").innerHTML=""+systemMsg[0].getAttribute("sumTotal");+"";
					myAsmRow.myRow.content[12].value=""+systemMsg[0].getAttribute("gross")+"";
				}
				else if(statusFlag==2) {
					alert("EDIT: System Error");
					//multiplier=data;
				}
				document.getElementById("multi").innerHTML=""+multiplier+"";
				document.getElementById("change").style.display='';
				document.getElementById("edit").style.display='none';
				document.getElementById("discard").style.display='none';
				//renderAssembly(myMultiplierEditRequest);
			}
			else {
				alert("Connection Problem:"+myMultiplierEditRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();

	myMultiplierEditRequest.send(null);
};

var toggleElementVisibility=function(id)
{
	var element=document.getElementById(id);
	if(document.getElementById("change").style.display=='')
		document.getElementById("change").style.display='none';
	else
		document.getElementById("change").style.display='';
};
/********************************************************/
/*
 * Delete selected resources from the analysis of rate
 */
function callDeleteMatAjax(tbl,obj,rIndex) {
	if(!confirmDelete()) return;
	var myMatDeleteRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var refId="";
	for(var i=0; i<obj.length; i++) {
		if(i==0) {
			refId+=obj[i].myRow.content[9];
		}
		else
			refId+=","+obj[i].myRow.content[9];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20271+"&id="+URLEncode(refId)+"&method="+"deleteSelectedMats";
	myMatDeleteRequest.open("GET",url,true);

	myMatDeleteRequest.onreadystatechange=function()
	{
		if(myMatDeleteRequest.readyState==4) {
			if(myMatDeleteRequest.status==200) {
				var xmlDoc=myMatDeleteRequest.responseXML;
				var statusFlag=0;
				var systemMsg;
				if(xmlDoc==null) {alert("Data Error");}
				else
				{
					systemMsg=xmlDoc.getElementsByTagName("status");
					statusFlag=systemStatus(null,systemMsg);
				}
				if(statusFlag==1) {
					myAsmRow.myRow.content[12].value=""+systemMsg[0].getAttribute("gross")+"";
					document.getElementById("sumTotal").innerHTML=""+systemMsg[0].getAttribute("sumTotal")+"";
					deleteRows(obj);
					reorderRows(tbl, rIndex);
				}
				else if(statusFlag==2) {
					alert("DELETE: System Error");
				}
			}
			else {
				alert("Connection Problem:"+myMatDeleteRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	openSplashScreen();
	myMatDeleteRequest.send(null);
}

/*
 * gets checked rows from table with ID $tblId$
 */

/*
 * deletes checked rows, from the table with ID $tblId$
 */
var deleteMaterialsChecked=function (tblId) {
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
		callDeleteMatAjax(tbl,checkedObjArray,rIndex);
	}
};


/*
 * this will be called from context menu
 */
var deleteContextMaterialsChecked=function () {

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
	callDeleteMatAjax(tbl,checkedObjArray,rIndex);
};

/********************************************************/
/*
 * Edit a fraction
 */

/*
 * This method will be called from context menu
 * It calls editContextMaterialsBox, with setting [checkbox to checked]
 * for the source row, so it opens edit window which have been checked too
 */
var editContextMaterialsBox=function() {
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
	row.myRow.content[0].checked=true;
	editCheckedMaterialsBox(INNER_TABLE_NAME_PREFIX);
};

/*
 * This method will be called from nav bar, it opens edit bar for
 * all selected jobs, no communication with the server is peformed here
 */
var editCheckedMaterialsBox=function(tblIdPrefix) {
	var tbl=document.getElementById(tblIdPrefix);
	for (var i=0; i<tbl.tBodies[0].rows.length; i++)
	{

		if(tbl.tBodies[0].rows[i].myRow.content[0].checked) {
			var row=tbl.tBodies[0].rows[i];
			//Preserve Sl No.
			row.myRow.content[3]=document.createTextNode(row.myRow.content[3].data);
			row.cells[0].innerHTML="";
			row.cells[1].innerHTML="";
			row.cells[0].innerHTML="<a href='javascript:void(0);' onclick='editSelectedMaterial(event,\"edit\");'><img src='images/common/tick.gif' border='0'></a>";
			row.cells[1].innerHTML="<a href='javascript:void(0);' onclick='editSelectedMaterial(event,\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
			var textNodes=Array();

			var displayedText=row.myRow.content[5];
			var sp=document.createElement('span');
			sp.appendChild(document.createTextNode(displayedText.data));
			sp.style.display='none';
			displayedText.parentNode.appendChild(sp);
			displayedText.data='';

			row.myRow.content[6].style.display='inline';

			row.myRow.content[0].checked=false;
			row.myRow.content[0].disabled=true;
		}
	}
};

/*
 * Perform edit command, send request to server and update materials list
 * accordingly
 */
var editSelectedMaterial=function(e,flag) {
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

		//Reset Values inside textBoxe and textNode
		displayedText=row.myRow.content[5];
		editBox=row.myRow.content[6];
		span=displayedText.parentNode.childNodes[2];
		newText=span.firstChild.data;

		displayedText.data=newText;
		editBox.value=newText;
		editBox.style.display='none';
		//Remove inserted span, to reset the configuration
		span.parentNode.removeChild(span);

		row.myRow.content[0].disabled=false;
		row.cells[0].innerHTML="";
		row.cells[0].innerHTML="<img src='images/common/url.gif' border='0'>";
		row.myRow.content[2]=row.cells[0].innerHTML;
		row.cells[1].innerHTML="";
		row.cells[1].appendChild(row.myRow.content[3]);
	}
	else if(flag=="edit")
	{
		var fraction=row.myRow.content[6].value;
		var myEditMatRequest=getHTMLHTTPRequest();
		var myRandom=parseInt(Math.random()*99999999);
		var myMatEditData="id="+row.myRow.content[9];
		myMatEditData+="&fraction="+URLEncode(fraction);
		myMatEditData+="&price="+row.myRow.content[7];
		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20280+"&method="+"EditSelectedFraction";
		myEditMatRequest.open('POST', url, true);
		myEditMatRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		myEditMatRequest.setRequestHeader("Content-length", myEditMatRequest.length);
		myEditMatRequest.onreadystatechange=function()
		{
			if(myEditMatRequest.readyState==4) {
				if(myEditMatRequest.status==200) {
					var xmlDoc=myEditMatRequest.responseXML;
					var statusFlag=0;
					var systemMsg;
					if(xmlDoc==null) {alert("Data Error");}
					else
					{
						systemMsg=xmlDoc.getElementsByTagName("status");
						statusFlag=systemStatus(null,systemMsg);
					}
					if(statusFlag==1) {
						//var newId=xmlDoc.getElementsByTagName("key")[0].getAttribute("value");
						var total=xmlDoc.getElementsByTagName("total")[0].getAttribute("value");

						row.myRow.content[8].data=""+total;


						displayedText=row.myRow.content[5];
						editBox=row.myRow.content[6];
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

						row.myRow.content[0].disabled=false;
						row.cells[0].innerHTML="";
						row.cells[0].innerHTML="<img src='images/common/url.gif' border='0'>";
						row.myRow.content[2]=row.cells[0].innerHTML;
						row.cells[1].innerHTML="";
						row.cells[1].appendChild(row.myRow.content[3]);

						myAsmRow.myRow.content[12].value=""+systemMsg[0].getAttribute("gross")+"";
						document.getElementById("sumTotal").innerHTML=""+systemMsg[0].getAttribute("sumTotal")+"";
					}
					else if(statusFlag==2) {
						alert("EDIT: System Error");
					}
				}
				else {
					alert("Connection Problem:"+myEditMatRequest.statusText);
				}
				closeSplashScreen();
			}
		};
		openSplashScreen();
		myEditMatRequest.send(myMatEditData);
	}
};

/********************************************************/
/*
 * Open a new window for selecting resources and adding them into analysis
 */


//Open Materials Price Tab
var materialManagerContainer="blankHidden2";	//Main div containing the DHTML window
//var ratesOptionsContainer='asmOptions';			//Contains link to assembly/item menu
var MatInnnerContainer="innerMatContainer";		//Main inner window
//var matOptionsWindow=null;
var matOptionsWindowId=importWindowId;

var MAT_INNER_TABLE_NAME="matInnerSample";			//Should be named in HTML
var MAT_INNER_DIV_NAV_NAME="matInnerNavDiv";		//Navigation Bar
//var billTable;
var initMaterialWin=function() {
	var div=document.getElementById(materialManagerContainer);
	div.innerHTML="<div id='"+MatInnnerContainer+"' class='smallText'></div>";
	openMaterialOptionsWindow(asmId);
};

var openMaterialOptionsWindow=function(asmId) {
	var div=document.getElementById(MatInnnerContainer);
	div.setAttribute("asmId", asmId);
	importWindow=internalWindow.open(matOptionsWindowId, 'div', materialManagerContainer, 'Add Materials', 'width=600px,height=400px,left=5px,top=5px,resize=1,scrolling=1');
	callMaterialAjax(1);
};



var materialTableparent=1;	//Up one level
var materialTableTop=1;		//Top Level
var materialTableCurrentParent=1;			//parent of current level
var materialTablecontainer=MatInnnerContainer;	//this DIV will contain our material


//Ajax call to populate material at level $id$


function callMaterialAjax(id) {
	if(document.getElementById(materialTablecontainer)==null) return;
	var myMaterialRequest=getHTMLHTTPRequest();
	materialTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20260+"&parent="+id+"&cbId="+costBookId+"&method="+"getMaterialCost";
	//var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+10004+"&parent="+id+"&method="+"get";

	myMaterialRequest.open("GET",url,true);
	myMaterialRequest.onreadystatechange=function()
	{
		if(myMaterialRequest.readyState==4) {
			if(myMaterialRequest.status==200) {
				renderMaterial(myMaterialRequest);
			}
			else {
				alert("Connection Problem:"+myMaterialRequest.statusText);
			}
		}
	};
	writeWaitMsg(materialTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");
	myMaterialRequest.send(null);
}


function renderMaterial(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(materialTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+MAT_INNER_DIV_NAV_NAME+"'></div>";
	str+="<table id='"+MAT_INNER_TABLE_NAME+"' width='97%' class='innerContentTable'><thead id='MATTThead'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='30%'>Name</td><td width='45%'>Description</td><td>Price</td><td width='16px'>&nbsp;</td></tr></thead>";
	str+="<tbody id='MATTTbody'></tbody></table>";
	document.getElementById(materialTablecontainer).innerHTML=str;
	//Update the material navigation bar
	updateMaterialNav(xmlDoc,MAT_INNER_DIV_NAV_NAME);
	populateMaterialTable(xmlDoc,MAT_INNER_TABLE_NAME);
	addTableRolloverEffect(MAT_INNER_TABLE_NAME,'tableRollOverEffect2','tableRowClickEffect2');
}

//Update navigation bar for Material Table according to current level

var updateMaterialNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='innerNavTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		materialTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callMaterialAjax("+materialTableparent+")'><img src='images/material/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callMaterialAjax("+materialTableTop+")'><img src='images/material/top.png' border='0' alt='Top level'></a></td>";

	}
	else if(searchFlag2==false)
	{
		str+="<td><img src='images/material/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/material/top1.png' alt='Top level'></td>";
		materialTableparent=1;
	}
	else
	{
		str+="<td><img src='images/material/up1.png' alt='Up one level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callMaterialAjax("+materialTableTop+")'><img src='images/material/top.png' border='0' alt='Top level'></a></td>";
		searchFlag2=false;
		materialTableparent=1;
	}
	str+="<td><label>Enter keyword:</label></td><td><input size='40' type='text' id='searchKeyForMaterial' value=''></td><td><input type='button' value='GO' onclick='vaildateKey3();'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};

//Populate table $tableName$ using markup $xmlDoc$

var populateMaterialTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("category");
	var rowToInsertAt;
	var tbl;
	var param;
	for(var i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="category";		//Row type is category
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		addRowToTable3(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	content=xmlDoc.getElementsByTagName("item");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="item";		//Row type is category
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;

		param[6]=content[i].childNodes[5].firstChild.data;
		param[7]=content[i].childNodes[6].firstChild.data;
		param[8]=content[i].childNodes[7].firstChild.data;
		addRowToTable3(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
};

//add a new row at index $num$ using params $param$ into table $tbl$

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
	if(param[0]=="category")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callMaterialAjax("+param[1]+")'><img src='images/material/folder.png' border='0'></a>";
	else
		cell[0].innerHTML="<img src='images/material/file.gif' border='0'>";
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

	//Cell4: Price
	cell[4]=row.insertCell(4);
	var price;
	var unit;
	if(param[0]=="item")
	{
		if(param[8]=="-"){
			price=document.createTextNode(param[5]);  // default price
			cell[4].style.color='#ff0000';
		}else
			price=document.createTextNode(param[8]);  // costbook price
		unit=document.createTextNode(param[4]);
		cell[4].appendChild(price);
		cell[4].appendChild(document.createTextNode("/"));
		cell[4].appendChild(unit);
	}
	else
	{
		price=document.createTextNode("-");
		cell[4].appendChild(price);
	}

	//Cell5: Image
	cell[5] = row.insertCell(5);
	if(param[0]=="item")
		cell[5].innerHTML="<a href='javascript:void(0);' onclick='callAddMaterialAjax(\""+tbl.getAttribute("id")+"\",\""+row.sectionRowIndex+"\")'><img src='images/common/tick.gif' border='0'></a>";
	else
		cell[5].innerHTML="&nbsp;";


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
	if(param[0]=="category")
	{
		rowContents[8]=param[4];	//Remarks
		rowContents[9]=param[5];	//Parent
	}
	else
	{
		rowContents[8]=unit;	//unit
		rowContents[9]=price;	//price
		rowContents[10]=param[7];	//parent
	}
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	//addRowRolloverEffect(row);
};

//add material to analysis

var addMaterialBox=function (tbl,num,param) {
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
	row.cells[0].innerHTML="<a href='javascript:void(0);' onclick='addMaterial(event,\"add\");'><img src='images/common/tick.gif' border='0'></a>";

	//Cell1: Sl No.
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	row.cells[1].innerHTML="<a href='javascript:void(0);' onclick='addMaterial(event,\"discard\");'><img src='images/common/cross.gif' border='0'></a>";

	//Cell2: ID.
	cell[2]=row.insertCell(2);
	var id = document.createTextNode(param[0]);
	cell[2].appendChild(id);

	//Cell3: Description
	cell[3]=row.insertCell(3);
	var description=document.createTextNode(param[3]);
	cell[3].appendChild(description);


	//Cell4: Fraction
	cell[4]=row.insertCell(4);
	cell[4].setAttribute("align","right");
	var fractionTb=getTextBox(10,param[5]);
	fractionTb.style.display='';
	var fraction=document.createTextNode("");
	cell[4].appendChild(fractionTb);
	cell[4].appendChild(fraction);

	//Cell5: price
	cell[5]=row.insertCell(5);
	var price=document.createTextNode(param[6]+"/"+param[4]);
	cell[5].appendChild(price);

	//Cell6: Total
	cell[6]=row.insertCell(6);
	cell[6].setAttribute("align","right");
	var total=document.createTextNode(param[7]);
	cell[6].appendChild(total);

	//Cell7: Checkbox
	cell[7]=row.insertCell(7);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	checkBox.setAttribute('disabled', 'true');
	cell[7].appendChild(checkBox);

	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	rowContents[4]=description;
	rowContents[5]=fraction;
	rowContents[6]=fractionTb;
	rowContents[7]=param[6];
	rowContents[8]=total;
	rowContents[9]=0;					//will contain REF_ID(at the moment contains invalid value)
	rowContents[10]=param[1];			//ASM_ID
	rowContents[11]=param[2];			//COSTBOOK_ID
	rowContents[12]=id;					//REF_ID.at the moment containing ITEM_ID

	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};





var callAddMaterialAjax=function(tableName,rowNum) {
	if(importFlag==2) return; //if we are in overheads window, do nothing
	var myRequest=getHTMLHTTPRequest();
	var myAssemblyTable=document.getElementById(tableName);
	var row=myAssemblyTable.tBodies[0].rows[rowNum];
	var div=myAssemblyTable.parentNode;
	var asmId=div.getAttribute("asmId");
	var param=Array();
	param[0]=""+row.myRow.content[6];						//Item ID
	param[1]=asmId;										//Assembly ID
	param[2]=costBookId;								//costBookId
	param[3]=""+row.myRow.content[5].data;		    	//Item name
	param[4]=""+row.myRow.content[8].data;				//Unit
	param[5]="0";									//Fraction
	param[6]=""+row.myRow.content[9].data;			     //Item Price
	param[7]="0";										//total

	addMaterialBox(document.getElementById(INNER_TABLE_NAME_PREFIX),-1,param);
};


var addMaterial=function(e,flag)
{
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
		deleteRows(discardRowsArray);
		reorderRows(tbl, rowIndex);
	}
	else if(flag=="add")
	{
		var myAddMatRequest=getHTMLHTTPRequest();
		var myRandom=parseInt(Math.random()*99999999);

		var myMatAddData="id="+row.myRow.content[12].data;
		myMatAddData+="&fraction="+URLEncode(row.myRow.content[6].value);
		myMatAddData+="&price="+row.myRow.content[7];
		myMatAddData+="&asmId="+row.myRow.content[10];
		myMatAddData+="&costBookId="+costBookId;
		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20281+"&method="+"addMaterialToAnalysis";
		myAddMatRequest.open('POST', url, true);
		myAddMatRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		myAddMatRequest.setRequestHeader("Content-length", myAddMatRequest.length);
		myAddMatRequest.onreadystatechange=function()
		{
			if(myAddMatRequest.readyState==4) {
				if(myAddMatRequest.status==200) {
					var xmlDoc=myAddMatRequest.responseXML;
					var statusFlag=0;
					var systemMsg;
					if(xmlDoc==null) {alert("Data Error");}
					else
					{
						systemMsg=xmlDoc.getElementsByTagName("status");
						statusFlag=systemStatus(null,systemMsg);
					}
					if(statusFlag==1) {
						var newId=xmlDoc.getElementsByTagName("key")[0].getAttribute("value");
						var total=xmlDoc.getElementsByTagName("key")[0].getAttribute("total");

						row.myRow.content[8].data=""+total;
						row.myRow.content[9]=""+newId;			//Stored ID
						row.myRow.content[12].data=""+newId;	//Displayed ID
						//alert(newId);

						displayedText=row.myRow.content[5];
						editBox=row.myRow.content[6];
						editBox.style.display='none';
						//update
						if(editBox.value=="")
						{
							displayedText.data="-";
							editBox.value="-";
						}
						else
							displayedText.data=editBox.value;
						//span=displayedText.parentNode.childNodes[2];
						//span.parentNode.removeChild(span);

						row.myRow.content[0].disabled=false;
						row.cells[0].innerHTML="";
						row.cells[0].innerHTML="<img src='images/common/url.gif' border='0'>";
						row.myRow.content[2]=row.cells[0].innerHTML;
						row.cells[1].innerHTML="";
						row.cells[1].appendChild(row.myRow.content[3]);
						myAsmRow.myRow.content[12].value=""+systemMsg[0].getAttribute("gross")+"";
						document.getElementById("sumTotal").innerHTML=""+systemMsg[0].getAttribute("sumTotal")+"";
						//reorderRows(tbl, 1);
					}
					else if(statusFlag==2) {
						alert("ADD: System Error");
					}
				}
				else {
					alert("Connection Problem:"+myAddMatRequest.statusText);
				}
				closeSplashScreen();
			}
		};
		openSplashScreen();
		myAddMatRequest.send(myMatAddData);
	}

};


/********************************************************/
/*
 * Import from another costbook(if the analysis of rate is available for the selected assembly)
 */

//Open Import Tab
var cbManagerContainer="blankHidden3";	//Main div containing the DHTML window
var cbInnnerContainer="innerCbContainer";		//Main inner window
//var cbOptionsWindow=null;
var cbOptionsWindowId=importWindowId;

var CB_INNER_TABLE_NAME="cbInnerSample";			//Should be named in HTML
var CB_INNER_DIV_NAV_NAME="cbInnerNavDiv";		//Navigation Bar

var initImportAnalysisWin=function() {
	var div=document.getElementById(cbManagerContainer);
	div.innerHTML="<div id='"+cbInnnerContainer+"' class='smallText'></div>";
	openImportOptionsWindow();
};

var openImportOptionsWindow=function() {
	var div=document.getElementById(cbInnnerContainer);
	//div.setAttribute("asmId", asmId);
	importWindow=internalWindow.open(cbOptionsWindowId, 'div', cbManagerContainer, 'Import Analysis', 'width=600px,height=400px,left=5px,top=5px,resize=1,scrolling=1');
	callImportCBAjax(1);
};

var cbiTableparent=1;	//Up one level
var cbiTableTop=1;		//Top Level
var cbiTableCurrentParent=1;			//parent of current level
var cbiTablecontainer=cbInnnerContainer;	//this DIV will contain our material


//Ajax call to populate costbooks at level $id$


function callImportCBAjax(id) {
	if(document.getElementById(cbiTablecontainer)==null) return;
	var myRateAnalysisRequest=getHTMLHTTPRequest();
	cbiTableCurrentParent=id;
	var div=document.getElementById(cbiTablecontainer);
	//var asmId=div.getAttribute("asmId");
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20211+"&parent="+id+"&asmId="+asmId+"&flag="+importFlag+"&method=ImportAnalysis";

	myRateAnalysisRequest.open("GET",url,true);
	myRateAnalysisRequest.onreadystatechange=function()
	{
		if(myRateAnalysisRequest.readyState==4) {
			if(myRateAnalysisRequest.status==200) {
				renderCostBooks(myRateAnalysisRequest);
			}
			else {
				alert("Connection Problem:"+myRateAnalysisRequest.statusText);
			}
		}
	};
	writeWaitMsg(cbiTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");
	myRateAnalysisRequest.send(null);
}

function renderCostBooks(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(cbiTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="<div id='"+CB_INNER_DIV_NAV_NAME+"'></div>";
	str+="<table id='"+CB_INNER_TABLE_NAME+"' width='100%' class='innerContentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='100%'>Description</td><td>Analysis</td></tr></thead>";
	str+="<tbody></tbody></table>";
	document.getElementById(cbiTablecontainer).innerHTML=str;
	//Update the material navigation bar
	updateCostbookNav(xmlDoc,CB_INNER_DIV_NAV_NAME);
	populateCostbookTable(xmlDoc,CB_INNER_TABLE_NAME);
	addTableRolloverEffect(CB_INNER_TABLE_NAME,'tableRollOverEffect2','tableRowClickEffect2');
}

var updateCostbookNav=function (xmlDoc,element) {
	var parentId=xmlDoc.getElementsByTagName("levelParent");
	var str="<table class='innerNavTable'><tr>";
	if(parentId!=null && parentId.length>=1) {
		cbiTableparent=parentId[0].getAttribute("id");
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callImportCBAjax("+cbiTableparent+")'><img src='images/material/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callImportCBAjax("+cbiTableTop+")'><img src='images/material/top.png' border='0' alt='Top level'></a></td>";

	}
	else if(searchFlag1==false)
	{
		str+="<td><img src='images/material/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/material/top1.png' alt='Top level'></td>";
		cbiTableparent=1;
	}
	else
	{
		str+="<td><img src='images/material/up1.png' alt='Up one level'></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callImportCBAjax("+cbiTableTop+")'><img src='images/material/top.png' border='0' alt='Top level'></a></td>";
		searchFlag1=false;
		cbiTableparent=1;
	}
	str+="<td><label>Enter keyword:</label></td><td><input size='40' type='text' id='searchKeyForCB' value=''></td><td><input type='button' value='GO' onclick='vaildateKey1();'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};
var populateCostbookTable=function (xmlDoc,tableName) {
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
		param[6]='0';
		addRowToTable1(tbl,rowToInsertAt,param);
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
		param[6]=content[i].childNodes[5].firstChild.data;
		addRowToTable1(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
};
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
	if(param[0]=="cbCat")
		cell[0].innerHTML="<a href='javascript:void(0);' onclick='callImportCBAjax("+param[1]+")'><img src='images/costbook/folder.gif' border='0'></a>";
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


	//cell4:Analysis
	cell[4] = row.insertCell(4);
	var analysis=document.createTextNode("");
	if(param[0]=="cb")
		if(param[1]==costBookId)
			analysis=document.createTextNode("Current");
		else
			if(param[6]=='1')
			{
				//analysis=document.createTextNode("Avalable");
				if(importFlag==1 || importFlag==2)
					cell[4].innerHTML="<a href='javascript:void(0);' onclick='importFromCostBook(\""+tbl.getAttribute("id")+"\",\""+row.sectionRowIndex+"\")'><img src='images/common/tick.gif' border='0'></a>";
				else
					cell[4].innerHTML="ERROR";
			}
			else
				analysis=document.createTextNode("NotAvailable");
	cell[4].appendChild(analysis);

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

/********************************************************/
//Important function, works well if a person switches between Resources view and Overheads view
var importFromCostBook=function(tableName,rowNum) {
	if(importFlag==1)
		importMaterialsAjax(tableName,rowNum);
	else if(importFlag==2)
		importOverheadsAjax(tableName,rowNum);
	else return;
};


var importMaterialsAjax=function(tableName,rowNum)
{
	var myRequest=getHTMLHTTPRequest();
	var myAssemblyTable=document.getElementById(tableName);
	var row=myAssemblyTable.tBodies[0].rows[rowNum];
	var costbookid=row.myRow.content[6];
	var div=myAssemblyTable.parentNode;
	//var asmId=div.getAttribute("asmId");
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20282+"&fromCostBookId="+costbookid+"&toCostBookId="+costBookId+"&asmId="+asmId+"&flag=1"+"&method="+"importMaterialToAnalysis";

	myRequest.open("GET",url,true);
	myRequest.onreadystatechange=function()
	{
		importMaterialToAnalysisAction(myRequest,INNER_TABLE_NAME_PREFIX);
	};
	openSplashScreen();
	myRequest.send(null);
};

var importMaterialToAnalysisAction=function(myRequest,tableName) {
	if(myRequest.readyState==4) {
		if(myRequest.status==200) {
			var xmlDoc=myRequest.responseXML;
			if(xmlDoc==null) 
			{alert("Data Error");}
			else
			{
				//If there was a system error close the splash screen
				//and return
				systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
				if(statusFlag==0) {closeSplashScreen();return;}

				var content=xmlDoc.getElementsByTagName("entry");
				var tbl=document.getElementById(tableName);
				if(content.length>0)
					deleteExistingRowsFromTable(tbl);

				for(var i=0;i<content.length;i++)
				{
					var rowToInsertAt = tbl.tBodies[0].rows.length;
					var param=Array();
					param[0]=content[i].childNodes[0].firstChild.data; //ref_id
					param[1]=content[i].childNodes[1].firstChild.data; //asmId
					param[2]=content[i].childNodes[2].firstChild.data; //CostBookId
					param[3]=content[i].childNodes[3].firstChild.data; //description
					param[4]=content[i].childNodes[4].firstChild.data; //description
					param[5]=content[i].childNodes[5].firstChild.data; //fraction
					param[6]=content[i].childNodes[6].firstChild.data; //price
					param[7]=content[i].childNodes[7].firstChild.data; //total
					addRowToTable4(tbl,rowToInsertAt,param);
				}

				var asmTag=xmlDoc.getElementsByTagName("assembly");
				if(asmTag!=null && asmTag.length>0)
				{
					myAsmRow.myRow.content[12].value=""+asmTag[0].getAttribute("gross")+"";
					document.getElementById("sumTotal").innerHTML=""+asmTag[0].getAttribute("sumTotal")+"";
					document.getElementById("multi").innerHTML=""+asmTag[0].getAttribute("multiplier")+"";
					multiplier=parseInt(asmTag[0].getAttribute("multiplier"));
				}
			}
		}
		else {
			alert("Connection Problem:"+myRequest.statusText);
		}
		closeSplashScreen();
	}
};

var deleteExistingRowsFromTable=function (tbl) {
	var delRowObjs=new Array();
	for (var i=0; i<tbl.tBodies[0].rows.length; i++)
	{
		delRowObjs[i] = tbl.tBodies[0].rows[i];
	}
	for (var j=0; j<delRowObjs.length; j++) {
		var rIndex = delRowObjs[j].sectionRowIndex;
		delRowObjs[j].parentNode.deleteRow(rIndex);
	}
};

/**************************MATERIAL COSTBOOK******************************/
/*
 * List of resources used in costbook
 * We can modify the prices of these resources here
 */

function openMaterialCostTable() {
	if(document.getElementById(analysisTableContainer)==null) return;
	if(asmAnalysisWindow!=null) asmAnalysisWindow.close();
	var myMaterialRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20250+"&cbId="+costBookId+"&method="+"getMaterialUsed";

	myMaterialRequest.open("GET",url,true);
	myMaterialRequest.onreadystatechange=function()
	{
		if(myMaterialRequest.readyState==4) {
			if(myMaterialRequest.status==200) {
				renderUsedMaterial(myMaterialRequest);
			}
			else {
				alert("Connection Problem:"+myMaterialRequest.statusText);
			}
		}
	};
	writeWaitMsg(analysisTableContainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myMaterialRequest.send(null);
}


function renderUsedMaterial(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(analysisTableContainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	str+="Filter: <input name='filter' onKeyUp='filter(this, \""+"usedMaterial"+"\")' type='text'>";
	str+="<table id='usedMaterial' width='97%' class='contentTable'><thead id='MATTThead'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='55%'>Description</td><td>Unit</td><td>Price</td><td width='16px'>&nbsp;</td><td width='16px'>&nbsp;</td></tr></thead>";
	str+="<tbody id='MATTTbody'></tbody></table>";
	document.getElementById(analysisTableContainer).innerHTML=str;
	populateUsedMaterialTable(xmlDoc,'usedMaterial');
	addTableRolloverEffect('usedMaterial','tableRollOverEffect1','tableRowClickEffect1');
}

/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateUsedMaterialTable=function (xmlDoc,tableName) {
	var rowToInsertAt;
	var tbl;
	var param;
	var content=xmlDoc.getElementsByTagName("item");
	/*if(content.length==0)
	{
		tbl=document.getElementById(tableName);
		var row=tbl.tBodies[0].insertRow(-1);
		var cell=Array();
		cell[0] = row.insertCell(0);
		//cell[0].colSpan(8);
		cell[0].appendChild(document.createTextNode("No Items Added for this CostBook."));

	}*/
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]="item";		//Row type is category
		param[1]=content[i].childNodes[0].firstChild.data;
		param[2]=content[i].childNodes[1].firstChild.data;
		param[3]=content[i].childNodes[2].firstChild.data;
		param[4]=content[i].childNodes[3].firstChild.data;
		param[5]=content[i].childNodes[4].firstChild.data;
		param[6]=content[i].childNodes[5].firstChild.data;
		addRowToTable5(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
};

/**********************************************************/
/*
 * add a new row at index $num$ using params $param$ into table $tbl$
 */
var addRowToTable5=function (tbl,num,param) {
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
	cell[0].innerHTML="<img src='images/material/file.gif' border='0'>";

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

	//Cell4: Unit
	cell[4]=row.insertCell(4);
	var unit=document.createTextNode(param[4]);
	cell[4].appendChild(unit);

	//Cell5: Price
	cell[5]=row.insertCell(5);
	var cbPrice;
	var span;
	cbPrice=document.createElement('input');
	cbPrice.setAttribute('type', 'text');
	cbPrice.setAttribute('size', '10');
	cbPrice.setAttribute('value', param[5]);
	cell[5].appendChild(cbPrice);
	span=document.createElement('span');
	span.style.display='none';
	span.appendChild(document.createTextNode(param[5]));
	cell[5].appendChild(span);


	//Cell6: Image
	cell[6] = row.insertCell(6);
	cell[6].innerHTML="<a href='javascript:void(0);' onclick='callUpdateMaterialCostAjax(\""+row.sectionRowIndex+"\",\"update\")'><img src='images/common/tick.gif' border='0'></a>";

	//Cel7: Image
	cell[7] = row.insertCell(7);
	cell[7].innerHTML="<a href='javascript:void(0);' onclick='callUpdateMaterialCostAjax(\""+row.sectionRowIndex+"\",\"discard\")'><img src='images/common/cross.gif' border='0'></a>";

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
	rowContents[8]=unit;	//unit
	rowContents[9]=cbPrice;	//CostBook PRICE
	rowContents[10]=span;	//CostBook PRICE
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

/**********************************************************/

var cbUpdateFlag;
var callUpdateMaterialCostAjax=function(row,flag) {
	var myUpdateMaterialCostRequest=getHTMLHTTPRequest();
	var cbRowtoEdit1;
	var tbl=document.getElementById('usedMaterial');
	cbRowtoEdit1=tbl.tBodies[0].rows[row];
	if(flag=='discard') {
		cbRowtoEdit1.myRow.content[9].value=cbRowtoEdit1.myRow.content[10].firstChild.data;
		return;
	}
	var myRandom=parseInt(Math.random()*99999999);
	var url="";
	var id=cbRowtoEdit1.myRow.content[6];
	var cbId=costBookId;
	var price=cbRowtoEdit1.myRow.content[9].value;
	url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20270+"&id="+id+"&cbId="+cbId+"&price="+price+"&method="+"updateMaterialCB"+"&flag="+flag;

	myUpdateMaterialCostRequest.open("GET",url,true);
	myUpdateMaterialCostRequest.onreadystatechange=function()
	{
		updateMaterialCostAction(myUpdateMaterialCostRequest,cbRowtoEdit1);
	};
	openSplashScreen();
	myUpdateMaterialCostRequest.send(null);
};

var updateMaterialCostAction=function(request,row) {
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
				var refreshValue=xmlDoc.getElementsByTagName("refreshValue");
				if(refreshValue!=null && refreshValue.length>0)
				{
					row.myRow.content[9].value=refreshValue[0].getAttribute("cbPrice");
					row.myRow.content[10].firstChild.data=row.myRow.content[9].value;
				}
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

/**************** Search Assembly **********************************/
function vaildateKey2()
{
	key=document.getElementById('searchKeyForAssembly').value;
	if(key.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchAssemblyAjax();
		//alert(key);
	}
}

function callSearchAssemblyAjax() {
	if(document.getElementById(analysisTableContainer)==null) return;
	var myAssemblyRequest=getHTMLHTTPRequest();
	assemblyTableCurrentParent=0;	//We are in search window
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	//var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+100200+"&parent="+id+"&method="+"getCostBook";
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20250+"&key="+searchString+"&cbId="+costBookId+"&method="+"getAssemblyCost";
	myAssemblyRequest.open("GET",url,true);
	myAssemblyRequest.onreadystatechange=function()
	{
		if(myAssemblyRequest.readyState==4) {
			if(myAssemblyRequest.status==200) {
				searchFlag=true;
				renderAssembly(myAssemblyRequest);
			}
			else {
				alert("Connection Problem:"+myAssemblyRequest.statusText);
			}
		}
	};
	writeWaitMsg(analysisTableContainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myAssemblyRequest.send(null);
}

/**************** Search Costbook **********************************/
function vaildateKey1()
{
	key1=document.getElementById('searchKeyForCB').value;
	if(key1.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchCBAjax();
		//alert(key);
	}
}

function callSearchCBAjax() {
	if(document.getElementById(cbiTablecontainer)==null) return;
	var myCbCatRequest=getHTMLHTTPRequest();
	cbiTableCurrentParent=0;	//We are in search window
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key1);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20211+"&key="+searchString+"&asmId="+asmId+"&flag="+importFlag+"&method=ImportAnalysis";
	//alert(url);
	myCbCatRequest.open("GET",url,true);
	myCbCatRequest.onreadystatechange=function()
	{
		if(myCbCatRequest.readyState==4) {
			if(myCbCatRequest.status==200) {
				searchFlag1=true;
				//alert("DONE");
				renderCostBooks(myCbCatRequest);
			}
			else {
				alert("Connection Problem:"+myCbCatRequest.statusText);
			}
		}
	};
	writeWaitMsg(cbiTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myCbCatRequest.send(null);
}

/**************** Search Material **********************************/
function vaildateKey3()
{
	key=document.getElementById('searchKeyForMaterial').value;
	if(key.length<3){
		alert("Enter Minimum 3 Character");
		return;
	}else{
		callSearchMaterialAjax();
		//alert(key);
	}
}

function callSearchMaterialAjax() {
	if(document.getElementById(materialTablecontainer)==null) return;
	var myMaterialRequest=getHTMLHTTPRequest();
	//cbCatTableCurrentParent=id;
	var myRandom=parseInt(Math.random()*99999999);
	var searchString=URLEncode(key);
	//var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+100200+"&parent="+id+"&method="+"getCostBook";
	//var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20250+"&key="+searchString+"&cbId="+costBookId+"&method="+"getAssemblyCost";
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20260+"&key="+searchString+"&cbId="+costBookId+"&method="+"getMaterialCost";
	myMaterialRequest.open("GET",url,true);
	myMaterialRequest.onreadystatechange=function()
	{
		if(myMaterialRequest.readyState==4) {
			if(myMaterialRequest.status==200) {
				searchFlag2=true;
				renderMaterial(myMaterialRequest);
			}
			else {
				alert("Connection Problem:"+myMaterialRequest.statusText);
			}
		}
	};
	writeWaitMsg(materialTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");

	myMaterialRequest.send(null);
}



/**********************************************************/
/*
 * Creates basic facilities for Editing Analysis of Rate(OVERHEADS Only)
 * Associated with a particular Costbook
 */
/**********************************************************/
var callShowOverheadsAjax=function() {
	importFlag=2;
	if(document.getElementById(anlyzInnerDivPrefix)==null) return;
	var myShowOverheadsRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20284+"&costBookId="+costBookId+"&asmId="+asmId+"&method="+"getOverheads";
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
	writeWaitMsg(anlyzInnerDivPrefix,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");
	myShowOverheadsRequest.send(null);
};

var renderOverheads=function(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(anlyzInnerDivPrefix,systemMsg);
	if(errorFlag==0) return;
	var asmTags=xmlDoc.getElementsByTagName("assembly");
	//var multiplier=1;
	if(asmTags!=null && asmTags.length>0)
	{
		//asmId=asmTags[0].getAttribute("id");
		multiplier=asmTags[0].getAttribute("multiplier");
		overheadTotal=asmTags[0].getAttribute("overheadTotal");
		var jobsDiv=document.getElementById(anlyzInnerDivPrefix);
		jobsDiv.setAttribute("matRef", "");
		jobsDiv.setAttribute("ovhRef", asmId);
		var str="<div id='"+INNER_NAV_DIV_PREFIX+"'></div>";
		str+="<table width='97%' class='innerContentTable'><tr class='classcb' id='OVH'><td align='right'>Analysis for <span id='multi'>"+multiplier+"</span> "+myAsmRow.myRow.content[7].data+"  <a href='javascript:void(0);' id='change' onClick='editMultiplier(event,\"change\");'>Change</a> <a href='javascript:void(0);' style='display:none;' id='edit' onclick='editMultiplier(event,\"edit\");'><img src='images/common/tick.gif' border='0'></a> <a href='javascript:void(0);' id='discard' style='display:none;' onclick='editMultiplier(event,\"discard\");'><img src='images/common/cross.gif' border='0'></a></td></tr></table>";
		str+="<table width='97%' class='innerContentTable' id='"+INNER_TABLE_NAME_PREFIX+"'><thead id='OVHTHEAD'><tr><td width='16px'>&nbsp;</td><td width='16px'>Sl</td><td>ID</td><td width='60%'>Description</td><td>Amount</td><td>Total</td><td width='10px'>D</td></tr></thead><tbody id='OVHTBODY'></tbody></table>";
		str+="<table width='97%' class='innerContentTable'><tr class='classcb'><td align='left'><b>Total:</b>&nbsp;<span id='overheadTotal'>"+overheadTotal+"</span></td></tr></table>";
		jobsDiv.innerHTML=str;
		contextMenu.attachTo('OVH',menu2(0));
		contextMenu.attachTo('OVHTHEAD',menu2(0));
		contextMenu.attachTo('OVHTBODY',menu2(0));
		updateOverheadsNav(xmlDoc,INNER_NAV_DIV_PREFIX,INNER_TABLE_NAME_PREFIX);
		initiateTableRollover(INNER_TABLE_NAME_PREFIX,'tableRollOverEffect1','tableRowClickEffect1');
		populateOverheadTable(xmlDoc,INNER_TABLE_NAME_PREFIX,asmId);
	}
	else
	{
		var errorFlag=systemStatus(null,systemMsg);
		if(errorFlag==0) return;
	}

};

var updateOverheadsNav=function(xmlDoc,divPrefix,tableNamePrefix) {
	var str="<table class='innerNavTable'><tr>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='addNewOverheadBox(\""+tableNamePrefix+"\");'>Add New</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initImportAnalysisWin();'>Import[CostBook]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='initAssemblyImportWin();'>Import[Assemblies]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='editCheckedOverheadsBox(\""+tableNamePrefix+"\");'>Edit[D]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='deleteOverheadsChecked(\""+tableNamePrefix+"\");'>Delete[D]</a></td>";
	str+="</tr></table>";
	document.getElementById(divPrefix).innerHTML=str;
};

var populateOverheadTable=function(xmlDoc,tableNamePrefix){
	var tableName=tableNamePrefix;
	var content=xmlDoc.getElementsByTagName("entry");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data; // overhead id
		param[1]=content[i].childNodes[1].firstChild.data; //overhead name
		param[2]=content[i].childNodes[2].firstChild.data; // overhead description
		param[3]=content[i].childNodes[3].firstChild.data;  // amount
		param[4]=content[i].childNodes[4].firstChild.data;  // total
		addRowToTable6(tbl,rowToInsertAt,param);
	}
};

/*
 * add a new row at index $num$ using params $param$ into table $tbl$
 */
var addRowToTable6=function (tbl,num,param) {
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

	//Cell2: ID
	cell[2]=row.insertCell(2);
	var id = document.createTextNode(param[0]);
	cell[2].appendChild(id);

	//Cell3: Description
	cell[3]=row.insertCell(3);
	var descriptionTb=getTextBox(20,param[2]);
	descriptionTb.style.display='none';
	var description=document.createTextNode(param[2]);
	cell[3].appendChild(descriptionTb);
	cell[3].appendChild(description);

	//Cell4: Amount
	cell[4]=row.insertCell(4);
	var amountTb;
	amountTb=getTextBox(10,param[3]);
	amountTb.style.display='none';
	var amount;
	amount=document.createTextNode(param[3]);
	cell[4].appendChild(amountTb);
	cell[4].appendChild(amount);

	//Cell5: Total
	cell[5]=row.insertCell(5);
	var total = document.createTextNode(param[4]);
	cell[5].appendChild(total);


	//Cell6: Checkbox
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

	rowContents[6]=amount;
	rowContents[7]=amountTb;

	rowContents[8]=param[0];		//ID

	rowContents[9]=total;			//total
	rowContents[10]=id;				//displayed ID

	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
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
			id+=obj[i].myRow.content[8];
		else
			id+=","+obj[i].myRow.content[8];
	}
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20285+"&id="+URLEncode(id)+"&method=deleteOverhead";
	//alert(url);
	myOverheadDeleteRequest.open("GET",url,true);

	myOverheadDeleteRequest.onreadystatechange=function()
	{
		if(myOverheadDeleteRequest.readyState==4) {
			if(myOverheadDeleteRequest.status==200) {
				var xmlDoc=myOverheadDeleteRequest.responseXML;
				var statusFlag=0;
				var systemMsg;
				if(xmlDoc==null) {alert("Data Error");}
				else
				{
					systemMsg=xmlDoc.getElementsByTagName("status");
					statusFlag=systemStatus(null,systemMsg);
				}
				if(statusFlag==1) {
					myAsmRow.myRow.content[12].value=""+systemMsg[0].getAttribute("gross")+"";
					document.getElementById("overheadTotal").innerHTML=""+systemMsg[0].getAttribute("overheadTotal")+"";
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
	//alert(billId);
	//row.myRow.content[0].checked=true;
	addNewOverheadBox(INNER_TABLE_NAME_PREFIX);
};

/*
 * This method will be called from Nav bar, inserts an ADD box
 * at the end of the Jobs list
 */
var addNewOverheadBox=function(tblIdprefix) {
	var tbl=document.getElementById(tblIdprefix);
	var nextRow = tbl.tBodies[0].rows.length;
	var num = nextRow;
	var iteration = num + ROW_BASE;

	//Add a new row
	var row=tbl.tBodies[0].insertRow(num);
	var cell=Array();
	//Cell0: Image(OK)
	cell[0] = row.insertCell(0);
	//cell[0].innerHTML="<img src='images/common/url.gif' border='0'>";
	cell[0].innerHTML="<a href='javascript:void(0);' onclick='addNewOverhead(event,\"add\");'><img src='images/common/tick.gif' border='0'></a>";
	//alert(cell[0].childNodes[0].childNodes[0].tagName);

	//Cell1: Image(DISCARD)
	cell[1]=row.insertCell(1);
	var slNo = document.createTextNode(iteration);
	//slNo.style.display='none';
	cell[1].innerHTML="<a href='javascript:void(0);' onclick='addNewOverhead(event,\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
	//cell[1].appendChild(slNo);

	//Cell2: ID
	cell[2]=row.insertCell(2);
	var id = document.createTextNode("-");
	cell[2].appendChild(id);

	//Cell2: Description
	cell[3]=row.insertCell(3);
	var descriptionTb=getTextBox(20,"-");
	var description=document.createTextNode("");
	cell[3].appendChild(descriptionTb);
	cell[3].appendChild(description);

	//Cell4: Amount
	cell[4]=row.insertCell(4);
	var amountTb=getTextBox(10,"-");
	//amountTb.style.display='none';
	var amount=document.createTextNode("");
	cell[4].appendChild(amountTb);
	cell[4].appendChild(amount);

	//Cell5: total
	cell[5]=row.insertCell(5);
	var total =document.createTextNode("");
	cell[5].appendChild(total);

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

	rowContents[6]=amount;
	rowContents[7]=amountTb;

	rowContents[8]=0;				//ID

	rowContents[9]=total;			//total
	rowContents[10]=id;				//DISPLAYED ID

	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
	addRowRolloverEffect(row);
};

/*
 * Adds a new overhead to the list, sends data to the server and
 * updates the list accordingly
 */
var addNewOverhead=function(e,flag) {
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
		var name=URLEncode("-");
		var description=URLEncode(row.myRow.content[5].value);
		var amount=URLEncode(row.myRow.content[7].value);
		var myJobAddData="asmId="+asmId;
		myJobAddData+="&cbId="+costBookId;
		myJobAddData+="&name="+name;
		myJobAddData+="&description="+description;
		myJobAddData+="&amount="+amount;
		//myJobAddData=myJobAddData.replace(/\+/g,'%2B');
		//myJobAddData=myJobAddData.replace(/\+/g,'%2B');

		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20286+"&method=addOverhead";
		myAddJobRequest.open('POST', url, true);
		myAddJobRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		myAddJobRequest.setRequestHeader("Content-length", myAddJobRequest.length);
		myAddJobRequest.onreadystatechange=function()
		{
			if(myAddJobRequest.readyState==4) {
				if(myAddJobRequest.status==200) {
					var xmlDoc=myAddJobRequest.responseXML;
					var statusFlag=0;
					var systemMsg;
					if(xmlDoc==null) {alert("Data Error");}
					else
					{
						systemMsg=xmlDoc.getElementsByTagName("status");
						statusFlag=systemStatus(null,systemMsg);
					}
					if(statusFlag==1) {
						var newId=xmlDoc.getElementsByTagName("key")[0].getAttribute("value");
						var total=xmlDoc.getElementsByTagName("key")[0].getAttribute("total");
						row.myRow.content[4].data=row.myRow.content[5].value;
						row.myRow.content[6].data=row.myRow.content[7].value;
						row.myRow.content[8]=""+newId;
						row.myRow.content[9].data=""+total;
						row.myRow.content[10].data=""+newId;
						for(var i=5;i<=7;i+=2)
						{
							row.myRow.content[i].style.display='none';
						}
						row.cells[0].innerHTML="";
						row.cells[0].innerHTML="<img src='images/common/url.gif' border='0'>";
						row.myRow.content[2]=row.cells[0].innerHTML;
						row.cells[1].innerHTML="";
						row.cells[1].appendChild(row.myRow.content[3]);
						row.myRow.content[0].disabled=false;

						myAsmRow.myRow.content[12].value=""+systemMsg[0].getAttribute("gross")+"";
						document.getElementById("overheadTotal").innerHTML=""+systemMsg[0].getAttribute("overheadTotal")+"";
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
	editCheckedOverheadsBox(INNER_TABLE_NAME_PREFIX);
};

/*
 * This method will be called from nav bar, it opens edit bar for
 * all selected jobs, no communication with the server is peformed here
 */
var editCheckedOverheadsBox=function(tblIdPrefix) {
	var tbl=document.getElementById(tblIdPrefix);
	for (var i=0; i<tbl.tBodies[0].rows.length; i++)
	{

		if(tbl.tBodies[0].rows[i].myRow.content[0].checked) {
			var row=tbl.tBodies[0].rows[i];
			//Preserve Sl No.
			row.myRow.content[3]=document.createTextNode(row.myRow.content[3].data);
			row.cells[0].innerHTML="";
			row.cells[1].innerHTML="";
			row.cells[0].innerHTML="<a href='javascript:void(0);' onclick='editSelectedOverhead(event,\"edit\");'><img src='images/common/tick.gif' border='0'></a>";
			row.cells[1].innerHTML="<a href='javascript:void(0);' onclick='editSelectedOverhead(event,\"discard\");'><img src='images/common/cross.gif' border='0'></a>";
			var textNodes=Array();
			for(var j=4;j<=6;j+=2)
			{
				var displayedText=row.myRow.content[j];
				var sp=document.createElement('span');
				sp.appendChild(document.createTextNode(displayedText.data));
				sp.style.display='none';
				displayedText.parentNode.appendChild(sp);
				displayedText.data='';
			}
			for(var k=5;k<=7;k+=2)
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
 * Perform edit command, send request to server and update overhead list
 * accordingly
 */
var editSelectedOverhead=function(e,flag) {
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
		for(var w=4;w<=6;w+=2)
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
		var name=URLEncode("-");
		var description=URLEncode(row.myRow.content[5].value);
		var amount=URLEncode(row.myRow.content[7].value);
		var myJobEditData="id="+row.myRow.content[8];
		myJobEditData+="&name="+name;
		myJobEditData+="&description="+description;
		myJobEditData+="&amount="+amount;
		var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20287+"&method=updateOverhead";
		myEditJobRequest.open('POST', url, true);
		myEditJobRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		myEditJobRequest.setRequestHeader("Content-length", myEditJobRequest.length);
		myEditJobRequest.onreadystatechange=function()
		{
			if(myEditJobRequest.readyState==4) {
				if(myEditJobRequest.status==200) {
					var xmlDoc=myEditJobRequest.responseXML;
					var statusFlag=0;
					var systemMsg;
					if(xmlDoc==null) {alert("Data Error");}
					else
					{
						systemMsg=xmlDoc.getElementsByTagName("status");
						statusFlag=systemStatus(null,systemMsg);
					}
					if(statusFlag==1) {
						var total=xmlDoc.getElementsByTagName("total")[0].getAttribute("value");
						for(w=4;w<=6;w+=2)
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
							displayedText.data=editBox.value;
							span=displayedText.parentNode.childNodes[2];
							span.parentNode.removeChild(span);
						}
						row.myRow.content[9].data=""+total;
						row.myRow.content[0].disabled=false;
						row.cells[0].innerHTML="";
						row.cells[0].innerHTML="<img src='images/common/url.gif' border='0'>";
						row.myRow.content[2]=row.cells[0].innerHTML;
						row.cells[1].innerHTML="";
						row.cells[1].appendChild(row.myRow.content[3]);
						myAsmRow.myRow.content[12].value=""+systemMsg[0].getAttribute("gross")+"";
						document.getElementById("overheadTotal").innerHTML=""+systemMsg[0].getAttribute("overheadTotal")+"";
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

/********************************************************/

var importOverheadsAjax=function(tableName,rowNum)
{
	var myRequest=getHTMLHTTPRequest();
	var myAssemblyTable=document.getElementById(tableName);
	var row=myAssemblyTable.tBodies[0].rows[rowNum];
	var costbookid=row.myRow.content[6];
	var div=myAssemblyTable.parentNode;
	//var asmId=div.getAttribute("asmId");
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20282+"&fromCostBookId="+costbookid+"&toCostBookId="+costBookId+"&asmId="+asmId+"&flag=2"+"&method="+"importOverheadsToAnalysis";

	myRequest.open("GET",url,true);
	myRequest.onreadystatechange=function()
	{
		importOverheadsToAnalysisAction(myRequest,INNER_TABLE_NAME_PREFIX);
	};
	openSplashScreen();
	myRequest.send(null);
};

var importOverheadsToAnalysisAction=function(myRequest,tableName) {
	if(myRequest.readyState==4) {
		if(myRequest.status==200) {
			var xmlDoc=myRequest.responseXML;
			if(xmlDoc==null) 
			{alert("Data Error");}
			else
			{
				//If there was a system error
				//Show error msg, close splash screen and return
				systemMsg=xmlDoc.getElementsByTagName("status");
				statusFlag=systemStatus(null,systemMsg);
				if(statusFlag==0) {closeSplashScreen();return;}

				var content=xmlDoc.getElementsByTagName("entry");
				var tbl=document.getElementById(tableName);
				if(content.length>0)
					deleteExistingRowsFromTable(tbl);
				//alert(content.length);
				for(var i=0;i<content.length;i++)
				{
					var rowToInsertAt = tbl.tBodies[0].rows.length;
					var param=Array();
					param[0]=content[i].childNodes[0].firstChild.data; // overhead id
					param[1]=content[i].childNodes[1].firstChild.data; //overhead name
					param[2]=content[i].childNodes[2].firstChild.data; // overhead description
					param[3]=content[i].childNodes[3].firstChild.data;  // amount
					param[4]=content[i].childNodes[4].firstChild.data;  // total
					addRowToTable6(tbl,rowToInsertAt,param);
				}

				var asmTag=xmlDoc.getElementsByTagName("assembly");
				if(asmTag!=null && asmTag.length>0)
				{
					myAsmRow.myRow.content[12].value=""+asmTag[0].getAttribute("gross")+"";
					document.getElementById("overheadTotal").innerHTML=""+asmTag[0].getAttribute("overheadTotal")+"";
					document.getElementById("multi").innerHTML=""+asmTag[0].getAttribute("multiplier")+"";
					multiplier=parseInt(asmTag[0].getAttribute("multiplier"));
				}
			}
		}
		else {
			alert("Connection Problem:"+myRequest.statusText);
		}
		closeSplashScreen();
	}
};

/*****************************************************/
//Create analysis of rates from a combination of assemblies
//Open Import Tab
var asmManagerContainer="blankHidden4";	//Main div containing the DHTML window
var asmInnnerContainer="innerASMContainer";		//Main inner window
//var asmOptionsWindow=null;
var asmOptionsWindowId=importWindowId;

var ASM_INNER_TABLE_NAME="asmInnerSample";			//Should be named in HTML
var ASM_INNER_DIV_NAV_NAME="asmInnerNavDiv";		//Navigation Bar

var asmiTablecontainer=asmInnnerContainer;	//this DIV will contain our list
var initAssemblyImportWin=function() {
	var div=document.getElementById(asmManagerContainer);
	div.innerHTML="<div id='"+asmInnnerContainer+"' class='smallText'></div>";
	importWindow=internalWindow.open(cbOptionsWindowId, 'div', asmManagerContainer, 'Import from Assemblies', 'width=700px,height=400px,left=5px,top=5px,resize=1,scrolling=1');
	callOpenAssembliesListAjax();
};

var callOpenAssembliesListAjax=function() {
	if(document.getElementById(asmiTablecontainer)==null) return;
	var myRateAnalysisRequest=getHTMLHTTPRequest();
	cbiTableCurrentParent=id;
	var div=document.getElementById(asmiTablecontainer);
	//var asmId=div.getAttribute("asmId");
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20290+"&cbId="+costBookId+"&flag="+importFlag+"&method=ImportAnalysis";

	myRateAnalysisRequest.open("GET",url,true);
	myRateAnalysisRequest.onreadystatechange=function()
	{
		if(myRateAnalysisRequest.readyState==4) {
			if(myRateAnalysisRequest.status==200) {
				renderAssembliesForImport(myRateAnalysisRequest);
			}
			else {
				alert("Connection Problem:"+myRateAnalysisRequest.statusText);
			}
		}
	};
	writeWaitMsg(asmiTablecontainer,"themes/icons/ajax_loading/22.gif","Loading page, please wait...");
	myRateAnalysisRequest.send(null);
};


function renderAssembliesForImport(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(asmiTablecontainer,systemMsg);
	if(errorFlag==0) return;

	var str="";
	//str+="<div id='"+ASM_INNER_DIV_NAV_NAME+"'></div>";
	str+="Filter: <input name='filter' onKeyUp='filter(this, \""+ASM_INNER_TABLE_NAME+"\")' type='text'>";
	//str+="&nbsp;&nbsp;<a href='javascript:void(0);' onclick='filterSelected();'>Filter Selected</a>";
	str+="&nbsp;&nbsp;<a href='javascript:void(0);' onclick='exportSelectedAssemblies(\""+ASM_INNER_TABLE_NAME+"\");'>Export</a><br>";
	str+="<table id='"+ASM_INNER_TABLE_NAME+"' width='100%' class='innerContentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='15%'>Name</td><td width='45%'>Description</td><td width='15%'>Price</td><td>Amount</td><td></td></tr></thead>";
	str+="<tbody></tbody></table>";
	document.getElementById(asmiTablecontainer).innerHTML=str;
	//Update the assemblies navigation bar
	//updateCostbookNav(xmlDoc,ASM_INNER_DIV_NAV_NAME);
	populateAssembliesImportTable(xmlDoc,ASM_INNER_TABLE_NAME);
	addTableRolloverEffect(ASM_INNER_TABLE_NAME,'tableRollOverEffect2','tableRowClickEffect2');
}

/*
 * Populate table $tableName$ using markup $xmlDoc$
 */
var populateAssembliesImportTable=function (xmlDoc,tableName) {
	var rowToInsertAt;
	var tbl;
	var param;
	var content=xmlDoc.getElementsByTagName("item");
	for(i=0;i<content.length;i++)
	{
		tbl=document.getElementById(tableName);
		rowToInsertAt = tbl.tBodies[0].rows.length;
		param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;
		param[1]=content[i].childNodes[1].firstChild.data;
		param[2]=content[i].childNodes[2].firstChild.data;
		param[3]=content[i].childNodes[3].firstChild.data;
		param[4]=content[i].childNodes[4].firstChild.data;
		param[5]=content[i].childNodes[5].firstChild.data;
		if(parseInt(param[0])==asmId) continue;		//skip the assembly for which we are preparing the analysis
		addRowToTable7(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
};

var addRowToTable7=function (tbl,num,param) {
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
	cell[0].innerHTML="<img src='images/assembly/item.png' border='0'>";

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

	//Cell4: Price
	cell[4]=row.insertCell(4);
	var unit=document.createTextNode(param[4]+"/"+param[3]);
	cell[4].appendChild(unit);

	//Cell5: Volume
	cell[5]=row.insertCell(5);
	var volume;
	volume=document.createElement('input');
	volume.setAttribute('type', 'text');
	volume.setAttribute('size', '10');
	volume.setAttribute('value', '-');
	volume.disabled=true;
	cell[5].appendChild(volume);
	cell[5].appendChild(document.createTextNode("*"+param[5]));

	//Cell6: Checkbox
	cell[6]=row.insertCell(6);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	cell[6].appendChild(checkBox);
	checkBox.onclick=toggleVolumeBoxState;


	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;					//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=param[0];			//ID
	rowContents[3]=volume;				//VOLUME
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

var toggleVolumeBoxState=function(e) {
	/*var eventSrc=e;
	var row=null;
	var checkBox=null;
	alert(this.tagName);
	if(eventSrc.target)
	{
		checkBox=eventSrc.target;
		row=checkBox.parentNode.parentNode;
	}
	else if(eventSrc.srcElement)
	{
		checkBox=eventSrc.srcElement;
		//alert(eventSrc.tagName);
		row=checkBox.parentNode.parentNode;
	}*/
	var checkBox=this;
	row=checkBox.parentNode.parentNode;
	if(row!=null)
	{
		if(checkBox.checked==true)
			row.myRow.content[3].disabled=false;
		else {
			row.myRow.content[3].disabled=true;
			row.myRow.content[3].value='-';
		}
	}
};

var exportSelectedAssemblies=function(tblId) {
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
		callExportAssembliesAjax(tbl,checkedObjArray,rIndex);
	}
};

function callExportAssembliesAjax(tbl,obj,rIndex) {
	if(!window.confirm("Import from selected item(s)?")) return;
	var myAsmExportRequest=getHTMLHTTPRequest();
	var myDelTable=tbl;
	var myDelRowsArray=obj;
	var myDelrIndex=rIndex;
	var myRandom=parseInt(Math.random()*99999999);
	var id="";
	var volume="";
	for(var i=0; i<obj.length; i++) {
		if(id=="") {
			id+=obj[i].myRow.content[2];
			volume+=obj[i].myRow.content[3].value;
		}	
		else
		{
			id+=","+obj[i].myRow.content[2];
			volume+=","+obj[i].myRow.content[3].value;
		}
	}
	var method;
	if(importFlag==1)
		method="importResourcesFromAssemblies";
	else
		method="importOverheadsFromAssemblies";
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20291+"&ids="+URLEncode(id)+"&volumes="+URLEncode(volume)+"&asmId="+asmId+"&cbId="+costBookId+"&method="+method;
	//alert(url);
	myAsmExportRequest.open("GET",url,true);
	myAsmExportRequest.onreadystatechange=function()
	{
		if(importFlag==1)
			importMaterialToAnalysisAction(myAsmExportRequest,INNER_TABLE_NAME_PREFIX);
		else
			importOverheadsToAnalysisAction(myAsmExportRequest,INNER_TABLE_NAME_PREFIX);
	};
	openSplashScreen();
	myAsmExportRequest.send(null);
}