var s = current.table_name.toString();

s = s.toLowerCase();
s = replaceAll(s, " ", "_");

var db = GlideDBObjectManager.get();
if (db.getAbsoluteBase(s) != "sys_import_set_row") {
  if (GlideTableDescriptor.isValid(s)) {
    current.table_name.setError("Import set table must be an extension of sys_import_set_row");
    current.setAbortAction(true);
  }
} else {
  current.table_name = s;
}

function replaceAll(str, from, to) {
  var idx = str.indexOf( from );

  while ( idx > -1 ) {
   str = str.replace( from, to ); 
   idx = str.indexOf( from );
  }
  
  return str;    
}
