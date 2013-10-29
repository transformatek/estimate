/**********************************************************
 * Menubars, context-menu, global variables and functions
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
 * Important menubar config variables
 */
var menuBarContainer="menuBarContainer";	//DIV for main menubar
var menuBar;			//For top menubar
//Defined inside ssm.js
var sideMenuContainer="sideMenuContainer";	//DIV for side menuBar, showing favourites
var sideMenuBar;							//For Side menubar
var uniqueMenuIdAdder=3000000;				//If we need to create >1 menubars
/*
 * This method is called to load xml file for menu
 */
var repeatedAjaxRequest=false;
var myMenuRequest=getHTMLHTTPRequest();
function callMenuAjax()
{
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MenuXml?method=getmainmenu&rand="+myRandom;
	myMenuRequest.open("GET",url,true);

	/* This function processes the response */
	myMenuRequest.onreadystatechange=drawMenuAction;
	/* Show loading message */
	writeWaitMsg(menuBarContainer,"themes/icons/ajax_loading/21.gif","Loading Main Menu, Please wait...");

	/* Send a new request */
	myMenuRequest.send(null);
}

function drawMenuAction() {
	if(myMenuRequest.readyState==4) {
		if(myMenuRequest.status==200) {
			menuBar=createMenubar(menuBar,myMenuRequest,"top",menuBarContainer,0);
			//sideMenuBar=createMenubar(sideMenuBar,myMenuRequest,"sub",sideMenuContainer,uniqueMenuIdAdder);
			//sleep(1);
			setupPermissions(myMenuRequest);
		}
		else {
			alert("Connection Problem:"+myMenuRequest.statusText);
		}
	}
}

/*=============================================================*/
/*
 * Utility Functions
 */

var menuCssDir="css/";		//CSS Directory for Menu
/*
 * The main function to create Menubar
 * Unique is such a number that makes all ids inside
 * the new menu unique
 */
function createMenubar(menuBarObject,requestDoc,type,menuDiv,unique) {
	document.getElementById(menuDiv).innerHTML='';
	var xmlDoc=requestDoc.responseXML;
	var menuItems=xmlDoc.getElementsByTagName("menuitem");
	var menuLength=menuItems.length;

	var menuModel=null;
	menuModel = new DHTMLSuite.menuModel();
	if(type=="sub")
		menuModel.setSubMenuType(1,'sub');
	DHTMLSuite.commonObj.setCssCacheStatus(false);
	//DHTMLSuite.configObj.setCssPath(menuCssDir);
	var counter=0;
	for(counter=0;counter<menuLength;counter++)
	{
		setMenuParameters(menuItems[counter],menuModel,unique);
	}

	if(type=="sub")
		menuModel.setMainMenuGroupWidth(200);	
	menuModel.init();
	menuBarObject=null;
	menuBarObject = new DHTMLSuite.menuBar();
	menuBarObject.addMenuItems(menuModel);
	menuBarObject.setTarget(menuDiv);
	if(type=="sub")
		menuBarObject.setActiveSubItemsOnMouseOver(true);
	menuBarObject.init();
	return menuBarObject;
}


/* Sets up Menu's Attributes/contents */
function setMenuParameters(param,model,unique) {
	var menuId=param.getAttribute("id");
	var menuParentId=param.getAttribute("parent");
	var menuName=param.getAttribute("name");
	var menuDescription=param.getAttribute("description");
	var menuImage=param.getAttribute("image");
	var menuAction=param.getAttribute("action");
	var menuLink=param.getAttribute("link");
	var subMenuWidth=param.getAttribute("width");
	if(menuParentId==1)
		menuParentId=false;
	else
		menuParentId=unique+parseInt(menuParentId);
	if(menuId==1)
		return;
	else
		menuId=unique+parseInt(menuId);
	if(menuName=='-') {
		if(menuParentId==false)
			model.addSeparator();
		else
			model.addSeparator(menuParentId);
		return;
	}
	if(menuName!='-') {
		model.addItem(menuId,menuName,menuImage,menuLink,menuParentId,menuDescription,menuAction);
		if(subMenuWidth!=0)
			model.setSubMenuWidth(menuId,subMenuWidth);
	}
}

function setupPermissions(requestDoc) {
	var xmlDoc=requestDoc.responseXML;
	var accessItems=xmlDoc.getElementsByTagName("access");
	var length=accessItems.length;
	var counter=0;
	for(counter=0;counter<length;counter++)
	{
		var id=accessItems[counter].getAttribute("id");
		menuBar.setMenuItemState(id,'disabled');
		//sideMenuBar.setMenuItemState(parseInt(id)+uniqueMenuIdAdder,'disabled')

	}
}


/************************************************************************/
/*                             Side MenuBar                             */
/************************************************************************/
var myFavouritesRequest=getHTMLHTTPRequest();

function callFavouriteAjax()
{
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"Favourites?rand="+myRandom+"&count="+6;
	myFavouritesRequest.open("GET",url,true);

	/* This function processes the response */
	myFavouritesRequest.onreadystatechange=drawFavouritesAction;

	/* Send a new request */
	myFavouritesRequest.send(null);
	writeWaitMsg(sideMenuContainer,"themes/icons/ajax_loading/19.gif","");
}

function drawFavouritesAction() {
	if(myFavouritesRequest.readyState==4) {
		if(myFavouritesRequest.status==200) {
			//alert("Favourites");
			document.getElementById(sideMenuContainer).innerHTML=myFavouritesRequest.responseText;
		}
		else {
			alert("Connection Problem:"+myFavouritesRequest.statusText);
		}
	}
}

/************************************************************************/
/*                           Context MenuBar                            */
/************************************************************************/
//Current Menu parent
var myCurrentMenuParent=0;
//Handle to current MenuBar
var currentMenuBar=null;
//Handle to current Context Menu Model
var currentContextModel=null;

var myContextMenuArray=new Array();				//To create menu model
var myContextMenuBlockedList=new Array();		//List of blocked menu items
//This Object stores all the properties of a menu-item, not used
var myContextMenuObject=function (content) {
	this.content=Array();
	for(var i=0;i<content.length;i++)
	{
		this.content[i]=""+content[i];
	}
};


//Initiates the Ajaxt call
//Takes a callback function as it's parameter
var myContextMenuRequest=getHTMLHTTPRequest();
function callContextMenuAjax(id, fn)
{
	//Reinitialize Global Variables
	myCurrentMenuParent=id;
	currentMenuBar=null;
	currentContextModel=null;
	myContextMenuArray=null;
	myContextMenuBlockedList=null;

	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MenuXml?method=getmenu&id="+id+"&rand="+myRandom;
	myContextMenuRequest.open("GET",url,true);

	/* This function processes the response */
	if(fn==null) fn=contextMenuCallBack;
	myContextMenuRequest.onreadystatechange=fn;
	/* Send a new request */
	myContextMenuRequest.send(null);
}

//Dummy callback function
var contextMenuCallBack=function()
{
	if(myContextMenuRequest.readyState==4) {
		if(myContextMenuRequest.status==200) {
			//We will configure the context menu first
			configureContextMenu();
			//Now we can do the real stuff like populating the table
			//callAssemblyAjax(1);
		}
		else {
			alert("Connection Problem:"+myContextMenuRequest.statusText);
		}
	}
};
/*-------------------------------------------------------------*/
/*
 * Helper Functions
 */
//Gets context the menu items from succesful Ajax call
var configureContextMenu=function(msgContainer)
{
	var request=myContextMenuRequest;
	var xmlDoc=request.responseXML;
	if(xmlDoc==null) {alert("Data Error");return;}
	var systemMsg=xmlDoc.getElementsByTagName("status");
	var errorFlag=systemStatus(msgContainer,systemMsg);
	if(errorFlag==0) return;

	populateContextMenuConfig(xmlDoc);
};

//Returns array of Context menu Items and their parameters
var populateContextMenuConfig=function(xmlDoc)
{
	myContextMenuArray=new Array();
	myContextMenuBlockedList=new Array();
	var content=xmlDoc.getElementsByTagName("menuitem");
	var x=0;
	for(var i=0;i<content.length;i++)
	{
		var param=Array();
		param[0]=content[i].getAttribute("id");
		param[1]=content[i].getAttribute("parent");
		param[2]=content[i].getAttribute("name");
		param[3]=content[i].getAttribute("description");
		param[4]=content[i].getAttribute("image");
		param[5]=content[i].getAttribute("action");
		param[6]=content[i].getAttribute("link");
		param[7]=content[i].getAttribute("status");
		param[8]=content[i].getAttribute("width");
		param[9]=content[i].getAttribute("permission");

		//Add this item into an array which stores all configuration
		//data for processing
		myContextMenuArray[i]=param;
		//If this item is blocked put it in the blocked list
		if(parseInt(param[9])!=0)
		{
			myContextMenuBlockedList[x]=parseInt(param[0]);
			x++;
		}
	}
};

//Creates the model for context menu, and returns it
//Stores the model in a global variable
var configureContextMenuModel=function()
{
	if(currentContextModel!=null) return currentContextModel;
	var menuModeTTbody = new DHTMLSuite.menuModel();
	for(var i=0;i<myContextMenuArray.length;i++)
	{
		setContextMenuItem(myContextMenuArray[i],menuModeTTbody,0);
	}
	menuModeTTbody.init();
	currentContextModel=menuModeTTbody;
	return currentContextModel;
};


//Populates context menu items
var setContextMenuItem=function(param,model,unique)
{
	var menuId=param[0];
	var menuParentId=param[1];
	var menuName=param[2];
	var menuDescription=param[3];
	var menuImage=param[4];
	var menuAction=param[5];
	var menuLink=param[6];
	var subMenuWidth=param[8];
	var permission=param[9];

	if(parseInt(menuParentId)==myCurrentMenuParent)
		menuParentId=false;
	else
		menuParentId=unique+parseInt(menuParentId);
	if(parseInt(menuId)==myCurrentMenuParent)
		return;
	else
		menuId=unique+parseInt(menuId);

	if(menuName=='-') {
		if(menuParentId==false)
			model.addSeparator();
		else
			model.addSeparator(menuParentId);
		return;
	}
	if(menuName!='-') {
		model.addItem(menuId,menuName,menuImage,menuLink,menuParentId,menuDescription,menuAction);
		if(subMenuWidth!=0)
			model.setSubMenuWidth(menuId,subMenuWidth);
	}
};


/*-------------------------------------------------------------*/
/*
 * Functions for micro-management of the menu
 */
//Returns true if the menu item is blocked for the user
var isInBlockedList=function(id, list)
{
	var flag=false;
	var menuItem=parseInt(""+id);
	for(var i=0;i<list.length;i++)
	{
		if(list[i]==id) {
			//alert(id+" is blocked");
			flag=true;
			break;
		}
	}
	return flag;
};

//Enable Menu Item
var enableMenuItem=function(id, list, menubar)
{
	//if(isInBlockedList(id,list))
	//menubar.setMenuItemState(id,'disabled');
	//else 
	menubar.setMenuItemState(id,'regular');
};

//Disable Menu Item: item is visible, but disabled
var disableMenuItem=function(id, list, menubar)
{
	menubar.setMenuItemState(id,'disabled');
};

//Show Menu Item
var showMenuItem=function(id, menubar)
{
	if(menubar==null)
		menubar=currentMenuBar;
	menubar.showMenuItem(id);
};

//Hide Menu Item
var hideMenuItem=function(id, menubar)
{
	if(menubar==null)
		menubar=currentMenuBar;
	menubar.hideMenuItem(id);
};

//Sets Menu state to regular/disabled
var setMenuItemState=function(id,state,menubar)
{
	if(menubar==null)
		menubar=currentMenuBar;
	if(state=='disabled')
		disableMenuItem(id,null,menubar);
	else if(state=='regular')
		enableMenuItem(id,null,menubar);
};

//Must be called at the bottom to enforce Menu-Permissions
var setMenuPermissions=function(menubar,list)
{
	if(list==null)
		list=myContextMenuBlockedList;
	for(var i=0;i<list.length;i++)
	{
		menubar.setMenuItemState(list[i],'disabled');
	}
};