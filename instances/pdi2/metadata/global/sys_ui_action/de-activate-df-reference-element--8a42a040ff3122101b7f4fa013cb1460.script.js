var td = GlideTableDescriptor.get(current.name);
if (td.isValid()) {
	var ed = td.getElementDescriptor(current.element);
	if (ed != null)
		GlideDataFabricEngineService.getInstance().hideElementDescriptor(ed);
	else
		gs.addErrorMessage("Element not found in the TableDescriptor");
}
else
	gs.addErrorMessage("TableDescriptor for the element returned invalid");

action.setRedirectURL(current);
