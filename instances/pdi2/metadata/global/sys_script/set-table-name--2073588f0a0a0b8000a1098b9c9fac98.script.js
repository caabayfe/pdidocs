var s = current.import_set_table_name.toString();

s = s.toLowerCase();
s = replaceAll(s, " ", "_");

var db = GlideDBObjectManager;
if (db.getAbsoluteBase(s) != "sys_import_set_row") {
  var td = GlideTableDescriptor;
  if (td.isValid(s)) {
    current.import_set_table_name.setError("Import set table must be an extension of sys_import_set_row");
    current.setAbortAction(true);
  }
} else {
  current.import_set_table_name = s;
}

function replaceAll(str, from, to) {
  var idx = str.indexOf( from );

  while ( idx > -1 ) {
   str = str.replace( from, to ); 
   idx = str.indexOf( from );
  }
  
  return str;    
}
