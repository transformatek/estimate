/**********************************************************
 * Displays date and time at the top of the main page
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
var localTimer={
		dayarray:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
		montharray:["January","February","March","April","May","June","July","August","September","October","November","December"],

		getTime:function() {
			var myDate=new Date();
			var year=myDate.getFullYear();
			var month=myDate.getMonth();
			var day=myDate.getDay();
			var dayOfMonth=myDate.getDate();
			var hours=myDate.getHours();
			var minutes=myDate.getMinutes();
			var seconds=myDate.getSeconds();

			var dn=(hours>=12)?"PM":"AM";
			dayOfMonth=(dayOfMonth<10)?"0"+dayOfMonth:dayOfMonth;
			hours=(hours>12)?hours-12:(hours==0?12:hours);

			minutes=(minutes<10)?"0"+minutes:minutes;
			seconds=(seconds<10)?"0"+seconds:seconds;

			var cdate="<small><font color='#449944' face='Arial'><b>&nbsp;"+this.dayarray[day]+", "+this.montharray[month]+" "+dayOfMonth+", "+year+" <font color='#5533ef'>"+hours+":"+minutes+":"+seconds+" </font><font color='#ff2233'>"+dn+" </font>"
			+"</b></font></small>";
			if (document.all)
				document.all.clock.innerHTML=cdate;
			else if (document.getElementById)
				document.getElementById("clock").innerHTML=cdate;
		}
};
function initBrowserTimeDisplay(){
	if (document.all||document.getElementById)
		setInterval("localTimer.getTime()",1000);
}
