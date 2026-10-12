function transform(params) {
	var numbers = [];
	if(gs.nil(params.extra_params.isPotentialDuplicateDraftArticle))
		return numbers;

    var CLUSTER_TABLE = 'kb_duplicates_cluster';
    var STATUS_FIELD  = 'article_analysis_status';
    var ARTICLE_TABLE = 'kb_knowledge';
    var TARGET_STATUS = 'can_be_merged';

    
    var clusterId = params ? params.extra_params.kbDuplicateClusterId : '';
    if (!clusterId || clusterId === 'null' || clusterId === 'undefined' || clusterId === 'false') {
        return numbers;
    }

    var gr = new GlideRecordSecure(CLUSTER_TABLE);
    if (!gr.get(String(clusterId))) {
        return numbers;
    }

    var raw = gr.getValue(STATUS_FIELD);
    if (!raw) {
        return numbers;
    }

    var parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        gs.error('[duplicateCluster transform] Invalid JSON in ' + STATUS_FIELD +
                 ' for ' + CLUSTER_TABLE + ':' + clusterId + ' - ' + e);
        return numbers;
    }
    if (!parsed || typeof parsed !== 'object') {
        return numbers;
    }

    var ids = Object.keys(parsed).filter(function(sysId) {
        var entry = parsed[sysId];
        return entry && entry.status === TARGET_STATUS;
    });

    if (!ids.length) {
        return numbers;
    }

    var ka = new GlideRecordSecure(ARTICLE_TABLE);
    ka.addQuery('sys_id', 'IN', ids.join(','));
    ka.query();

    var numberById = {};
    while (ka.next()) {
        numberById[ka.getUniqueValue()] = ka.getValue('number');
    }

    ids.forEach(function(id) {
        if (numberById[id]) {
            numbers.push(numberById[id]);
        } else {
            gs.warn('[duplicateCluster transform] No ' + ARTICLE_TABLE +
                    ' record readable for sys_id ' + id);
        }
    });

    return numbers;
}
