//
// Set the display value for the metric field
//
if (current.table.nil() && current.field.nil() && current.id.nil())
   current.value = current.field_value;
else {
   var dv = new GlideRecord(current.table); 
   dv.get(current.id); 
   dv[current.field] = current.field_value; 
   current.value = dv[current.field].getDisplayValue()
}
