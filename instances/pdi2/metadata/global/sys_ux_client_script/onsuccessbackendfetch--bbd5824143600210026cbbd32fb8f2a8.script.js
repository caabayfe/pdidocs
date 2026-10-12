/**
 * After java server side fetch of scriptable API is a success 
 * this client script is executed.
 * Used to build encoded Query with cluster group id info
 * 
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
    let filterQuery = api?.data?.hermes_java_backend_scriptable_get?.output || {};
    let filterQueryReturnVal =  filterQuery?.returnValue || "";
    let queryIndexTopicName = 0;
    let INSTANCE_ALL_QUERY_PART = "^topic_name=INSTANCE_ALL_TOPICS";
    let APP_ID_ANYTHING_QUERY_PART = "^app_idANYTHING"
    let APP_ID_IS_EMPTY_QUERY_PART = "^app_idISEMPTY"
    let selectedSourceType = api.state.sourceTypeSelected.item.id;
    queryIndexTopicName = filterQueryReturnVal.indexOf("^topic_name");
    //filter query used for all topics throughput data bar graph
    let topicGroupFilter = filterQueryReturnVal?.slice(0, queryIndexTopicName);
    topicGroupFilter = topicGroupFilter.replace("^source_type="+selectedSourceType, "");
    let topicQuery = filterQueryReturnVal?.slice(queryIndexTopicName, filterQueryReturnVal.length);
    topicGroupFilter = buildTopicGroupQuery(topicQuery);
    let currentTopicGroupFilterQuery = api.state.filterEncodedQueryTopicGroups;
    if (topicGroupFilter == currentTopicGroupFilterQuery) {
        if (currentTopicGroupFilterQuery.indexOf("^source_typeANYTHING") == -1)
            topicGroupFilter = topicGroupFilter + "^source_typeANYTHING";
    }
    setClientStates();

    function setClientStates() {
        api.setState("filterEncodedQuery", filterQueryReturnVal);
        api.setState("filterEncodedQueryTopicGroups", topicGroupFilter);
    }
    
    /*
        Builds Topic condition query with below
        ALL -->  *All Topics*,  [Internal]*All Topics*
        *All Topics* --> sn_streamconnect.*All Topics*, sn_loganalytics.*All Topics*, ..etc
       [Internal]*All Topics* -->  [Internal]idr.*All Topics*, ..etc
       sn_streamconnect.*All Topics* --> sn_streamconnect topics list
       [Internal]idr.*All Topics* --> idr topics list
    */
    function buildTopicGroupQuery(query) {
        if(containsDefaultQuery(query)) {
            topicGroupFilter = topicGroupFilter + "^topic_name!=INSTANCE_ALL_TOPICS";
        } else if (query.indexOf("*All Topics*") != -1) {
            let topicCondition;
            if (query.indexOf("=") != -1)
                topicCondition = query.split("=");	
            else 
                topicCondition = query.split("LIKE");

            if (topicCondition[1] == "[Internal]*All Topics*") {               
        	    topicGroupFilter = topicGroupFilter + "^topic_name!=[Internal]*All Topics*^topic_nameCONTAINS[Internal]^topic_nameCONTAINS*All Topics*";
            } else if (topicCondition[1] == "*All Topics*") {
                if (containsDefaultAppQuery(topicGroupFilter) || containsEmptyAppQuery(topicGroupFilter))
        	        topicGroupFilter = topicGroupFilter + "^topic_name!=*All Topics*^topic_nameDOES NOT CONTAIN[Internal]^topic_nameCONTAINS*All Topics*";
                else    
                    topicGroupFilter = topicGroupFilter + "^topic_nameCONTAINS*All Topics*"

            } else {
                let appIdVal = topicCondition[1].split(".");
                topicGroupFilter = topicGroupFilter + "^topic_name!="+topicCondition[1];
                if (appIdVal[0].indexOf("[Internal]") != -1)
                    topicGroupFilter = topicGroupFilter.replace(APP_ID_ANYTHING_QUERY_PART, "^app_id="+appIdVal[0].substring(10));
                else 
                    topicGroupFilter = topicGroupFilter.replace(APP_ID_ANYTHING_QUERY_PART, "^app_id="+appIdVal[0]);
                
                return topicGroupFilter;
            }
        } else
            topicGroupFilter = topicGroupFilter + query;
        
        if(containsDefaultAppQuery(topicGroupFilter))
            topicGroupFilter = topicGroupFilter.replace(APP_ID_ANYTHING_QUERY_PART, "^app_idISNOTEMPTY")
        
        return topicGroupFilter;
    }

    function containsDefaultQuery(query) {
        return query.indexOf(INSTANCE_ALL_QUERY_PART) != -1;
    }

    function containsDefaultAppQuery(query) {
        return query.indexOf(APP_ID_ANYTHING_QUERY_PART) != -1;
    }

    function containsEmptyAppQuery(query) {
        return query.indexOf(APP_ID_IS_EMPTY_QUERY_PART) != -1;
    }
}
