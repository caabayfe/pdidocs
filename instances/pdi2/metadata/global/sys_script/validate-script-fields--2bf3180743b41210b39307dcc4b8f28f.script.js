(function executeRule(current, previous /*null when async*/ ) {

    var tableDescriptor = new GlideTableDescriptor("sys_script_vtable");

    var isUpdate = false;

    // Add your code here
    if (current.insert_script.isNil()) {
        current.insert_script = tableDescriptor.getElementDescriptor("insert_script").getDefault();
        isUpdate = true;
    }
    if (current.update_script.isNil()) {
        current.update_script = tableDescriptor.getElementDescriptor("update_script").getDefault();
        isUpdate = true;
    }
    if (current.delete_script.isNil()) {
        current.delete_script = tableDescriptor.getElementDescriptor("delete_script").getDefault();
        isUpdate = true;
    }

    if (isUpdate)
        current.update();

})(current, previous);
