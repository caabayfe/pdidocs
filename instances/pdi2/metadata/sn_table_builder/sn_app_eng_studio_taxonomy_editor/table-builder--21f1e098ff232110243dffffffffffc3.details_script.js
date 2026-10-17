(function(file) {
    // The application file being operated on is called 'file'. The function must return an object.
    // The object's keys will override any calculated values from the configuration.
    // Keys available to override are: name, description, launch_url, editor_url
    // The fields name, description, and type should be translated values
    var table = sn_flow.AssociatedFlows.getTableForFlow(file.sys_id);
    var url = '/now/build/form/main/params/table/' + table + '/page/flows/view/Default%20view/context/aes/flow/' + file.sys_id;

    return {
        editor_url: url,
        group_id: table
    };
})(globalFileObjectRecord);
