getPIIQuery();

function getPIIQuery() {
    var grDataClass = new GlideAggregate('m2m_dictionary_dataclass');
    grDataClass.addEncodedQuery('data_class=348107b951d71010f877f3f178e7dd0d', true);
    grDataClass.groupBy('sys_dictionary');
    grDataClass.query();
    return grDataClass.getRowCount();
}
