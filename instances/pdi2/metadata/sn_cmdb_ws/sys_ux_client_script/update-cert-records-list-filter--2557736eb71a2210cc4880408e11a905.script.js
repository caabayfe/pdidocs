function script({api, event}) {
    const {
        value
    } = event.payload;

    let {
        filter
    } = api.context.props;

    let certRecordsListFilter = filter.replace('^ENDRLQUERY', '');
    if (value == "certified") {
        certRecordsListFilter += '^status=certified^ORcontains_certified_attributes=true';
    } else if (value == "failed") {
        certRecordsListFilter += '^status=failed^ORcontains_failed_attributes=true';
    }
    certRecordsListFilter += '^ENDRLQUERY';
    api.setState("certRecordsListFilter", certRecordsListFilter);
}
