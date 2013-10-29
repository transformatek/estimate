/**********************************************************
 * Slide-in Menu
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

var slideInMenu={
		YOffset: 79, // offset from top
		barText: "SIDE MENU",
		barBGColor: "#61583A",
		barVAlign: "middle",
		barFontFamily: "Verdana",
		barFontSize: "2",
		barFontColor: "white",
		sliderIntervalId: 0,
		sliding: false,
		slideSpeed: 20,
		menuWidth: 200,
		barWidth: 20,
		sliderWidth: 220,
		sliderContainerId:'menuSliderContainer',
		sliderElementId: 'menuSlider',
		menuContainerId: "sideMenuContainer",
		moveIn:function()
		{
			var obj=this;
			var slider = document.getElementById(obj.sliderElementId);
			if(obj.sliderWidth <= obj.barWidth)
			{
				obj.sliding = false;
				obj.sliderWidth = obj.barWidth;
				slider.style.left = (-obj.menuWidth)+'px';
				clearInterval(obj.sliderIntervalId);
			}
			else
			{
				obj.sliderWidth -= obj.slideSpeed;
				if(obj.sliderWidth < obj.barWidth)
					obj.sliderWidth = obj.barWidth;
				slider.style.left = (obj.sliderWidth-(obj.menuWidth+obj.barWidth)) + 'px';
			}
		},

		moveOut:function() {
			var obj=this;
			var slider = document.getElementById(obj.sliderElementId);
			if(obj.sliderWidth >= obj.menuWidth+obj.barWidth)
			{
				obj.sliding = false;
				obj.sliderWidth = obj.menuWidth+obj.barWidth;
				slider.style.left = '0px';
				clearInterval(obj.sliderIntervalId);
				callFavouriteAjax();
			}
			else
			{
				obj.sliderWidth += obj.slideSpeed;
				if(obj.sliderWidth > obj.menuWidth+obj.barWidth)
					obj.sliderWidth = obj.menuWidth+obj.barWidth;
				slider.style.left = (obj.sliderWidth-(obj.menuWidth+obj.barWidth)) + 'px';
			}
		},
		
		moveBox:function() {
			var offset=0;
			var slider = document.getElementById(this.sliderElementId);
			slider.style.top = (viewPort.getOffset().top + offset) + 'px'; 
		},

		slide:function() {
			if(this.sliding)
				return;
			this.sliding = true;
			if(this.sliderWidth == this.menuWidth+this.barWidth)
				this.sliderIntervalId = setInterval('slideInMenu.moveIn()', 30);
			else
				this.sliderIntervalId = setInterval('slideInMenu.moveOut()', 30);
		},
		menuInit:function() {
			var tempBar="";
			if(this.barText.indexOf('<IMG')>-1) {tempBar=this.barText;}
			else{for (var b=0;b<this.barText.length;b++) {tempBar+=this.barText.charAt(b)+"<br>";}}
			var str="";
			str+='<div style="position:absolute; top: '+this.YOffset+'px; margin-bottom: 5px; z-index: 15; padding: 0px 0px 0px 0px;">';
			str+='<div id="menuSlider"	style="position: absolute; top: 0px; left: 0px; background-color: #ffffff; border: 0px solid #FFFFFF; color: #000000; overflow: hidden; padding: 0px 0px 0px 0px;">';
			str+='<table width="'+(this.menuWidth+this.barWidth+2)+'" cellpadding="0" cellspacing="1"><tr>';
			str+='<td><div id="'+this.menuContainerId+'" style="width:'+(this.menuWidth-4)+'px; height: 170px;vertical-align: top; background-color: #ECECD9;"></div></td>';
			str+='<td  align="center" width="'+(this.barWidth+4)+'px;" bgcolor="'+this.barBGColor+'" valign="'+this.barVAlign+'" onclick="slideInMenu.slide();" style="cursor: pointer;"><font face="'+this.barFontFamily+'" size="'+this.barFontSize+'" color="'+this.barFontColor+'"><b>'+tempBar+'</b></font></td>';
			str+='</tr></table></div></div>';
			document.write(str);
			
			var slider = document.getElementById(this.sliderElementId);
			slider.style.left = (-this.menuWidth)+'px';
			this.sliderWidth=this.barWidth;
			
			//Fix the position
			//window.setInterval("slideInMenu.moveBox()", 50);
			callFavouriteAjax();

		}
};