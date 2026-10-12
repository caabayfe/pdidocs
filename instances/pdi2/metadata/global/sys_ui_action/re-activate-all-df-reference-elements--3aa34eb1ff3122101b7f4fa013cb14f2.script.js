var td = GlideTableDescriptor.get(current.name);
if (td.isValid()) {
	GlideDataFabricEngineService.getInstance().showAllDataFabricElementDescriptors(current.name);
}
else
	gs.addErrorMessage("TableDescriptor for the element returned invalid");

action.setRedirectURL(current);
