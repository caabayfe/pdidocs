(function executeRule(current, previous /*null when async*/ ) {

    if (previous.active == true && current.active == false) {
        var connectionDataGR = new GlideRecord('sys_df_connection_data');
        connectionDataGR.addQuery('connection.connection_name', current.connection_name);
        connectionDataGR.query();
        if (connectionDataGR.next()) {
            connectionDataGR.connection_status = 'DEACTIVATED';
            connectionDataGR.update();
        }
    }

})(current, previous);
