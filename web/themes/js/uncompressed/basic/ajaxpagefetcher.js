/**********************************************************
 * Dynamically fetches pages through ajax call and loads js/css files
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
var myAjaxPageFetcher={
		loadingMessage: "Loading Page, please wait...",
		fileRegistry: "",		//Registry of loaded files
		fetchPage:function(containerId, pageUrl, bustCache, jsFiles, cssFiles,method,postParams){
			var pageRequest = null;
			var bustCacheparameter="";

			pageRequest=getHTMLHTTPRequest();	//Defined in globalDefs.js
			if(pageRequest==null)
				return;
			var ajaxUrl=pageUrl.replace(/^http:\/\/[^\/]+\//i, "http://"+window.location.hostname+"/") ;
			pageRequest.onreadystatechange=function(){myAjaxPageFetcher.loadPage(pageRequest, containerId, pageUrl, jsFiles, cssFiles);};
			if (bustCache) //if bust caching of external page
				bustCacheparameter=(ajaxUrl.indexOf("?")!=-1)? "&"+new Date().getTime() : "?"+new Date().getTime();
				writeWaitMsg(containerId,"themes/icons/ajax_loading/22.gif",myAjaxPageFetcher.loadingMessage);
				if(method=="get") {
					pageRequest.open('GET', ajaxUrl+bustCacheparameter, true);
					pageRequest.send(null);
				}

				else if(method=="post") {
					var params=postParams;
					if(params==null || params=="undefined") params="";
					pageRequest.open('POST', ajaxUrl+bustCacheparameter, true);
					pageRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					pageRequest.setRequestHeader("Content-length", params.length);
					pageRequest.send(params);
				}

				else {
					alert("Wrong Method: only get/post supported");
				}
		},

		loadPage:function(pageRequest, containerId, pageUrl, jsFiles, cssFiles){
			if (pageRequest.readyState == 4 && (pageRequest.status==200 || window.location.href.indexOf("http")==-1)){
				document.getElementById(containerId).innerHTML=pageRequest.responseText;
				//Load JS Files
				for (var i=0; i<jsFiles.length; i++)
					this.loadScript(jsFiles[i]);
				//Load CSS File
				for (var i=0; i<cssFiles.length; i++)
					this.loadStyleSheet(cssFiles[i]);
				//Onload
				this.callbackAction(pageUrl);
			}
		},

		loadScript:function(jsFile) {
			if(!this.isLoaded(jsFile)) {
				element=this.createScriptElement(jsFile,"js");
				document.getElementsByTagName("head")[0].appendChild(element);
				this.setLoaded(jsFile);
			}
			else {
				//Get all script elements
				var elements=document.getElementsByTagName("script");
				for (var i=elements.length; i>=0; i--){
					var src=null;
					if(elements[i]) src=elements[i].getAttribute("src");
					if (src!=null && src.indexOf(jsFile)!=-1){
						var newElement=this.createScriptElement(jsFile, "js");
						elements[i].parentNode.replaceChild(newElement, elements[i]);
					}
				}
			}
		},

		loadStyleSheet:function(cssFile) {
			if(!this.isLoaded(cssFile)) {
				element=this.createScriptElement(cssFile,"css");
				document.getElementsByTagName("head")[0].appendChild(element);
				this.setLoaded(cssFile);
			}
			else {
				//Get all css elements
				var elements=document.getElementsByTagName("link");
				for (var i=elements.length; i>=0; i--){
					var src=null;
					if(elements[i]) src=elements[i].getAttribute("href");
					if (src!=null && src.indexOf(cssFile)!=-1){
						var newElement=this.createScriptElement(cssFile, "css");
						elements[i].parentNode.replaceChild(newElement, elements[i]);
					}
				}
			}
		},

		isLoaded:function(file) {
			return (this.fileRegistry.indexOf("["+file+"]")!=-1);
		},

		setLoaded:function(file) {
			this.fileRegistry+="["+file+"]";
		},

		createScriptElement:function(filename, type){
			if (type=="js"){ //if filename is a external JavaScript file
				var element=document.createElement('script');
				element.setAttribute("type","text/javascript");
				element.setAttribute("src", filename);
			}
			else if (type=="css"){ //if filename is an external CSS file
				var element=document.createElement("link");
				element.setAttribute("rel", "stylesheet");
				element.setAttribute("type", "text/css");
				element.setAttribute("href", filename);
			}
			return element;
		},

		callbackAction:function(pageUrl){
			this.callBack(pageUrl); //call customize callBack() function when an ajax page is fetched/ loaded
		},

		callBack:function(pageUrl){
			//do nothing by default
		},

		load:function(containerId, pageUrl, bustCache, jsFiles, cssFiles,method,postParams){
			var jsFiles=(typeof jsFiles=="undefined" || jsFiles=="")? [] : jsFiles;
			var cssFiles=(typeof cssFiles=="undefined" || cssFiles=="")? [] : cssFiles;
			this.fetchPage(containerId, pageUrl, bustCache, jsFiles, cssFiles,method,postParams);
		}

}; //End object

//Sample usage:
//1) myAjaxPageFetcher.load("mydiv", "content.htm", true,"get")
//2) myAjaxPageFetcher.load("mydiv2", "content.htm", true, ["external.js"],"get")
//3) myAjaxPageFetcher.load("mydiv2", "content.htm", true, ["external.js"], ["external.css"],"get")
//4) myAjaxPageFetcher.load("mydiv2", "content.htm", true, ["external.js", "external2.js"],"post",params)
//5) myAjaxPageFetcher.load("mydiv2", "content.htm", true, "", ["external.css", "external2.css"],"get")