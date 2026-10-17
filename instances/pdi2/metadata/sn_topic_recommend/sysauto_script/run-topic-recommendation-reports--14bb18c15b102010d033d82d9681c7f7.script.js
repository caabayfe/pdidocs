var settings = new GlideRecord('sn_topic_recommend_default_setting');
        settings.addNotNullQuery('frequency');
        settings.query();

        while (settings.next()) {
            var reportDefinitions = new GlideRecord('sn_nlu_discovery_report_definition');
            reportDefinitions.addQuery('model', settings.taxonomy);
            reportDefinitions.addQuery('table', settings.data_source);
            reportDefinitions.orderByDesc('sys_created_on');
            reportDefinitions.query();
            if (reportDefinitions.next()) {
                var monthsFromCreatedOn = new GlideDateTime(reportDefinitions.sys_created_on);
                monthsFromCreatedOn.addMonthsUTC(settings.frequency);
                if (new GlideDateTime() >= monthsFromCreatedOn) {
                    createReportDefinition(settings);
                }
            } else {
                createReportDefinition(settings);
            }
        }

        function createReportDefinition(settings) {
            var gr = new GlideRecord('sn_nlu_discovery_report_definition');
            gr.setValue('name', settings.taxonomy + '-' + settings.data_source + '-' + new GlideDate().getByFormat("yyyy-MM-dd'T'HH:mm:ss"));
            gr.setValue('model', settings.taxonomy);
            gr.setValue('table', settings.data_source);
            gr.setValue('field', settings.field_to_analyze);
            gr.setValue('filter', settings.filter_by);
            gr.insert();
        }
