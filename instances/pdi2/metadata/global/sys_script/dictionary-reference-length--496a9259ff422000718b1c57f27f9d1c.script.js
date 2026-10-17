/**
 *  Each record in ServiceNow is identified by a unique 32-character GUID (Globally Unique ID) called a sys_id.
 *  Reference type fields by default hold the sys_id of the referenced record which requires 32 characters.  If
 *  however a reference key is specified, the max length can be arbitrarily large.
 *  New dictionary Reference type fields always get a Max length = 32
 *  Updated Reference type fields maintain the Max length unless reference key is specified.
 */
var referenceKey = current.reference_key || "";
var cml = current.max_length;
if (current.operation() == 'insert') {
   if (cml < 32 || (cml > 32 && referenceKey == "")) {
      current.max_length = 32;
      referenceLengthLog(true);
   }
} else {
   var pml = previous.max_length;
   if (cml > 32 && pml < cml && referenceKey == "") {
      current.max_length = previous.max_length;
      referenceLengthLog(false);
   }
}

function referenceLengthLog(insert) {
   var msg = "";
   var msgArray = new Array();
   msgArray.push("'" + current.element + "'");
   msgArray.push("'" + current.name + "'");
   if (insert)
      msg = "Reference type field {0} in table {1} inserted with a max length of 32. Reference type fields hold the sys_id of the reference record which is a 32-character GUID";
   else
      msg = "Maximum length cannot be increased on a Reference type field. Column {0} in table {1} not modified.";
   
   msg = gs.getMessage(msg, msgArray);
   if (!gs.isPaused())
      gs.addInfoMessage(msg);
   
   gs.print("Dictionary reference length (Business Rule):  " + msg);
}
