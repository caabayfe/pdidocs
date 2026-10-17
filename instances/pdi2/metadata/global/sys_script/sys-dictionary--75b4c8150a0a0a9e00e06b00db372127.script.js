// if this is not a new entry, the table name and 
// the element name cannot be written
function sys_dictionary_nameCanWrite() {
  if (current.isNewRecord()) 
    return; 

  return false;
}

function sys_dictionary_elementCanWrite() {
  if (current.isNewRecord()) 
    return; 

  return false;
}
