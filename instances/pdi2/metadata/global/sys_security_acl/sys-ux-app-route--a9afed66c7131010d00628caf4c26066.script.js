if (UxFrameworkScriptables.evaluateRoutePermission(current.getUniqueValue(), current.getValue("parent_macroponent"), "write")) {
	answer = true;
} else {
	var gr = new GlideRecord("sys_ux_macroponent");
	gr.get(current.parent_macroponent);
	answer = gr.isValidRecord() && gr.canWrite();
}
