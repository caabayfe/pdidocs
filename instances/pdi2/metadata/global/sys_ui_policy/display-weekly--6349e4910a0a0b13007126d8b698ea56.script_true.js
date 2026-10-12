function onCondition() {
    //We do not want to remove Display weekly rule but it clashes with another new
    //rule related to advanced and undoes it. Adding this check here to stop that.
    var val = g_form.getValue("advanced");
    if(!isEmpty(val)) {
        var type = g_form.getValue("run_type");
        if(type == "weekly") {
            g_form.setDisplay("run_dayofweek", false);
        }
    }

    function isEmpty(str) {
        return (!str || str.length === 0 );
    }
}
