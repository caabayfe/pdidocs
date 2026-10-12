/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
  var tableName = api.context.props.table;
  var assetRecord = api.data.look_up_asset_record.output.data.GlideRecord_Query[tableName]._results[0];
  helpers.translate('Enter required information for').then(
    (translatedString) => {
      api.setState('translatedTitle', translatedString + ' ' + assetRecord.display_name.value);
    }
  );
  api.setState('displayName',assetRecord.display_name.value);
  api.setState('reservedFor',assetRecord.reserved_for.value);
  if (assetRecord.asset_tag) {
    api.setState('assetTag',assetRecord.asset_tag.value);
  }
  if (assetRecord.serial_number) {
    api.setState('serialNumber',assetRecord.serial_number.value);
  }
}
