var msgArray = new Array();
var columnName = !current.column_label.nil() ? current.column_label.toString() : current.element.toString();
msgArray.push('"' + columnName + '"');
var msg = gs.getMessage('Column name unchanged for field {0}. Cannot rename an existing column.', msgArray);
gs.addInfoMessage(msg);

//set the current value back to the old value
current.element = previous.element;
