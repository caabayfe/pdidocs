(function executeRule(current, previous /*null when async*/ ) {
    var connectionURL = new ConnectionURL(current);
    current.connection_url = connectionURL.getJDBCConnectionURL();
})(current, previous);
