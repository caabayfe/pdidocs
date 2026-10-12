(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    current.setValue("label", current.getValue("name"));
    current.setValue("calendar_name", current.getValue("name"));

})(current, previous);
