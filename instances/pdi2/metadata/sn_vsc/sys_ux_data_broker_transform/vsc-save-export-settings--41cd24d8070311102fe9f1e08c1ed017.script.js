function transform(input) {
    var userName = input.user_id;
    var resultData = input.data || {};
    var dataClasses = [];
    var classificationSettings = [];
    for (var i in resultData) {
        var dataClass = new GlideRecord("data_classification");
        dataClass.addQuery("sys_id", resultData[i]);
        dataClass.query();
        while (dataClass.next()) {
            var name = dataClass.getDisplayValue("name").toString();
            dataClasses.push(name);
        }
    }
    // Fetch export setting for valid users only
    var userGr = new GlideRecord("sys_user");
    userGr.get(userName);
    if (userGr.isValidRecord()) {
        // Fetch the user's classification settings
        var userExpSettingGr = new GlideRecord("sn_vsc_export_setting");
        userExpSettingGr.addQuery('user', userName);
        userExpSettingGr.query();
        if (!userExpSettingGr.next()) {
            // Create new record for user if it doesn't exist
            userExpSettingGr.initialize();
            userExpSettingGr.user = userName;
            userExpSettingGr.classification_metric = dataClasses.toString();
            userExpSettingGr.insert();
        } else {
            //update record
            userExpSettingGr.classification_metric = dataClasses.toString();
            userExpSettingGr.update();
        }
    }
}
