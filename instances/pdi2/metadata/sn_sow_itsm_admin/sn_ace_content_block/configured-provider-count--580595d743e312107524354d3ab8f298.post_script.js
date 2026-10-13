(function(context, pageParams, blockcontext, dataParams) {
    function getRecordCount() {
        try {
            var ga = new GlideAggregate("notify_group_selector");
            ga.addAggregate("COUNT");
            ga.addQuery("active", true);
            ga.query();
            return ga.next() ? ga.getAggregate("COUNT") : 0;
        } catch (err) {
            gs.error(err);
        }
        return 0;
    }

    var recordCount = getRecordCount();
    var text = (recordCount == 0) ? sn_i18n.Message.getMessage("sn_sow_itsm_admin", "No provider configured") : sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Provider configured ({count})", {
        count: recordCount
    });
    context.props_details.html = "<span style=\"background-color: RGB(var(--now-alert--low--background-color, 219, 219, 222, 1));border-radius: .125rem; padding: 0rem .25rem .125rem .125rem;\">" + text + "</span>";
})(context, pageParams, blockcontext, dataParams);
