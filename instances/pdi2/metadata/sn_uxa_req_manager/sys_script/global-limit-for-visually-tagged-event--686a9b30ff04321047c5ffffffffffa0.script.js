(function executeRule(current, previous /*null when async*/ ) {

    const TABLE = 'sys_uxa_event';

    // ---- helper: safely read integer system property ----
    const getIntProp = (name, defVal) => {
        const raw = gs.getProperty(name, String(defVal));
        const num = parseInt(raw, 10);
        return Number.isNaN(num) ? defVal : num;
    };

    // Read from sys_properties
    const TOTAL_APP_CAP   = getIntProp('sn_uxa_req_manager.visual_tagging.global_cap', 500);
    const PER_PAGE_CAP = getIntProp('sn_uxa_req_manager.visual_tagging.per_page_cap', 20);

    const enforceGlobal = TOTAL_APP_CAP > 0;
    const enforcePerPage = PER_PAGE_CAP > 0;

    // 1) Global limit check
    if (enforceGlobal) {
        const gaTotal = new GlideAggregate(TABLE);
        gaTotal.addQuery('type', 'IN', ['visually_tagged', 'oob_tagged']);
        gaTotal.addQuery('application_id', current.getValue('application_id'));
        gaTotal.addAggregate('COUNT');
        gaTotal.query();
        if (gaTotal.next()) {
            const totalCount = parseInt(gaTotal.getAggregate('COUNT'), 10) || 0;
            if (totalCount >= TOTAL_APP_CAP) {
                gs.addErrorMessage(
                    gs.getMessage('Maximum number of tagged events ({0}) reached for this application', TOTAL_APP_CAP)
                );
                current.setAbortAction(true);
                return;
            }
        }
    }

    // 2) Per-page limit check (application_id + page_id)
    if (enforcePerPage) {
        const appId  = current.getValue('application_id');
        const pageId = current.getValue('page_id');

        if (appId && pageId) {
            const gaPage = new GlideAggregate(TABLE);
            gaPage.addQuery('application_id', appId);
            gaPage.addQuery('page_id', pageId);
            gaPage.addQuery('type', 'visually_tagged');
            gaPage.addAggregate('COUNT');
            gaPage.query();
            if (gaPage.next()) {
                const pageCount = parseInt(gaPage.getAggregate('COUNT'), 10) || 0;
                if (pageCount >= PER_PAGE_CAP) {
                    gs.addErrorMessage(
                      gs.getMessage('Maximum number of tagged events ({0}) reached for this page', PER_PAGE_CAP)
                    );
                    current.setAbortAction(true);
                    return;
                }
            }
        }
    }


})(current, previous);
