if (current.first_name.nil() && current.last_name.nil() && !current.name.nil()) {
  var names = current.name.toString().split(" ");
  if (names.length > 1) {
    current.first_name = names[0];
    names.shift();
    current.last_name = names.join(" ");
  } else 
    current.last_name = names[0];
}  

if(current.first_name.nil()) { 
    current.last_name; 
  } else { 
    current.first_name + ' ' + current.last_name;
  }
