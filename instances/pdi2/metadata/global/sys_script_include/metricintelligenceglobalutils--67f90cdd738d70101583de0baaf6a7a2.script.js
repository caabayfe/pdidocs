var MetricIntelligenceGlobalUtils = Class.create();
MetricIntelligenceGlobalUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	changeGlobalEntry: function(table, sys_id, changeFieldName, changedFieldValue) {
		gs.info("Adding 'condition' to the Global Business Rule: 'Band Trigger's level validation' to disable when running from 'Metric Intelligence NG' scope");
        var gr = new GlideRecord(table);
        if (!gr.isValid()) {
            gs.error("Invalid table: " + table);
        }
        gr.addQuery("sys_id", sys_id);
        gr.query();
        if (gr.next()) {
            gr.setValue(changeFieldName, changedFieldValue);
            if (!gr.update())
                gs.error("Could not update Business Rule condition");
            gs.info("updated " + gr.getValue('name') + " " + gr.getValue(changeFieldName) + "  **");
        }
    },
	
	setAbortAction: function(currentEntry){
		currentEntry.setAbortAction(true);		
	},

    expireMetricMapBySource: function(source, forceUpdate){
        //Read the system property managing the expiration of metric map on changing the event rule. Default 'false'.
        if(!GlideProperties.getBoolean('sa_metric.expire_metric_map_on_event_rule_change', false) && !forceUpdate){
            gs.info('Skip expire metrics mapping. The system property sa_metric.expire_metric_map_on_event_rule_change is false.');
            return;
        }

        //Skip running expiration when the source is ITOM Agent
	    if(GlidePluginManager.isActive('com.agent-now')){
            var metricSourcesGr = new GlideRecord('sa_metric_registration');
            //get the 'ITOM Agent' metric source by ID 
            var exists = metricSourcesGr.get('18d4f836b7311110bded8b96ce11a99a');
            if(exists && source == metricSourcesGr.source){
                gs.info('Skip expire metrics mapping of ITOM Agent.');
                return;
            }	
	    }


        var expireAllMetricsForEmptySource = GlideProperties.getBoolean('sa_metric.expire_all_metrics_for_empty_source', false);
        if (GlideStringUtil.nil(source) && !expireAllMetricsForEmptySource) {
            gs.info("Not expiring any entries in the metric map table as the input source is empty.");
            return;
        }


        var metricMapGr = new GlideRecord('sa_metric_map');

        if (GlideStringUtil.notNil(source))
            metricMapGr.addQuery('source', source);

        var expireMetricMapRecordsWithEmptyCIs = GlideProperties.getBoolean('sa_metric.expire_metric_map_records_with_empty_cis', false);
        if(!expireAllMetricsForEmptySource)
            metricMapGr.addNotNullQuery('cmdb');

        metricMapGr.query();

        var numRowsToUpdate = metricMapGr.getRowCount();
        var chunkSize = GlideProperties.getInt('sa_metric.expire_metric_map_records_chunk_size', 10000);
        var timeExpirationExtensionInSec = GlideProperties.getInt('sa_metric.time_expiration_extension_in_sec', 3600);
        
        var iterationsAmount = (numRowsToUpdate/chunkSize) + 1;

        var gdt = new GlideDateTime();
        for(var i = 0; i < iterationsAmount; i++){           
            var gr = new GlideRecord('sa_metric_map');
            if(!expireAllMetricsForEmptySource)
                gr.addNotNullQuery('cmdb');
            if (GlideStringUtil.notNil(source))
                gr.addQuery('source', source);
        
            gr.orderBy('updated_on_milliseconds');
            gr.setLimit(chunkSize);
            gr.setValue('expiration', gdt);
            gr.updateMultiple();

            gdt.addSeconds(timeExpirationExtensionInSec);
        }
    },
	
    type: 'MetricIntelligenceGlobalUtils'
});
