/**
 Service-now.com
 
 Description: Notification events for live messages
 **/
processLikeInsertEvents();

function processLikeInsertEvents(){
   //only notify users
   if (current.message.profile.type != "user")
      return;
      
    //get the user sys_id who posted the liked message  
    var userId = current.message.profile.document;
    gs.eventQueue("live_message_like.inserted", current, userId);
}
