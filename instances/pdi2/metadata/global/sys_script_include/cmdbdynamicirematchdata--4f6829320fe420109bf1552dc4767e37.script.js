var CMDBDynamicIREMatchData = Class.create();
CMDBDynamicIREMatchData.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /*
     *
     * @param  matchJSON {"cmdb_dynamic_ire_match": [{"sys_id": "<value>","expected_match": "value"},
     * {"sys_id": "<value>","expected_match": "value"}]}
     *
     * @return matchJSON {"columns": ["DynamicIREIT_89_9191","DynamicIREIT_89_9191"],"cmdb_ci_win_server": {"rows": [{"asset": ["YAH-0F4C-9191 - Unknown",""],"asset_tag": ["YAH-0F4C-9191","YAH-0F4C-9292"]} ]},"cmdb_serial_number": {"rows": [{"serial_number": ["4f-fc-cd-db-b1-919853","4f-fc-cd-db-b1-919855"],"serial_number_type": ["chassis","chassis"]},{"serial_number": ["4f-fc-cd-db-b1-919854","4f-fc-cd-db-b1-919854"],"serial_number_type": ["chassis","chassis"]},{"serial_number": ["","4f-fc-cd-db-b1-919853"],"serial_number_type": ["","chassis"]}]}}     
     *
     */

    getMatchRecords: function() {

        var tableName = this.getParameter('tableName');
        var matchJSON = this.getParameter('sysMatchJSON');

        var processor = new global.CMDBDynamicIREProcessor();
        var results = processor.getMatchRecords(matchJSON, true);

        return results;
    },

    /*
     *
     * @param  matchJSON {"cmdb_dynamic_ire_match": [{"sys_id": "<value>","expected_match": "Match"},
     * {"sys_id": "<value>","expected_match": "value"}]}
     * @return matchJSON {"cmdb_dynamic_ire_match": [{"sys_id": "<value>","expected_match": "value", "updated": "true"},
     * {"sys_id": "<value>","expected_match": "value", "updated": "true"}]}.
     */

    updateMatchRecords: function() {

        var tableName = this.getParameter('tableName');
        var matchJSON = this.getParameter('sysMatchJSON');

        var processor = new global.CMDBDynamicIREProcessor();
        var results = processor.updateMatchRecords(matchJSON, true);

        return results;
    },

    type: 'CMDBDynamicIREMatchData'
});
