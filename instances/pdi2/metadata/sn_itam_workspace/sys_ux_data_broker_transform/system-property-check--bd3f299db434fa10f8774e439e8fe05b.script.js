function transform(input) {
    try {
        var propName = input.sysPropName;
        if (!propName) {
            gs.warn("System property name not provided to data broker!");
            return false;
        }

        var gr = new GlideRecordSecure('sys_properties');
        if (!gr.get('name', propName)) {
            return false;
        }

        // Read the property value directly from the record to enforce ACLs
        var value = gr.getValue('value');
        return value && value.toLowerCase() === "true";
    } catch (e) {
        gs.error("Error fetching System property: " + e.message);
        return false;
    }
}
