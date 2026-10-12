(function() {

    var localInput = input; //to safeguard pullution of "input" via BR or other scripts
    var itemsObj;
    if (localInput && localInput.action === "remove_item") {
        var cartRecord = new sn_sc.CartJS('draft_items');
        cartRecord.remove(localInput.removeItemID);
        itemsObj = getDraftItems(localInput.prevLimit);
        data.draftItems = itemsObj.items;
        data.hasMoreDrafts = itemsObj.hasMore;
        if (!gs.nil(localInput.attachmentTable))
          new global.GlobalServiceCatalogUtil().deleteAttachments(localInput.attachmentTable, localInput.removeItemID);

        return;
    }

    if (localInput && localInput.action == "fetch_more_draft_items") {
        itemsObj = getDraftItems(localInput.prevLimit + 100);
        data.draftItems = itemsObj.items;
        data.hasMoreDrafts = itemsObj.hasMore;
        return;
    }

    var alsoRequest = false;

    var msg = data.messages = {};
    msg.myRequestsTitle = options.title ? gs.getMessage(options.title) : gs.getMessage('My Requests');
    msg.openRequests = gs.getMessage('Open requests');
    msg.closedRequests = gs.getMessage('Closed requests');
    msg.showMoreRequests = gs.getMessage('Show More Requests');
    msg.requestsTabLabel = gs.getMessage("Submitted requests");
    msg.draftsTabLabel = gs.getMessage("Drafts");
	msg.noResultsFound = gs.getMessage("You do not have any requests");
	msg.noSearchResultsFound = gs.getMessage("Search didn't match any requests");
    data.filterMsg = gs.getMessage("Search open requests");
    data.draftFilterMsg = gs.getMessage("Search draft items");
    data.draftItemsMsg = gs.getMessage("Draft Items");
    data.deleteDraftItemMsg = gs.getMessage("Are you sure you want to delete the draft item?");
    data.dialogCancel = gs.getMessage('Cancel');
    data.dialogDelete = gs.getMessage('Delete draft');
    data.draftSearchText = $sp.getParameter("draftSearchText");
    var selectDraftTab = $sp.getParameter('selectDraftTab');
    //localInput will be undefined only on the first load.
    if (gs.nil(localInput)) {
        data.isRequestsTabActive = !data.draftSearchText && !selectDraftTab;
        data.isDraftsTabActive = !!data.draftSearchText || selectDraftTab;
    } else {
        data.isRequestsTabActive = true;
        data.isDraftsTabActive = false;
    }
    if (gs.nil(data.draftSearchText))
        data.draftSearchText = "";
    else
        data.draftSearchText = decodeURIComponent(data.draftSearchText);

    data.hide_draft_tab = (gs.getProperty('glide.sc.disable.save_as_draft') == 'true') || (gs.getProperty('glide.sc.enable.save_as_draft.portal.' + $sp.getPortalRecord().getValue("url_suffix")) != 'true');

    var recordTable = options.record_table || $sp.getParameter("table");
    var recordId = options.record_id || $sp.getParameter("sys_id");

    data.is_associated_ticket_tab = options.is_associated_ticket_tab;

    if (localInput && localInput.view === 'open')
        data.filterMsg = gs.getMessage("Search open requests");
    else if (localInput && localInput.view === 'close')
        data.filterMsg = gs.getMessage("Search closed requests");

    data.is_new_order = (($sp.getParameter("is_new_order") + '') === "true");
    data.requestSubmitMsg = gs.getMessage('Thank You. Your request has been submitted');
    var draftItemsObj = getDraftItems(100);
    data.draftItems = draftItemsObj.items;
    data.hasMoreDrafts = draftItemsObj.hasMore;

    function getDraftItems(limit) {
        var userID = gs.getUser().getID();
        var cart = new SPCart("draft_items", userID);

        if (!gs.nil(cart) && typeof cart.getItemsWithPagination === "function")
            itemsObj = cart.getItemsWithPagination('sys_updated_on', limit);
        else {
            gs.info("Drafts tab is hidden as we are either unable to fetch the draft cart or the SPCart script include is customized.");
            data.hide_draft_tab = true;
            itemsObj = {};
        }

        return itemsObj;
    }

    function getField(gr, name) {
        var f = {};
        var id = gr.getUniqueValue();
        gr = new GlideRecord(gr.getRecordClassName());
        gr.get(id);
        f.display_value = gr.getDisplayValue(name);
        f.value = gr.getValue(name);
        var ge = gr.getElement(name);
        if (ge) {
            var ed = ge.getED();
            if (ed)
                f.type = ed.getInternalType();
            f.label = ge.getLabel();
        }
        return f;
    }

    function getMyRequestSysIds() {
        var ids = {};
        var rq_filter = new GlideRecord('request_filter');
        rq_filter.addActiveQuery();
        if (rq_filter.isValidField('applies_to'))
            rq_filter.addQuery('applies_to', 1).addOrCondition('applies_to', 10);
        rq_filter.query();
        while (rq_filter.next()) {
            var tableName = rq_filter.table_name;
            if (rq_filter.isValidField('table'))
                tableName = rq_filter.table;
            var gr = new GlideRecord(tableName);
            if (!gr.isValid())
                continue;

            gr.addQuery(rq_filter.filter);
            gr.enableSecurityFeature('data_filter');
            gr.query();
            if (tableName == 'sc_request')
                alsoRequest = true;
            while (gr.next()) {
                var portalSettings = {};
                portalSettings.page = rq_filter.portal_page.nil() ? '' : rq_filter.portal_page.getDisplayValue() + '';
                portalSettings.primary_display = rq_filter.primary_display.nil() ? '' : rq_filter.primary_display + '';
                portalSettings.secondary_displays = rq_filter.secondary_display.nil() ? '' : rq_filter.secondary_display + '';
                ids[gr.sys_id + ''] = portalSettings;
            }
        }
        return ids;
    }

    // retrieve the request's
    var myRequestMap = getMyRequestSysIds();
    var taskIDs = Object.keys(myRequestMap);

    var gr = new GlideRecordSecure('task');

    if (!data.is_associated_ticket_tab) {
        if (localInput && localInput.view === 'open')
            gr.addActiveQuery();
        else if (localInput && localInput.view === 'close')
            gr.addQuery('active', 0);
        else
            gr.addActiveQuery();
    } else {
        if (recordTable != 'universal_request') {
            //Check if universal_request field is present and it is a universal request
            var taskRecord = new GlideRecordSecure('task');
            taskRecord.get(recordId);
            if (taskRecord.isValid() && !taskRecord.universal_request.nil()) {
                var qc = gr.addQuery('parent', taskRecord.universal_request);
                qc.addOrCondition('parent', 'IN', new sn_uni_req.UniversalRequestUtilsSNC().getChildRequests(taskRecord.universal_request));
            } else
                gr.addQuery('parent', recordId);
        } else {
            var qc = gr.addQuery('parent', recordId);
            qc.addOrCondition('parent', 'IN', new sn_uni_req.UniversalRequestUtilsSNC().getChildRequests(recordId));
        }
    }

    gr.orderByDesc('sys_updated_on');
    if (localInput && localInput.search_text) {
        var req = [];
        var task = new GlideRecordSecure('task');
        task.addQuery('123TEXTQUERY321', localInput.search_text);
        if (localInput && localInput.view === 'open')
            task.addQuery('active', 1);
        else if (localInput && localInput.view === 'close')
            task.addQuery('active', 0);
        else
            task.addQuery('active', 1);
        task.addQuery('sys_id', taskIDs);
        task.query();

        while (task.next())
            req.push(task.getUniqueValue());

        var ritmGR = new GlideRecord('sc_req_item');
        if (alsoRequest && ritmGR.isValid()) {
            if (localInput && localInput.view === 'open')
                ritmGR.addQuery('request.active', 1);
            else if (localInput && localInput.view === 'close')
                ritmGR.addQuery('request.active', 0);
            else
                ritmGR.addQuery('request.active', 1);
            ritmGR.addQuery('123TEXTQUERY321', localInput.search_text);
            ritmGR.addQuery('request.sys_id', taskIDs);
            ritmGR.query();
            while (ritmGR.next())
                req.push(ritmGR.getValue('request'));
        }
        gr.addQuery('sys_id', req);
    } else
        gr.addQuery('sys_id', taskIDs);

    gr.enableSecurityFeature('data_filter');
    gr.query();

    data.request = {};

    data.request.req_list = [];
    var recordIdx = 0;
    var limit = options.items_per_page ? options.items_per_page : 15;
    if (localInput && localInput.action == 'fetch_more')
        data.lastLimit = localInput.lastLimit + limit;
    else
        data.lastLimit = limit;

    data.hasMore = false;
    while (recordIdx != data.lastLimit && gr.next()) {
        var portalSettings = myRequestMap[gr.getUniqueValue()];
        if (typeof portalSettings == 'undefined')
            portalSettings = {};

        var record = {};
        record.sys_id = gr.getValue('sys_id');

        if (gr.getRecordClassName() == 'sc_request') {
            var ritm = new GlideRecord("sc_req_item");
            if (!ritm.isValid())
                continue;

            ritm.addQuery("request", gr.getUniqueValue());
            ritm.query();
            if (ritm.getRowCount() == 0)
                continue;
            if (ritm.getRowCount() > 1)
                record.display_field = gs.getMessage("{0} requested items", ritm.getRowCount());
            else {
                ritm.next();
                record.display_field = ritm.cat_item.getDisplayValue() || ritm.getDisplayValue("short_description");
            }
            record.url = {
                id: portalSettings.page ? portalSettings.page : 'sc_request',
                table: 'sc_request',
                sys_id: record.sys_id
            };
        } else {
            record.display_field = portalSettings.primary_display ? getField(gr, portalSettings.primary_display).display_value : getField(gr, 'number').display_value;
            record.url = {
                id: portalSettings.page ? portalSettings.page : 'ticket',
                table: gr.getRecordClassName(),
                sys_id: record.sys_id
            };
        }
        record.display_number = getField(gr, 'number').display_value || '';
        if (portalSettings.secondary_displays) {
            record.secondary_displays = [];
            portalSettings.secondary_displays.split(",").forEach(function(sDisplay) {
                record.secondary_displays.push(getField(gr, sDisplay));
            });
        } else
            record.secondary_displays = getField(gr, 'short_description');

        record.updated_on = gr.getValue('sys_updated_on');
        record.state = gr.getDisplayValue('state');
        if ((recordIdx !== 0) && (data.lastLimit - limit === recordIdx))
            record.highlight = true;

        data.request.req_list.push(record);
        recordIdx++;
    }

    if (gr.next())
        data.hasMore = true;

})();
