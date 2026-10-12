function transform(input) {
    var userId = input.user_id;
	var classifications = [];
    var userExpSettingGr = new GlideRecord("sn_vsc_export_setting");
    userExpSettingGr.addQuery('user', userId);
    userExpSettingGr.query();
    if (userExpSettingGr.next()) {
        classifications = userExpSettingGr.classification_metric.toString().split(",");
    }
	return classifications == "" ? [] : classifications;
}
