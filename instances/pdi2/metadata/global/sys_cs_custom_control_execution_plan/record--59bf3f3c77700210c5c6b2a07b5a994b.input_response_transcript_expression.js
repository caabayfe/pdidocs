function execute(controlData, responseValue) {
    if (responseValue.status == 'SUCCESS')
        return gs.getMessage('Catalog item request completed');
    else if (responseValue.status == 'CANCELED')
        return gs.getMessage('Catalog item request cancelled');

    return gs.getMessage('Status for catalog item request is: {0}', [responseValue.status]);
}
