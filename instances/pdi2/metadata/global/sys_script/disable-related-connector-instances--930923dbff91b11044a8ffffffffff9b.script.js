(function executeRule(current, previous /*null when async*/ ) {

    if (current.operation() == 'delete') {
		new ConnectorInstanceUtil().disableConnectorInstanceWithAssnGroup(current.getValue('sys_id'), current.getValue('name'));
    }

})(current, previous);
