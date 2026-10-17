/**
 @Param event - GlideRecord representing the event after transform. This is a temporary object. ID of the original event is in the origEventSysId parameter below
 @Param alert - GlideRecord representing the alert that will be created. The configuration item can be retrieved from this alert.
  @Param origEventSysId - Id of the event. The GlideRecord 'event' parameter is a temporary object, and therefore does not contain the id of the original event.
*/
(function postBindUpdate(event, alert, origEventSysId){
    gs.log('PostBind_Update custom script is active'); 
	// In this part of the function make any changes to alert using glide record interface. E.g:
	// alert.setValue('source', 'new source');
	
	// To abort alert creation return false;
	// returning a value other than boolean will result in an error
    return true;
 })(event, alert, origEventSysId);
