/**********************************************************/
/*
 * Calendar
 */
var calendarObjForForm=null;
var initCalendar=function() {
	calendarObjForForm = new DHTMLSuite.calendar({/*minuteDropDownInterval:10,numberOfRowsInHourDropDown:5,*/callbackFunctionOnDayClick:'getDateFromCalendar',isDragable:true,displayTimeBar:false});
	calendarObjForForm.setCallbackFunctionOnClose('myOtherFunction');
};

function myOtherFunction()
{


}
function pickDate(buttonObj,inputObject,xOffset)
{
	if(xOffset==null) xOffset=0;
	calendarObjForForm.setCalendarPositionByHTMLElement(inputObject,xOffset,inputObject.offsetHeight+2);	// Position the calendar right below the form input
	calendarObjForForm.setInitialDateFromInput(inputObject,'dd/mm/yyyy');	// Specify that the calendar should set it's initial date from the value of the input field.
	calendarObjForForm.addHtmlElementReference('myDate',inputObject);	// Adding a reference to this element so that I can pick it up in the getDateFromCalendar below(myInput is a unique key)
	if(calendarObjForForm.isVisible()){
		calendarObjForForm.hide();
	}else{
		calendarObjForForm.resetViewDisplayedMonth();	// This line resets the view back to the inital display, i.e. it displays the inital month and not the month it displayed the last time it was open.
		calendarObjForForm.display();
	}		
}

function pickDateForWork(buttonObj,inputObject)
{
	calendarObjForForm.setCalendarPositionByHTMLElement(inputObject,-120,inputObject.offsetHeight+2);	// Position the calendar right below the form input
	calendarObjForForm.setInitialDateFromInput(inputObject,'dd/mm/yyyy');	// Specify that the calendar should set it's initial date from the value of the input field.
	calendarObjForForm.addHtmlElementReference('myDate',inputObject);	// Adding a reference to this element so that I can pick it up in the getDateFromCalendar below(myInput is a unique key)
	if(calendarObjForForm.isVisible()){
		calendarObjForForm.hide();
	}else{
		calendarObjForForm.resetViewDisplayedMonth();	// This line resets the view back to the inital display, i.e. it displays the inital month and not the month it displayed the last time it was open.
		calendarObjForForm.display();
	}		
}

function getDateFromCalendar(inputArray)
{
	var references = calendarObjForForm.getHtmlElementReferences(); // Get back reference to form field.
	references.myDate.value =inputArray.day+'/'+inputArray.month+'/'+inputArray.year; //+ ' ' + inputArray.hour + ':' + inputArray.minute;
	calendarObjForForm.hide();	

}