var DomainOverrideViewerUtil = Class.create();
DomainOverrideViewerUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getOverrideRecordList: function(){
		var tableName = this.getParameter('sysparm_table_name');
        
        var recordList = new GlideRecordSecure(tableName);
        recordList.addJoinQuery(tableName, 'sys_id', 'sys_overrides');
        recordList.orderBy('name');
        recordList.queryNoDomain();
        var countParentRecords = recordList.getRowCount();

        var overridesLink = 'nav_to.do?uri=%2F' + tableName + '_list.do?sysparm_query=sys_overrides%3D';
        var addParentInList = '%5EORsys_id%3D';
        var urlQueryWithNoDomain = '%26sysparm_order=sys_sys_overrides%26sysparm_order_direction=desc%26sysparm_query_no_domain%3Dtrue';

        var collection = [];
        var i = 0;
        while(recordList.next()){
            var bu = {};
            var count = '0';
            var countOverrides = new GlideAggregate(tableName);
            countOverrides.addQuery('sys_overrides', recordList.sys_id);
            countOverrides.addAggregate('COUNT');
            countOverrides.queryNoDomain();
            if(countOverrides.next()){
                count = countOverrides.getAggregate('COUNT');
            }

            var domainTableName = GlideDomainSupport.getDomainTable();
            var domainName = '';
            if (recordList.sys_domain != 'global'){
                var domainDisplay = new GlideRecord(domainTableName);
                domainDisplay.addQuery('sys_domain', recordList.sys_domain);
                domainDisplay.query();
                while (domainDisplay.next()){
                    domainName = domainDisplay.name.toString();
                }
            } else {
                domainName = 'Global';
            }

            var nameColumnDisplay = recordList.name.toString();
            if (typeof(recordList.name) == 'undefined'){
                nameColumnDisplay = recordList.getValue('sys_name');
                if (typeof(recordList.sys_name) == 'undefined'){
                    nameColumnDisplay = recordList.title.toString();
                    if (typeof(recordList.title) == 'undefined'){
                        nameColumnDisplay = 'NULL';
                    }
                }
            }

            var viewRecords = overridesLink + recordList.sys_id + addParentInList + recordList.sys_id + urlQueryWithNoDomain;


            bu['name'] = nameColumnDisplay;
            bu['sys_id'] = recordList.getValue('sys_id');
            bu['sys_domain'] = domainName;
            bu['OverridesCount'] = count;
            bu['ViewRecords'] = viewRecords;

            if(i < countParentRecords){
                collection[i] = bu;
                i++;
            }
        }

        return JSON.stringify(collection);		
		
	},

    type: 'DomainOverrideViewerUtil'
});
