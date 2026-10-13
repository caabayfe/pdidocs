(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var queryParams = request.queryParams;
    var workspace = queryParams.workspace;
    var writer = response.getStreamWriter();
    response.setContentType('application/json');

	function getBooleanValue(val){
		return String(val) === "1";
	}
	
    function getPlainFields(workspace) {
        gr = new GlideRecord('noc_tilemap_conf');
        gr.get('workspace', String(workspace));
        return {
            "layout_segments_equally_divided":  getBooleanValue(gr.getValue('layout_segments_equally_divided'))
        };
    }

    var tmcManager = new sn_nocpit.TilemapContainerManager();
    var choicesFields = JSON.parse(tmcManager.getTilemapConfChoices(workspace));
    var plainFields = getPlainFields(workspace);

    var responseString = JSON.stringify({
        "choicesFields": choicesFields,
        "plainFields": plainFields
    });

    response.setStatus(200);
    writer.writeString(responseString);

})(request, response);
