function transform(input) {
    var id = input && input.sys_id;
    if (!id) return {};
    var gr = new GlideRecord("sn_vsc_security_policy");
    if (gr.get(id)) {
      return {
        "name" : gr.getDisplayValue(),
        "updated" : gr.getDisplayValue("sys_updated_on"),
        "updated_by" : gr.getDisplayValue("sys_updated_by"),
        "created" : gr.getDisplayValue("sys_created_on"),
        "created_by" : gr.getDisplayValue("sys_created_by")
      };
    } else {
      return {};
    }
}
