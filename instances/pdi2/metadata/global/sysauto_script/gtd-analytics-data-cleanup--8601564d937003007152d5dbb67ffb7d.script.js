cleanupAnalyticsData();

function cleanupAnalyticsData(){
        var daysOffset = gs.getProperty('com.glide.guided_tours.analytics_data_offset',90);
        
       gs.log('Guided Tour Designer: Analytics data cleanup started. Data offset period: ' + daysOffset + ' days');

        var gr = new GlideRecord('sys_guided_tour_analytics');
        gr.addQuery('sys_updated_on', '<=', gs.daysAgo(daysOffset));
        gr.query();

       var numOfRecords = gr.getRowCount();
    
       while (gr.next()) {
            var gr1 = new GlideRecord('sys_guided_tour_analytics_event');
            gr1.addQuery('analytics_instance',gr.sys_id);
            gr1.query();

           gr1.deleteMultiple();
           gr.deleteRecord();
       }
      
       gs.log('Guided Tour Designer: Analytics data cleanup completed. Number of records deleted: ' + numOfRecords);
}
