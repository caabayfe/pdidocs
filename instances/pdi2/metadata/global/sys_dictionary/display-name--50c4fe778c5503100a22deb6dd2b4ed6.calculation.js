var values = [current.allocated_to.getDisplayValue() + ' -' , current.assigned_to.getDisplayValue(), '('+current.licensed_by.model.getDisplayValue()+')'];
var display_name = "";

for (var x=0;x<values.length;x++) {
  if (values[x] != undefined && values[x] != "" && values[x] != " -" && values[x] != "()") {
    display_name = display_name + ' ' + values[x];
  }
}

current.display_name = display_name.trim();
