current.update();
action.setRedirectURL(current);
var item = current.related_list.toString();
updateFloats(item);

function updateFloats(item) {  
  var d = getDictionaryEntry(item);
  if (d == null)
	return;     
  d.reference_floats = true;
  d.update();
}
