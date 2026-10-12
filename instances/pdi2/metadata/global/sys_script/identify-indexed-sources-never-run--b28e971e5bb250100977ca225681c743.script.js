(function executeRule(current, previous /*null when async*/ ) {

    if (gs.isInteractive()) {
        var index = gs.action.getGlideURI().toString().indexOf('ais_datasource_list');

        if (index == 0) {
			gs.flushMessages();
			var icon = "<span class=\"icon-alert-triangle\" style=\"padding-right: 16px;\" />";
			gs.addInfoMessage(gs.getMessage("{0} Indexed Sources marked with this icon have never been fully processed. Edit each and click Index All Tables to ensure the content is available to be searched",[icon]));
        }
    }
})(current, previous);
