//This is only for UI initiated insert.  We take advantage of 'action' being 
// set incidentally earlier in the global space.  This is not ideal.  Something 
// more explicit would be great.
var action = GlideController.getGlobal("action");
if (action != null) {
	var uri = action.getGlideURI();
	var prefix = uri.get("sys_db_object.number_ref.prefix");
	var startNum = uri.get("sys_db_object.number_ref.number");
	var maxDigits = uri.get("sys_db_object.number_ref.maximum_digits");
	
	var numberRef = SNC.TableEditor.createDefaultNumberField(current, prefix, startNum, maxDigits);
	current.number_ref = numberRef;
}
