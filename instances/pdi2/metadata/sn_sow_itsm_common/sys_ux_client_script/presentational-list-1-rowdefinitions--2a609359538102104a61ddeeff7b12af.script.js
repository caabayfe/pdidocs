/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    let recordsPerPage = api.state.recordsPerPage;
    var rows = api.state.allAdditionalCollaboratorsList.rows;
    var iIndex = api.state.additionalCollaboratorsListIndex * recordsPerPage;
    var lIndex = iIndex + recordsPerPage;
    if (rows.length < lIndex) {
        lIndex = rows.length;
    }
    var newRows = {
        'rows': rows.slice(iIndex, lIndex)
    };
    return newRows;
}
