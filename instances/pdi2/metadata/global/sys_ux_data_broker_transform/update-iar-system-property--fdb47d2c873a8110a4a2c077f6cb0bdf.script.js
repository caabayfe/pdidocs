function transform(input) {
	var iarStatus = gs.getProperty(input.prop_name) === "true" ? true : false;
    if (input.prop_name !== "" && input.prop_value !== "" && input.prop_value !== iarStatus) {
        var aceUtil = new global.ACEAppBuilderGlobalScopedUtil();
        aceUtil.updateRecord("sys_properties", "b592097d531210107a1cddeeff7b120c", {
            value: input.prop_value
        });
    }
	return [];
}
