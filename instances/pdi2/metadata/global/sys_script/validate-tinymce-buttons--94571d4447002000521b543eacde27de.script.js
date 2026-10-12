var validButtons = "," + gs.getProperty('glide.ui.html.editor.toolbar.valid.buttons') + ",";
var selectedButtonTokens = current.value.split( "," );
var newValue = "";
var invalidButtons = "";
for (i = 0; i < selectedButtonTokens.length; i++){
   var button = selectedButtonTokens[i].trim();
   var invalidButton = '';

   if (button.length == 0)
	  invalidButton = '[BLANK]';
   else if (button === ',')
      invalidButton = ',';
   else if (button != '|')
      invalidButton = validButtons.indexOf("," + button + ",") > -1 ? '' : button;
   
   if (invalidButton == '') {
      if (newValue != ""){
         newValue += ",";
      }
      newValue += button;
   } else {
      if (invalidButtons != ""){
         invalidButtons += ",";
      }
      invalidButtons += invalidButton;
   }
}
if (invalidButtons != ""){
   gs.addErrorMessage(gs.getMessage('Toolbar button list included the following invalid buttons (had been removed): ') + invalidButtons);
   current.value = newValue;
}
