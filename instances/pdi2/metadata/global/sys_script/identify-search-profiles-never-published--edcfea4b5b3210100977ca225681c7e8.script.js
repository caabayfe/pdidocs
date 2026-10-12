(function executeRule(current, previous /*null when async*/ ) {
    if (!gs.isInteractive())
        return;

    var action = gs.action;

    if (!action.hasGlideURI())
        return;

    var index = action.getGlideURI().toString().indexOf('ais_search_profile_list');

    if (index == 0) {
        gs.flushMessages();
        var icon = "<span style=\"background-image: url('indicator-ais.svg');background-repeat: no-repeat;padding-right: 16px;\">&nbsp;</span>";
        gs.addInfoMessage(gs.getMessage("{0} Search Profiles marked with this icon have never been published. Edit each and click Publish to ensure their configurations are available", [icon]));
    }
})(current, previous);
