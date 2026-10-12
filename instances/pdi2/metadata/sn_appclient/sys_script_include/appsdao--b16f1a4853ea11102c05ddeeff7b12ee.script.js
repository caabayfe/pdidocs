var AppsDAO = {
    appMapper: ['sys_id', 'customization', 'name', 'logo', 'vendor', 'short_description', 'scope',  'latest_version', 'products', 'indicators', 'lob', 'ir_query_score', 'version', 'assigned_version', 'update_available', 'apps_in_jumbo', 'contains_plugins', 'optional_apps_available'],
    appsData: new AppsData(),
    getApps: function(args, tableName, rowMapper, displayValueMap) {
        var result = {};
        if(!displayValueMap) displayValueMap = {};
        //if rowMapper doesnot exist just return row count
        var isMapperExist = rowMapper && rowMapper.length > 0;
        var gr = new GlideRecord(tableName);
        if (args.encodedQuery)
            gr.addEncodedQuery(args.encodedQuery);
        if (args.requirePagination) {
            var offset = args[Constants.SYSPARM_OFFSET];
            var lastRow = offset + args[Constants.SYSPARM_LIMIT];
            gr.chooseWindow(offset, lastRow);
        }
        if (args[Constants.SORT_BY_PARAM]) {
            if (args[Constants.SORT_BY_PARAM] === 'a-z')
                gr.orderBy('name');
            else if (args[Constants.SORT_BY_PARAM] === 'z-a')
                gr.orderByDesc('name');
            else if (args[Constants.SORT_BY_PARAM] === 'install_date')
                gr.orderByDesc('install_date');
            else if (args[Constants.SORT_BY_PARAM] === 'recently_released')
                gr.orderByDesc('publish_date');
        }
        gr.query();
        var hasLogo = rowMapper.indexOf('logo') != -1;
        var appsInfo = [];
        while (isMapperExist && gr.next()) {
            var appInfo = {};
            for (var index in rowMapper) {
                var colName = rowMapper[index];
                if(displayValueMap[colName] == true)
                	appInfo[colName] = gr.getDisplayValue(colName);
                else
                	appInfo[colName] = gr.getValue(colName);
            }
			appInfo["short_description"] = appInfo["short_description"] || "";
            if (hasLogo)
                appInfo['logo'] =  AppsDAO.appsData.getLogo(gr);
            appsInfo.push(appInfo);
        }
        result.apps = appsInfo;
        result.count = gr.getRowCount();
        return result;
    }
};
