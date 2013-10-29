/**********************************************************
 * Creates basic facilities for generating Tender/Bid reports
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
 *---------------------------------------------
 *Modified on 28/10/2013
 *removed <a> tag from tender's icon
 *---------------------------------------------
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
var ctx_THEAD="TENDER_REP_TTHEAD123";				
var ctx_TBODY="TENDER_REP_TTBODY123";

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
	if(tmp.myRow==null)
	{
		setMenuItemState(213840,'disabled');	//DNIT
		setMenuItemState(213850,'disabled');	//BID ANALYSIS
	}
	else
	{
		if(tmp.myRow.content[7]=="tender")
		{
			setMenuItemState(213840,'regular');	//DNIT
			setMenuItemState(213850,'regular');	//BID ANALYSIS
		}
		else
		{
			setMenuItemState(213840,'disabled');	//DNIT
			setMenuItemState(213850,'disabled');	//BID ANALYSIS
		}
	}
	
	
	if(tenderCatTableCurrentParent==1)
	{
		setMenuItemState(213810,'disabled');	//UP
		setMenuItemState(213820,'disabled');	//TOP
	}
	else
	{
		setMenuItemState(213810,'regular');	//UP
		setMenuItemState(213820,'regular');	//TOP
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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+104100+"&parent="+id+"&method="+"get";

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
	str+="<table id='"+TABLE_NAME+"' width='100%' class='contentTable'><thead id='"+ctx_THEAD+"'><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='25%'>Name</td><td width='100%'>Description</td></tr></thead>";
	str+="<tbody id='"+ctx_TBODY+"'></tbody></table>";
	document.getElementById(tenderCatTablecontainer).innerHTML=str;
	//Update the cbCat navigation bar
	updateTenderCatNav(xmlDoc,DIV_NAV_NAME);
	populateTable(xmlDoc,TABLE_NAME);
	addTableRolloverEffect(TABLE_NAME,'tableRollOverEffect1','tableRowClickEffect1');
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
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callTenderCatAjax("+tenderCatTableparent+")'><img src='images/project/report/tender/up.png' border='0' alt='Up one level'></a></td>";
		str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='callTenderCatAjax("+tenderCatTableTop+")'><img src='images/project/report/tender/top.png' border='0' alt='Top level'></a></td>";
	}
	else
	{
		str+="<td><img src='images/project/report/tender/up1.png' alt='Up one level'></td>";
		str+="<td><img src='images/project/report/tender/top1.png' alt='Top level'></td>";
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
		cell[0].innerHTML="<img src='images/project/tender/tender.png' border='0'>";
	else
		cell[0].innerHTML="<img src='images/project/tender/tender_closed.png' border='0'>";
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

var reorderRows=function (tbl, startingIndex) {
	if (tbl.tBodies[0].rows[startingIndex]) {
		var count = startingIndex + ROW_BASE;
		for (var i=startingIndex; i<tbl.tBodies[0].rows.length; i++) {
			tbl.tBodies[0].rows[i].myRow.content[3].data = count; // text
			count++;
		}
	}
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
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+104100+"&key="+searchString+"&method="+"searchCostBook";
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

/*******************************************************/
/*
 * Generate DNIT/ANALYSIS
 */
var generateDNIT=function()
{
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
	if(rowToEdit!=null)
	{
		var tenderId=rowToEdit.myRow.content[6];
		//alert(tenderId);
		window.open("MyActionDispatcher?path=104200&tenderId="+tenderId+"&method=createDNIT");
	}
};


/*******************************************************/
/*
 * Open Project Vendor
 */
var bidderManagerContainer="blankHidden1";
var bidderPropertiesWindowTitleId="bidderPropertiesWindowTitleId";
var BIDDER_INNER_TABLE_NAME="bidderInnerSample";
var BIDDER_DIV_NAV_NAME="bidderDivNavName";
var bidderInnerDivPrefix="bidderInnerDivPrefix";
var currentTenderId=0;
var analyzeBids=function()
{
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
	if(rowToEdit!=null)
	{
		var tenderId=rowToEdit.myRow.content[6];
		currentTenderId=tenderId;
		var tenderName=rowToEdit.myRow.content[4].data;
		var innerStr="<div id="+bidderInnerDivPrefix+">Loading content, please wait...</div>";
		document.getElementById(bidderManagerContainer).innerHTML=innerStr;
		var vendorOptionsWindow=internalWindow.open(bidderPropertiesWindowTitleId, 'div', bidderManagerContainer, 'List of Bids for: ['+tenderName+']', 'width=600px,height=400px,left=5px,top=5px,resize=1,scrolling=1');
		callApprovedBiddersAjax(tenderId);
	}
};

function callApprovedBiddersAjax(id) {
	
	if(document.getElementById(bidderManagerContainer)==null) return;
	var myBidderRequest=getHTMLHTTPRequest();
	
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+104300+"&tenderId="+id+"&method="+"get";

	myBidderRequest.open("GET",url,true);
	myBidderRequest.onreadystatechange=function()
	{
		if(myBidderRequest.readyState==4) {
			if(myBidderRequest.status==200) {
				renderProjectBidders(myBidderRequest);
			}
			else {
				alert("Connection Problem:"+myBidderRequest.statusText);
			}
		}
	};
	myBidderRequest.send(null);
}
function renderProjectBidders(request) {
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(bidderInnerDivPrefix,systemMsg);
	if(errorFlag==0) return;
	var str="";
	str+="<div id='"+BIDDER_DIV_NAV_NAME+"'></div>";
	str+="<table id='"+BIDDER_INNER_TABLE_NAME+"' width='100%' class='contentTable'><thead><tr><td width='18px'>&nbsp;</td><td width='1%'>Sl</td><td width='20%'>Name</td><td width='100%'>Description</td><td>D</td></tr></thead>";
	str+="<tbody></tbody></table>";
	document.getElementById(bidderInnerDivPrefix).innerHTML=str;
	updateBidderNav(xmlDoc,BIDDER_DIV_NAV_NAME);
	populateBidderTable(xmlDoc,BIDDER_INNER_TABLE_NAME);
	addTableRolloverEffect(BIDDER_INNER_TABLE_NAME,'tableRollOverEffect2','tableRowClickEffect2');
}
var updateBidderNav=function (xmlDoc,element) {
	var str="<table class='innerNavTable'><tr>";
	str+="<td><label>Select: </label>";
	str+="<a href='javascript:void(0);' onclick='makeSelection(\""+BIDDER_INNER_TABLE_NAME+"\", \""+"all\");'>All</a>&nbsp;";
	str+="<a href='javascript:void(0);' onclick='makeSelection(\""+BIDDER_INNER_TABLE_NAME+"\", \""+"none\");'>None</a>&nbsp;";
	str+="<a href='javascript:void(0);' onclick='makeSelection(\""+BIDDER_INNER_TABLE_NAME+"\", \""+"invert\");'>Invert</a></td>";
	
	//str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='myBillEditWindow(\""+TABLE_NAME+"\");'>Edit[E]</a></td>";
	str+="<td><a style='text-decoration: none;' href='javascript:void(0);' onclick='generateBidAnalysis(\""+BIDDER_INNER_TABLE_NAME+"\");'>Analyze Bids[D]</a></td>";
	str+="<td>Filter: <input name='filter' onKeyUp='filter(this, \""+BIDDER_INNER_TABLE_NAME+"\")' type='text'></td>";
	str+="</tr></table>";
	document.getElementById(element).innerHTML=str;
};

var populateBidderTable=function (xmlDoc,tableName) {
	var content=xmlDoc.getElementsByTagName("bidder");
	for(var i=0;i<content.length;i++)
	{
		var tbl=document.getElementById(tableName);
		var rowToInsertAt = tbl.tBodies[0].rows.length;
		var param=Array();
		param[0]=content[i].childNodes[0].firstChild.data;	//Contact ID
		param[1]=content[i].childNodes[1].firstChild.data;	//Name
		param[2]=content[i].childNodes[2].firstChild.data;	//Description
		param[3]=content[i].childNodes[3].firstChild.data;	//Bidder ID
		param[4]=content[i].childNodes[4].firstChild.data;	//COMPLETE: true/false
		addRowToBidderTable(tbl,rowToInsertAt,param);
		reorderRows(tbl, rowToInsertAt);
	}
	//addButtonToVendorTable(tbl);
};

var addRowToBidderTable=function (tbl,num,param) {
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
	row.className='styleB'+(iteration % 2);
	var cell=Array();
	//Cell0: Image
	cell[0] = row.insertCell(0);
	if(param[4]=="true")
		cell[0].innerHTML="<img src='images/project/tender/bidders1.png' border='0'>";
	else
		cell[0].innerHTML="<img src='images/project/tender/bidders.png' border='0'>";
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

	//Cell8: Checkbox
	cell[4]=row.insertCell(4);
	var checkBox = document.createElement('input');
	checkBox.setAttribute('type', 'checkbox');
	if(param[4]!="true")
		checkBox.disabled=true;
	cell[4].appendChild(checkBox);


	//Populate row Properties that we want to reference later
	var rowContents=Array();
	rowContents[0]=checkBox;			//keep it at $1 to access easily
	rowContents[1]=0;				//keep it at $2 for easy access
	//customizable contents
	rowContents[2]=cell[0].innerHTML;
	rowContents[3]=slNo;
	rowContents[4]=name;
	rowContents[5]=description;
	rowContents[6]=param[0];			//ID
	rowContents[7]=param[3];			//VENDOR ID
	rowContents[8]=param[4];			//COMPLETE
	var rowObj=new myRowObject(rowContents);
	row.myRow=rowObj;
};

var makeSelection=function(tblId,flag)
{
	var tbl=document.getElementById(tblId);
	var i;
	if(flag=="all")
	{
		for (i=0; i<tbl.tBodies[0].rows.length; i++)
		{
			if(!tbl.tBodies[0].rows[i].myRow.content[0].disabled)
				tbl.tBodies[0].rows[i].myRow.content[0].checked=true;
		}
	}
	else if(flag=="none")
	{
		for (i=0; i<tbl.tBodies[0].rows.length; i++)
		{
			tbl.tBodies[0].rows[i].myRow.content[0].checked=false;
		}
	}
	else if(flag=="invert")
	{
		for (i=0; i<tbl.tBodies[0].rows.length; i++)
		{
			if(tbl.tBodies[0].rows[i].myRow.content[0].checked) {
				tbl.tBodies[0].rows[i].myRow.content[0].checked=false;
			}
			else if(!tbl.tBodies[0].rows[i].myRow.content[0].disabled)
				tbl.tBodies[0].rows[i].myRow.content[0].checked=true;
		}
	}
	else
		alert("Unknown flag: "+tblId+" "+flag);
};

/*
 * Generate Comparative Chart 
 */
var generateBidAnalysis=function(tblId)
{
	var tbl=document.getElementById(tblId);
	var cCount = 0;
	var id="";
	var tenderId=currentTenderId;
	for (var i=0; i<tbl.tBodies[0].rows.length; i++)
	{
		
		if(tbl.tBodies[0].rows[i].myRow.content[0].checked) {
			cCount++;
			if(cCount==1)
			{
			id+=tbl.tBodies[0].rows[i].myRow.content[7];
			}
			else
			{
				id+=","+tbl.tBodies[0].rows[i].myRow.content[7];
			}
	}
	
	}
	if (cCount<2)
	{
		alert("Please select atleast two Entries");
	}
	else
	{
		//alert(id);
		window.open("MyActionDispatcher?path=104400&Ids="+id+"&tenderId="+tenderId+"&method=bidAnalysisPDF");
	}
};

/*
 * Filters Table rows for phrase
 */
function filter (phrase, _id){
	var words = phrase.value.toLowerCase().split(" ");
	var table = document.getElementById(_id);
	//alert(_id);
	var ele;
	for (var r = 0; r < table.tBodies[0].rows.length; r++){
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
		table.tBodies[0].rows[r].style.display = displayStyle;
	}
}


/**********************************************************/
/*
 * Init the first level
 */
initializeTendersTable(10290);