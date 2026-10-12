if (current.operation() == 'insert') {
  autoInsert();
}
if (current.operation() == 'delete') {
  autoDelete();
}


function autoInsert() {
  var labelTable = new GlideRecord("label_table");
  labelTable.get(current.table);
  var tableName = labelTable.table;
  var labelID = current.label;
  var grTable = new GlideRecord(tableName);
  grTable.addEncodedQuery(labelTable.conditions);
  grTable.query();
  while (grTable.next()) {
    var grLE = new GlideRecord("label_entry");
    grLE.addQuery("label", labelID);
    grLE.addQuery("table_key", grTable.sys_id);
    grLE.query();
    while (grLE.next()) 
       grLE.deleteRecord();  
    grLE.initialize();
    grLE.label = labelID;
    grLE.table = tableName;
    grLE.table_key = grTable.sys_id;
    grLE.title = grTable.getClassDisplayValue() + ' - ' + grTable.getDisplayValue(); 
    grLE.auto = labelTable.sys_id; 
    grLE.read = 'yes'; 
    grLE.insert();
  }
}

function autoDelete() {
  if (current.table) {
    var labelEntry = new GlideRecord("label_entry");
    labelEntry.addQuery("auto", current.table);
    labelEntry.query();
    while (labelEntry.next()) {
       labelEntry.deleteRecord();
    }
  }
}
