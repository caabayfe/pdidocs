/**
 @Param event - GlideRecord representing the event after transform
 @Param origEventSysId - Id of the event. The GlideRecord event parameter is a temporary object, and therefore does not contain the id of the original event.
*/
(function postTransformHandler(event, origEventSysId){
    gs.log('PostTransformHandler custom script is active'); 
	// Make any changes to the alert which will be created out of this Event
	// Note that the Event itself is immutable, and will not be changed in the database
	// event.setValue('source', 'New Source'); 

	// To abort event processing and ignore the event, return false;
	// returning a value other than boolean will result in an error
	return true;  
 })(event, origEventSysId);
