function setAction(action) {
   var e = gel('repeating_item_all');
   var gWindow = GlideDialogWindow.prototype.locate(e);
   gWindow.userAction = action;
   gWindow.destroy();
} 
