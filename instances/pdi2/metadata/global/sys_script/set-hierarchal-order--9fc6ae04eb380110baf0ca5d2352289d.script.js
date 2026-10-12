(function executeRule(current, previous /*null when async*/ ) {
    var hierarchy_order;
    var document_table = current.document_table;
    if (document_table == 'sys_cs_channel')
        hierarchy_order = 300;
    else if (document_table == 'sys_cs_provider')
        hierarchy_order = 200;
    else if (document_table == 'sys_cs_provider_application')
        hierarchy_order = 100;

    current.hierarchy_order = hierarchy_order;
})(current, previous);
