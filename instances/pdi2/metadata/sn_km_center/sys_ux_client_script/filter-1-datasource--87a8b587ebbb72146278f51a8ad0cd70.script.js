/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
  const DATASOURCE_TYPE = 'table';
  const DATASOURCE_TABLE = 'kb_knowledge_base';
  const DATASOURCE_PRIMARY_KEY = 'sys_id';

  var datasource = {
    "payload": {
      "primaryKey": DATASOURCE_PRIMARY_KEY,
      "table": DATASOURCE_TABLE
    },
    "type": DATASOURCE_TYPE
  };

  var kbResource = api.data && api.data['fetch_all_knowledgebases_1'];
  if (kbResource && kbResource.output && kbResource.output.hasLoaded) {
      var writableKbSysIds = kbResource.output.writableKbSysIds;
      datasource.encodedQuery = writableKbSysIds
          ? 'sys_idIN' + writableKbSysIds
          : 'sys_idINNULL';
  }

  return datasource;
}
