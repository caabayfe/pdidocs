clearDuplicateCIDuplicateOf();
 
function clearDuplicateCIDuplicateOf()  {

	if (current == null || current.duplicate_ci == null)
		return;

	var ci = new GlideRecord("cmdb_ci");
	if (ci.get(current.duplicate_ci)) {
		var duplicate_of = ci.duplicate_of;
		if (!duplicate_of.nil()) {
			ci.duplicate_of = "";
			ci.update();
		}
	}
}
