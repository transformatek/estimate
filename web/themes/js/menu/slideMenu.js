var slideInMenu={YOffset:79,barText:"SIDE MENU",barBGColor:"#61583A",barVAlign:"middle",barFontFamily:"Verdana",barFontSize:"2",barFontColor:"white",sliderIntervalId:0,sliding:false,slideSpeed:20,menuWidth:200,barWidth:20,sliderWidth:220,sliderContainerId:"menuSliderContainer",sliderElementId:"menuSlider",menuContainerId:"sideMenuContainer",moveIn:function(){var b=this;var a=document.getElementById(b.sliderElementId);if(b.sliderWidth<=b.barWidth){b.sliding=false;b.sliderWidth=b.barWidth;a.style.left=(-b.menuWidth)+"px";clearInterval(b.sliderIntervalId)}else{b.sliderWidth-=b.slideSpeed;if(b.sliderWidth<b.barWidth){b.sliderWidth=b.barWidth}a.style.left=(b.sliderWidth-(b.menuWidth+b.barWidth))+"px"}},moveOut:function(){var b=this;var a=document.getElementById(b.sliderElementId);if(b.sliderWidth>=b.menuWidth+b.barWidth){b.sliding=false;b.sliderWidth=b.menuWidth+b.barWidth;a.style.left="0px";clearInterval(b.sliderIntervalId);callFavouriteAjax()}else{b.sliderWidth+=b.slideSpeed;if(b.sliderWidth>b.menuWidth+b.barWidth){b.sliderWidth=b.menuWidth+b.barWidth}a.style.left=(b.sliderWidth-(b.menuWidth+b.barWidth))+"px"}},moveBox:function(){var b=0;var a=document.getElementById(this.sliderElementId);a.style.top=(viewPort.getOffset().top+b)+"px"},slide:function(){if(this.sliding){return}this.sliding=true;if(this.sliderWidth==this.menuWidth+this.barWidth){this.sliderIntervalId=setInterval("slideInMenu.moveIn()",30)}else{this.sliderIntervalId=setInterval("slideInMenu.moveOut()",30)}},menuInit:function(){var e="";if(this.barText.indexOf("<IMG")>-1){e=this.barText}else{for(var a=0;a<this.barText.length;a++){e+=this.barText.charAt(a)+"<br>"}}var d="";d+='<div style="position:absolute; top: '+this.YOffset+'px; margin-bottom: 5px; z-index: 15; padding: 0px 0px 0px 0px;">';d+='<div id="menuSlider"	style="position: absolute; top: 0px; left: 0px; background-color: #ffffff; border: 0px solid #FFFFFF; color: #000000; overflow: hidden; padding: 0px 0px 0px 0px;">';d+='<table width="'+(this.menuWidth+this.barWidth+2)+'" cellpadding="0" cellspacing="1"><tr>';d+='<td><div id="'+this.menuContainerId+'" style="width:'+(this.menuWidth-4)+'px; height: 170px;vertical-align: top; background-color: #ECECD9;"></div></td>';d+='<td  align="center" width="'+(this.barWidth+4)+'px;" bgcolor="'+this.barBGColor+'" valign="'+this.barVAlign+'" onclick="slideInMenu.slide();" style="cursor: pointer;"><font face="'+this.barFontFamily+'" size="'+this.barFontSize+'" color="'+this.barFontColor+'"><b>'+e+"</b></font></td>";d+="</tr></table></div></div>";document.write(d);var c=document.getElementById(this.sliderElementId);c.style.left=(-this.menuWidth)+"px";this.sliderWidth=this.barWidth;callFavouriteAjax()}};