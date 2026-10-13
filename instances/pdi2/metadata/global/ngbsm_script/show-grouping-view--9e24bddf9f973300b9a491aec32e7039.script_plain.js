dependency_views_script();

function getAlertGR(alertID) {
    var maxAlertsToQuery = parseInt(gs.getProperty('evt_mgmt.max_alerts_to_query_in_dependency_view', '10000'));

    var gr = new GlideRecord('em_alert');
    gr.get(alertID);
    var parent = gr.parent;
    var alertGr = new GlideRecord('em_alert');
    if (parent) {
        alertGr.addQuery('parent', parent);
    } else {
        alertGr.addQuery('parent', alertID);
    }
    alertGr.orderBy('sys_created_on');
    alertGr.setLimit(maxAlertsToQuery);
    alertGr.query();
    return alertGr;
}

function getGroupFirstCreatedAlertSysID(alertID) {
    var groupCis = [];
    var alertGr = getAlertGR(alertID);

    //getting the first created alert CI so we will be determinist with the presentation.
    if (alertGr.next()) {
        groupCis.push(alertGr.getValue('cmdb_ci'));
    }

    return groupCis;
}

function getGroupCis(alertID) {
    var groupCis = [];
    var gr = new GlideRecord('em_alert');
    gr.get(alertID);
    groupCis.push(gr.getValue('cmdb_ci'));

    var alertGr = getAlertGR(alertID);

    while (alertGr.next()) {
        var ci = alertGr.getValue('cmdb_ci');
        if (groupCis.indexOf(ci) == -1) {
            groupCis.push(alertGr.getValue('cmdb_ci'));
        }
    }

    return groupCis;
}

function getAllCis(mapFromWalker) {
    var cis = [];
    for (var ci in mapFromWalker) {
        if (cis.indexOf(ci) == -1) {
            cis.push(ci);
        }
        var relatedCis = mapFromWalker[ci];
        for (var i = 0; i < relatedCis.length; i++) {
            var ciItem = relatedCis[i].split('@');
            if (cis.indexOf(ciItem[0]) == -1) {
                cis.push(ciItem[0]);
            }
        }
    }
    return cis;
}

function handleMapAndResult(result) {

    var walkerMap = dv_params['walker'];
    var directNeighbours = walkerMap[dv_ci_id];

    if (directNeighbours) {
        for (var i = 0; i < directNeighbours.length; i++) {
            var directNeighboursParts = directNeighbours[i].split('@');
            var direction = directNeighboursParts[1];
            var relType = directNeighboursParts[2];
            result.push({
                "dv_ci_id": directNeighboursParts[0],
                "dv_downstream": direction == "ParentToChild" ? true : false,
                "dv_rel_type": relType,
                "dv_params": dv_params
            });
        }
    }
}

function groupCIsDifference(groupCis, allCis) {
    var result = [];
    for (var i = 0; i < groupCis.length; i++) {
        if (allCis.indexOf(groupCis[i]) == -1) {
            result.push(groupCis[i]);
        }
    }
    return result;
}

//for debugging, to know what is the CI names by sys_id
function getNames(cis) {
    var cisNames = '';
    var gr = new GlideRecord('cmdb_ci');
    gr.addQuery('sys_id', cis);
    gr.query();
    while (gr.next()) {
        cisNames += gr.getValue('name');
    }
    return cisNames;
}

function isEdge(ci, mapFromWalker, downstream) {
    var related = mapFromWalker[ci];

    for (var i = 0; i < related.length; i++) {
        var ciItem = related[i].split('@');
        var dir = ciItem[1];

        if (downstream) {
            if (dir == "ParentToChild") {
                return false;
            }
        } else {
            if (dir == "ChildToParent") {
                return false;
            }
        }
    }
    return true;
}

function isMapWithEdges(map, groupCis) {
    if (isEmptyObject(map)) {
        return true;
    }

    for (var ci in map) {
        var isCiEdgeForDownstream = isEdge(ci, map, true);
        if (isCiEdgeForDownstream && groupCis.indexOf(ci) == -1) {
            return true;
        }
        var isCiEdgeforUpstream = isEdge(ci, map, false);
        if (isCiEdgeforUpstream && groupCis.indexOf(ci) == -1) {
            return true;
        }
    }
    return false;
}

function isEmptyObject(map) {
    for (var name in map) {
        return false;
    }
    return true;
}

function getEdges(map, groupCis, downstream) {
    var edges = [];
    for (var ci in map) {
        var isCiEdge = isEdge(ci, map, downstream);
        if (isCiEdge && groupCis.indexOf(ci) == -1) {
            edges.push(ci);
        }
    }
    return edges;
}

function reducedNoiseMap(edges, origMap) {
    var newMap = {};
    for (var ciIdx in origMap) {
        if (edges.indexOf(ciIdx) == -1) {
            var related = origMap[ciIdx];
            var newRelated = [];
            for (var i = 0; i < related.length; i++) {
                var ciItem = related[i].split('@');
                var ciOfRelated = ciItem[0];
                if (edges.indexOf(ciOfRelated) == -1) {
                    newRelated.push(related[i]);
                }
            }
            newMap[ciIdx] = newRelated;
        }
    }
    return newMap;
}

function dependency_views_script() {
    var result = [];

    var errorMsg;
    if (!('alertID' in dv_params))
        errorMsg = gs.getMessage("The dependency type {0} is not supported from this view. \
								To get this view, click on {1} under the Alert activities.", 
								["'Show Grouping view'", "'CMDB group Alerts'"]);
    else if (!dv_params['alertID'])
        errorMsg = gs.getMessage("The dependency type {0} cannot be applied because of an empty value of Alert sys_id", "'Show Grouping view'");

    if (errorMsg) {
        result.push({
        "dv_ci_id" : dv_ci_id,
        "dv_messages":  { "type":"error", "msg":errorMsg}});

        return result;
    }

    var walkerCis = dv_params['walker'];

    if (!walkerCis) {
        var alertSysID = dv_params['alertID'];
        var groupFirstCi = getGroupFirstCreatedAlertSysID(alertSysID);
        var groupCis = getGroupCis(alertSysID);
        var processor = new SNC.ServiceAnalyticsProcessor();
        var relatedCis = processor.getRelatedCIsMap(groupFirstCi, groupCis);
        var mapFromWalker = JSON.parse(relatedCis);

        dv_params['walker'] = mapFromWalker;

        var allCis = getAllCis(mapFromWalker);

        // there is need to check if there are CI's appear in group
        // but not appear in map. in this case there is need to add them 
        // to the first level.
        var diff = groupCIsDifference(groupCis, allCis);

        if (allCis.length == 1) {
            diff.push(allCis[0]);
        }
        for (var i = 0; i < diff.length; i++) {
            result.push({
                "dv_ci_id": diff[i],
                "dv_params": dv_params,
                "dv_rel_type_label": "Group Separate CI's"
            });
        }

        for (var id in mapFromWalker) {
            var related = mapFromWalker[id];
            if (!related) {
                result.push({
                    "dv_ci_id": id,
                    "dv_params": dv_params,
                    "dv_rel_type_label": "Group Separate CI's"
                });
            }
        }
    }

    handleMapAndResult(result);
	
    return result;
}
