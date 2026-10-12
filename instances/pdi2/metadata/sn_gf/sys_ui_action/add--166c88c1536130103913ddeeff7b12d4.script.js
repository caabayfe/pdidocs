var uri = action.getGlideURI();
var path = uri.getFileFromPath() + '';
path = path.substring(0, path.length - 5) + '.do';
uri.set('sys_id', '-1');
var formTableName = uri.get('sysparm_collection');
var scriptedRelationshipName = uri.get('sysparm_collection_relationship');
var planningItemType;

var containsRel = scriptedRelationshipName.toString().indexOf("REL:") != -1;
var viewEntityJsonMap;


if (containsRel) {
    viewEntityJsonMap = {
        'REL:364af774532130103913ddeeff7b12e0': 'goal_project_relationship',
        'REL:b1ea7f74532130103913ddeeff7b124d': 'goal_demand_relationship',
        'REL:f87bf7b4532130103913ddeeff7b1210': 'goal_program_relationship',
        'REL:787db1f853b53010c8d4ddeeff7b12b7': 'goal_epic_relationship',
        'REL:3add35f853b53010c8d4ddeeff7b1238': 'goal_feature_relationship',
        'REL:a61796a077120110a55229354f5a9982': 'Goal_Other_Item_Relationship',
        'REL:e2e2864577230110044e6e7f6b5a9908': 'goal_planning_item_relationship',
        'REL:b1d2db5377311110114329354f5a997e': 'other_item_goal_relationship',
        'REL:97288257433731105269d058c7b8f205': 'goal_planning_item_relationship',
        'REL:a91a4adf433731105269d058c7b8f273': 'Goal_Other_Item_Relationship'
    };
} else {
    viewEntityJsonMap = {
        '364af774532130103913ddeeff7b12e0': 'goal_project_relationship',
        'b1ea7f74532130103913ddeeff7b124d': 'goal_demand_relationship',
        'f87bf7b4532130103913ddeeff7b1210': 'goal_program_relationship',
        '787db1f853b53010c8d4ddeeff7b12b7': 'goal_epic_relationship',
        '3add35f853b53010c8d4ddeeff7b1238': 'goal_feature_relationship',
        'a61796a077120110a55229354f5a9982': 'Goal_Other_Item_Relationship',
        'e2e2864577230110044e6e7f6b5a9908': 'goal_planning_item_relationship',
        'b1d2db5377311110114329354f5a997e': 'other_item_goal_relationship',
        '97288257433731105269d058c7b8f205': 'goal_planning_item_relationship',
        'a91a4adf433731105269d058c7b8f273': 'Goal_Other_Item_Relationship'
    };
}

viewEntityJsonMap['pm_project'] = 'project_goal_relationship';
viewEntityJsonMap['dmn_demand'] = 'demand_goal_relationship';
viewEntityJsonMap['pm_program'] = 'program_goal_relationship';
viewEntityJsonMap['rm_epic'] = 'epic_goal_relationship';
viewEntityJsonMap['sn_safe_epic'] = 'epic_goal_relationship';
viewEntityJsonMap['rm_feature'] = 'feature_goal_relationship';
viewEntityJsonMap['sn_align_core_demand'] = 'planning_item_goal_relationship';
viewEntityJsonMap['sn_align_core_initiative'] = 'planning_item_goal_relationship';
viewEntityJsonMap['sn_align_core_program'] = 'planning_item_goal_relationship';
viewEntityJsonMap['sn_align_core_project'] = 'planning_item_goal_relationship';
viewEntityJsonMap['sn_align_core_scrum_epic'] = 'planning_item_goal_relationship';

if (formTableName.split("tsp").length > 1) {
    var extendedFromTableName = formTableName.split("tsp")[1];
    if (!Number.isNaN(Number(extendedFromTableName.split("_")[0])) && extendedFromTableName.split('_').length == 2) {
        if (extendedFromTableName.indexOf("project") != -1) {
            viewEntityJsonMap[formTableName] = 'project_goal_relationship';
        } else if (extendedFromTableName.indexOf("demand") != -1) {
            viewEntityJsonMap[formTableName] = 'demand_goal_relationship';
        } else if (extendedFromTableName.indexOf("program") != -1) {
            viewEntityJsonMap[formTableName] = 'program_goal_relationship';
        }
    }
}

var view = viewEntityJsonMap[scriptedRelationshipName ? scriptedRelationshipName : formTableName];
if (view) {
    uri.set('sysparm_view', view);
}

path = checkWizard(uri, path);

if (path)
    action.setRedirectURL(uri.toString(path));

action.setNoPop(true);

function checkWizard(uri, path) {
    var already = uri.get('WIZARD:action');
    if (already == 'follow')
        return null;

    var wizID = new GlideappWizardIntercept(path).get();
    if (!wizID)
        return path;

    uri.set('sysparm_parent', wizID);
    uri.deleteParmameter('sysparm_referring_url');
    uri.deleteMatchingParameter('sysparm_list_');
    uri.deleteMatchingParameter('sysparm_record_');
    uri.deleteParmameter('sys_is_list');
    uri.deleteParmameter('sys_is_related_list');
    uri.deleteParmameter('sys_submitted');
    uri.deleteParmameter('sysparm_checked_items');
    uri.deleteParmameter('sysparm_ref_list_query');
    uri.deleteParmameter('sysparm_current_row');

    uri.set('sysparm_referring_url', uri.toString());
    uri.deleteMatchingParameter('fancy.');
    uri.deleteMatchingParameter('sys_rownum');
    uri.deleteMatchingParameter('sysparm_encoded');
    uri.deleteMatchingParameter('sysparm_query_encoded');
    uri.deleteParmameter('sysparm_refer');

    return 'wizard_view.do';
}
