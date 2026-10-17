/** 
* ServiceNow
*
* Description: The idea of this script is to prevent any input apart from alphanumeric
*	characters for view names
**/

var viewManager = new GlideScriptViewManager(current.view);

if (!viewManager.isValidViewName(current.view)) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("A view name can only contain alphanumeric characters"));
}
