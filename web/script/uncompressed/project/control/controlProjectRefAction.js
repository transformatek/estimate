/**********************************************************
 * Manage documents associated with control-project(will be deprecated in next release)
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
var ROW_BASE=1;
var deleteControlProjectRefAjax=function(e) {
	if(!confirmDelete()) return;
	var eventSrc=e;
	var row;
	var tbl;
	if(eventSrc.target)
	{
		row=eventSrc.target.parentNode.parentNode;
	}
	else if(eventSrc.srcElement)
	{
		row=eventSrc.srcElement.parentNode.parentNode;
	}	

	var rowIndex=row.sectionRowIndex;
	tbl=row.parentNode.parentNode;
	var fileId=row.getAttribute("file_id");
	var request=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);

	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20770+"&fileId="+fileId+"&method="+"deleteControlProjectFile";
	request.open("GET",url,true);

	request.onreadystatechange=function() {
		if(request.readyState==4)
		{
			if(request.status==200)
			{
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
					deleteRow(row);
					reorderRows(tbl,rowIndex);
				}
				else if(statusFlag==2) {
					alert("DELETE: System Error");
				}
			}
			else {
				alert("Connection Problem:"+request.statusText);
			}
		}
	};

	request.send(null);
};


var deleteRow=function(row) {
	var rIndex = row.sectionRowIndex;
	row.parentNode.deleteRow(rIndex);
};

var reorderRows=function(tbl,startingIndex) {
	if (tbl.tBodies[0].rows[startingIndex]) {
		var count = startingIndex + ROW_BASE;
		for (var i=startingIndex; i<tbl.tBodies[0].rows.length; i++) {
			tbl.tBodies[0].rows[i].cells[0].innerHTML =""+count; // text
			count++;
		}
	}
};

var downloadControlProjectAction=function(e,editable) {
	var eventSrc=e;
	var row;
	var tbl;
	if(eventSrc.target)
	{
		row=eventSrc.target.parentNode.parentNode;
	}
	else if(eventSrc.srcElement)
	{
		row=eventSrc.srcElement.parentNode.parentNode;
	}	

	var rowIndex=row.sectionRowIndex;
	tbl=row.parentNode.parentNode;
	var fileId=row.getAttribute("file_id");

	//alert(fileId);
	if(editable==true)
		window.location="MyActionDispatcher?path=20780&fileId="+fileId+"&method=downloadControlProjectFile";
	else
		window.location="MyActionDispatcher?path=103300&fileId="+fileId+"&method=downloadControlProjectFile";
};
