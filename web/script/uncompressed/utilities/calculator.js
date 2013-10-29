/**********************************************************
 * Expression Interpreter(frontend)
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
var calculatorDiv='utilities';
var calculatorInnerDiv='calculatorInner';
var loadedCalculator;
var calcWindowClosed=true;
var initCalculatorWin=function() {
	var div=document.getElementById(calculatorDiv);
	if(div==null) {alert("Error: access denied"); return;}
	div.innerHTML="<div id='"+calculatorInnerDiv+"' class='smallText'>Please click on one of the options above</div>";
	openCalculator();
};

function openCalculator()
{
	calculatorWindow=internalWindow.open("calcWindowDiv", 'div', calculatorDiv, 'Calculator', 'width=400px,height=400px,right=20px,top=20px,center=1,resize=0,scrolling=1,keepOpen=1');
	calcWindowClosed=false;
	/*calculatorWindow.onclose=function(){
		myHelpWindowOpenState=false;
		var v=window.confirm("Close Calculator?");
		if(v) calcWindowClosed=true;
		return v;
		}*/
	calculatorPageContent();
}

function calculatorPageContent() {
	var str="";
	str+="<br><br><center><table width='80%' style='border :1px solid ridge black;' bgcolor='#CDD1C5'><tr height='20px'><td width='100%' align='left'>&nbsp;</td></tr><tr><td width='100%' align='center'><textarea id='expression' rows='6' cols='40'></textarea></td></tr>";
	str+="<tr><td align='center'><input type='button' value='Calculate' onclick='callCalculatorAjax();'><input type='button' value='Reset' onclick='resetCalculatorTextarea();'></td></tr>";
	str+="<tr height='150px'><td align='left' valign='top' style='border-top:1px solid ridge black;'><span id='calResult'>&nbsp;</span></td></tr></table><center>";

	document.getElementById(calculatorInnerDiv).innerHTML=str;
	document.getElementById('expression').focus();
	loadedCalculator=true;
}

function resetCalculatorTextarea()
{
	document.getElementById('expression').value='';
	document.getElementById('calResult').innerHTML='&nbsp;';
	document.getElementById('expression').focus();
}



function callCalculatorAjax() {
	if(document.getElementById(calculatorInnerDiv)==null) return;
	var myCalculatorRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var expression='expression='+URLEncode(document.getElementById('expression').value);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+30010+"&method="+"Calculator";
	myCalculatorRequest.open("POST",url,true);
	myCalculatorRequest.onreadystatechange=function()
	{
		if(myCalculatorRequest.readyState==4) {
			if(myCalculatorRequest.status==200) {
				renderResult(myCalculatorRequest);
			}
			else {
				alert("Connection Problem:"+myCalculatorRequest.statusText);
			}
		}
	};
	writeWaitMsg('calResult',"themes/icons/ajax_loading/24.gif","Processing...");
	myCalculatorRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
	myCalculatorRequest.setRequestHeader("Content-length", expression.length);
	myCalculatorRequest.send(expression);
}

function renderResult(request)
{
	var total=request.responseText;
	document.getElementById('calResult').innerHTML=total;
}

initCalculatorWin();
/*
function showCalculatorWin() {
	if(loadedCalculator==true && calcWindowClosed==true)
		initCalculatorWin();
}
 */