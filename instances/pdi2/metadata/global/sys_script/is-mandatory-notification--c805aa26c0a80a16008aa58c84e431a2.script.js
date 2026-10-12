function isMandatoryNotification() {
gs.log('### Running mandatory check... ' + current.notification_message.mandatory);
   if (current.notification_message.mandatory == true) {
      return true;
   }
   
   return false;
}
