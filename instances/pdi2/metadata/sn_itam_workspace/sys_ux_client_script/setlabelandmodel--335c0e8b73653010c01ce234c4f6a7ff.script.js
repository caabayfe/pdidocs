/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var tab = api.context.props.table;
    var displayName = api.data.gliderecord_query_1.output.data.GlideRecord_Query[tab]._results[0].display_name.value;
    api.setState('displayName', displayName);

    var modelType = '';
    if (tab === 'cmdb_hardware_product_model' || tab === 'cmdb_consumable_product_model') {
        modelType = 'Hardware';
    } else if (tab === 'cmdb_software_product_model') {
        modelType = 'Software';
    } else {
        modelType = 'Product';
    }
    helpers.translate('Publish {0} to {1} Catalog', displayName, modelType).then(
    (translatedString) => {
      api.setState('label', translatedString);
    }
    );
    
    helpers.translate('Catalog Item is created successfully.').then(
    (translatedString) => {
      api.setState('infoMessage', translatedString);
    }
    );

}
