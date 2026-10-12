var DataInterfaceAjax = Class.create();

DataInterfaceAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    VALID_FIELD_NAME_REGEX: /^[a-zA-Z_][a-zA-Z0-9_]*$/,

    /**
     * Returns the interface name and implementation entity name for a given binding.
     *
     * @param {string} sysparm_binding_id - sys_id of a sys_data_interface_impl_m2m record
     * @returns {string} JSON object with 'interface_name' and 'implementation_name', or null if invalid
     */
    getBindingTableNames: function () {
        var bindingId = this.getParameter('sysparm_binding_id');
        if (!GlideStringUtil.isEligibleSysID(bindingId))
            return null;

        return SNC.DataInterfaceAPI.getBindingTableNames(bindingId);
    },

	/**
     * Returns a JSON array of fields on the implementation entity for a given binding.
     * Each entry has 'name' (stored value) and 'label' (display value).
     *
     * @param {string} sysparm_binding_id - sys_id of a sys_data_interface_impl_m2m record
     * @returns {string} JSON array string, or null if invalid
     */
    getImplementationFields: function () {
        var bindingId = this.getParameter('sysparm_binding_id');
        if (!GlideStringUtil.isEligibleSysID(bindingId))
            return null;

        return SNC.DataInterfaceAPI.getImplementationFields(bindingId);
    },

    /**
     * Returns a JSON array of interface fields for a given binding.
     * Each entry has 'name' (stored value) and 'label' (display value).
     *
     * @param {string} sysparm_binding_id - sys_id of a sys_data_interface_impl_m2m record
     * @returns {string} JSON array string, or null if invalid
     */
    getInterfaceFields: function () {
        var bindingId = this.getParameter('sysparm_binding_id');
        if (!GlideStringUtil.isEligibleSysID(bindingId))
            return null;

        return SNC.DataInterfaceAPI.getInterfaceFields(bindingId);
    },

    /**
     * Returns a JSON array of implementation fields compatible with a given interface field.
     * Filters by SQL type compatibility and reference compatibility.
     *
     * @param {string} sysparm_binding_id - sys_id of a sys_data_interface_impl_m2m record
     * @param {string} sysparm_field_name - name of the selected interface field
     * @returns {string} JSON array string, or null if invalid
     */
    getCompatibleImplementationFields: function () {
        var bindingId = this.getParameter('sysparm_binding_id');
        var fieldName = this.getParameter('sysparm_field_name');
        if (!GlideStringUtil.isEligibleSysID(bindingId))
            return null;
        if (!this.VALID_FIELD_NAME_REGEX.test(fieldName))
            return null;

        return SNC.DataInterfaceAPI.getCompatibleImplementationFields(bindingId, fieldName);
    },

    type: 'DataInterfaceAjax'
});
