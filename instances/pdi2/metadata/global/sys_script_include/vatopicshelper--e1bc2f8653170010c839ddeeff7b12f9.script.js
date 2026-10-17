var VATopicsHelper = Class.create();
VATopicsHelper.prototype = {
    initialize: function() {},

    getTableRecords: function(tblName, encQuery) {
        var records = [];

        var grCnt = new GlideRecordSecure(tblName);
        if (encQuery != '')
            grCnt.addEncodedQuery(encQuery);
        grCnt.query();

        while (grCnt.next())
            records.push(grCnt.getUniqueValue());
        return records;
    },

    getUserOpenTicketsMessage: function(user, incQuery, hrQuery, reqQuery, portalName, userLanguage) {
        this.portalName = portalName;
        if (gs.nil(userLanguage))
            userLanguage = vaContext.getRequesterLang();
        var ints = this.getTableRecords('incident', incQuery);
        var reqs = this.getTableRecords('sc_request', reqQuery);
        var intCnt = ints.length;
        var reqCnt = reqs.length;
        var hrCnt = 0;
        var hrCases = [];
        if (!GlidePluginManager.isActive('com.sn_hr_core'))
            hrCnt = -1;
        else {
            try { //try catch, so any cross scope error for HR doesnt interrupt the flow
                hrCases = this.getTableRecords('sn_hr_core_case', hrQuery);
                hrCnt = hrCases.length;
            } catch (e) {
                gs.info("There was an error processing HR cases:" + e);
            }
        }

        var msg = '';

        var incUrl = this._getSPUrl('incident', incQuery, ints);
        var hrUrl = this._getSPUrl('sn_hr_core_case', hrQuery, hrCases);
        var reqUrl = this._getSPUrl('sc_request', reqQuery, reqs);

        var incLabel = (intCnt > 1) ? gs.getMessageLang('Incidents', userLanguage) : gs.getMessageLang('Incident', userLanguage);
        var hrLabel = (hrCnt > 1) ? gs.getMessageLang('HR Cases', userLanguage) : gs.getMessageLang('HR Case', userLanguage);
        var reqLabel = (reqCnt > 1) ? gs.getMessageLang('Requests', userLanguage) : gs.getMessageLang('Request', userLanguage);

        var tickets = [];
        if (intCnt > 0) {
            tickets.push(incUrl);
            tickets.push(intCnt.toFixed());
            tickets.push(incLabel);
        }
        if (hrCnt > 0) {
            tickets.push(hrUrl);
            tickets.push(hrCnt.toFixed());
            tickets.push(hrLabel);
        }
        if (reqCnt > 0) {
            tickets.push(reqUrl);
            tickets.push(reqCnt.toFixed());
            tickets.push(reqLabel);
        }

        if (tickets.length == 0)
            return '';

        var cnt = (tickets.length / 3);
        switch (cnt) {
            case 1:
                msg += gs.getMessageLang('ITSMVA_DynamicGreeting_1', userLanguage, tickets);
                break;
            case 2:
                msg += gs.getMessageLang('ITSMVA_DynamicGreeting_2', userLanguage, tickets);
                break;
            case 3:
                msg += gs.getMessageLang('ITSMVA_DynamicGreeting_3', userLanguage, tickets);
                break;
        }
        return msg;
    },

    _getSPUrl: function(table, filter, records) {
        var baseURL = gs.getProperty('glide.servlet.uri');
        var link = baseURL + this.portalName + '?id=list&table=' + table + '&filter=' + filter;
        if (records.length == 1)
            link = baseURL + this.portalName + '?id=form&table=' + table + '&sys_id=' + records.join();

        return link;
    },

    getOutages: function(outageTbl, encQuery, limit, userLanguage) {
        var message = '';
        if (!limit) limit = 3;
        if (gs.nil(userLanguage))
            userLanguage = vaContext.getRequesterLang();

        var grOutage = new GlideRecordSecure(outageTbl);
        grOutage.addEncodedQuery(encQuery);
        if (limit > 0)
            grOutage.setLimit(limit);
        grOutage.orderByDesc('begin');
        grOutage.query();
        message += (grOutage.getRowCount() > 0) ? gs.getMessageLang('Service degradations I am currently aware of ', userLanguage) : '';
        while (grOutage.next()) {
            var msg = '<li>';
            var type = grOutage.getDisplayValue('type');
            var name = grOutage.getDisplayValue('cmdb_ci');
            var start_time = new GlideDateTime(grOutage.getValue('begin'));
            var end_time = grOutage.getValue('end');
            msg += gs.getMessageLang('{0} of {1} that began at {2}.', userLanguage, [type, name, start_time.getDisplayValue()]);
            if (end_time != '') {
                msg += gs.getMessageLang(' The {0} is expected to end at {1}.', userLanguage, [type, (new GlideDateTime(end_time)).getDisplayValue()]);
            }
            msg += '</li>';
            message += msg;
        }
        return message;
    },
    outagesInfo: function(outageTbl, encQuery, limit, userLanguage) {
        var message = [];
        if (gs.nil(userLanguage))
            userLanguage = vaContext.getRequesterLanguage();
        if (!limit) limit = 3;
        var grOutage = new GlideRecordSecure(outageTbl);
        grOutage.addEncodedQuery(encQuery);
        if (limit > 0)
            grOutage.setLimit(limit);
        grOutage.orderByDesc('begin');
        grOutage.query();
        if (grOutage.getRowCount() > 0) {
            message.push(gs.getMessageLang('Service degradations I am currently aware of \n\n', userLanguage));
        }
        while (grOutage.next()) {
            var type = grOutage.getDisplayValue('type');
            var name = grOutage.getDisplayValue('cmdb_ci');
            var start_time = new GlideDateTime(grOutage.getValue('begin'));
            var end_time = grOutage.getValue('end');
            message.push("- ");
            message.push(gs.getMessageLang('{0} of {1} that began at {2}.', userLanguage, [type, name, start_time.getDisplayValue()]));
            if (end_time != '') {
                message.push(gs.getMessageLang(' The {0} is expected to end at {1}.', userLanguage, [type, (new GlideDateTime(end_time)).getDisplayValue()]));
            }
            message.push("\n\n");
        }
        return message.join('');
    },
    openTicketsInfo: function(deviceType, userLanguage, portalName) {
        var tables = [];
        var portal_pages = [];
        if (gs.nil(userLanguage))
            userLanguage = vaContext.getRequesterLang();
        if (gs.nil(portalName))
            portalName = vaVars.portalName;
        var records = this.getMyRequestSysIds(tables, portal_pages, deviceType);
        var recordsCount = records.length;
        var baseURL = gs.getProperty('glide.servlet.uri');
        var link = baseURL + portalName + '?id=my_requests';
        var reqLabel = (recordsCount > 1) ? gs.getMessageLang('Open Issues', userLanguage) : gs.getMessageLang('Open Issue', userLanguage);
        return gs.getMessageLang("You currently have [**{0} {1}**]({2})", userLanguage, [recordsCount.toFixed(), reqLabel, link]);
    },
    getMyRequestSysIds: function(tables, portal_pages, deviceType) {
        var ids = [];
        var rq_filter = new GlideRecord('request_filter');
        rq_filter.addActiveQuery();
        if (gs.nil(deviceType))
            deviceType = vaContext.deviceType;
        if (deviceType == 'android' || deviceType == 'ios') {
            // 100 Implies Mobile
            if (rq_filter.isValidField('applies_to'))
                rq_filter.addQuery('applies_to', 100);
        } else {
            // 1 Implies Service portal and 10 Implies Desktop/Service Portal
            if (rq_filter.isValidField('applies_to'))
                rq_filter.addQuery('applies_to', 1).addOrCondition('applies_to', 10);
        }
        rq_filter.query();
        while (rq_filter.next()) {
            var tableName = rq_filter.table_name;
            if (rq_filter.isValidField('table'))
                tableName = rq_filter.table;
            var gr = new GlideRecordSecure(tableName);
            gr.addQuery(rq_filter.filter);
            gr.addActiveQuery();
            gr.query();
            while (gr.next()) {
                ids.push(gr.sys_id.toString());
                tables.push(rq_filter.table.toString());
                portal_pages.push(rq_filter.portal_page.id.toString());
            }
        }
        return ids;
    },
    openTicketsStatus: function(deviceType, userLanguage, portalName) {
        var statusMsg = [];
        if (gs.nil(userLanguage))
            userLanguage = vaContext.getRequesterLang();
        if (gs.nil(portalName))
            portalName = vaVars.portalName;
        var baseURL = gs.getProperty('glide.servlet.uri');
        var tables = [];
        var portal_pages = [];
        var records = this.getMyRequestSysIds(tables, portal_pages, deviceType);
        var recordsCount = records.length;
        for (var i = 0; i < recordsCount; i++) {
            var statusLink = baseURL + portalName + '?id=' + portal_pages[i] + '&table=' + tables[i] + '&sys_id=' + records[i];
            var statusGr = new GlideRecordSecure(tables[i]);
            statusGr.get(records[i]);
            var statusRecordNumber = statusGr.number;
            var statusRecordShortDescription = statusGr.short_description;
            var statusRecordState = statusGr.state.getDisplayValue();
            if (tables[i] == 'sc_request') {
                var requestedItem = new GlideRecordSecure('sc_req_item');
                requestedItem.addQuery('request', statusGr.sys_id);
                requestedItem.query();
                if (requestedItem.next()) {
                    statusRecordState = requestedItem.stage.getDisplayValue();
                }
            }

            if (statusRecordShortDescription != '') {
                statusMsg.push(gs.getMessageLang("[**{0}**]({1}) : **{2}** status is **{3}**", userLanguage, [statusRecordNumber, statusLink, statusRecordShortDescription, statusRecordState]));
            } else {
                statusMsg.push(gs.getMessageLang("[**{0}**]({1}) status is **{2}**", userLanguage, [statusRecordNumber, statusLink, statusRecordState]));
            }
        }
        return statusMsg.join('\n');
    },
    openTicketsCount: function(deviceType) {
        var tables = [];
        var portal_pages = [];
        var records = this.getMyRequestSysIds(tables, portal_pages, deviceType);
        return records.length;
    },
    type: 'VATopicsHelper'
};
