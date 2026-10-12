// Sections metadata by type
var meta = {
  // Group Scorecard
  'cmdb_group_scorecard_overall': {
    url: '/$cmdb_scorecard.do?sysparm_type=overall'
  },
  'cmdb_group_scorecard_completeness': {
    url: '/$cmdb_scorecard.do?sysparm_type=completeness'
  },
  'cmdb_group_scorecard_compliance': {
    url: '/$cmdb_scorecard.do?sysparm_type=compliance'
  },
  'cmdb_group_scorecard_correctness': {
    url: '/$cmdb_scorecard.do?sysparm_type=correctness'
  },

  // Group Top List
  'cmdb_group_toplist_incident' : {
    url:'/$cmdb_widget_countlist.do?sysparm_task=incident'
  },
  'cmdb_group_toplist_alert' : {
    url:'/$cmdb_widget_countlist.do?sysparm_task=em_alert'
  },
  'cmdb_group_toplist_change' : {
    url:'/$cmdb_widget_countlist.do?sysparm_task=change_request'
  },
  'cmdb_group_dashboard_class_hierarchy' : {
    url: '/$cmdb_group_hierarchy.do?'
  }
};

// Function to return available widget 
function sections() {
  var obj = {};
 
  // Group Scorecards
  obj[gs.getMessage('CMDB Group Health Scorecard')] = { 'type': 'cmdb_group_scorecard_overall' };
  obj[gs.getMessage('CMDB Group Compliance Scorecard')] = { 'type': 'cmdb_group_scorecard_compliance' };
  obj[gs.getMessage('CMDB Group Correctness Scorecard')] = { 'type': 'cmdb_group_scorecard_correctness' };
  obj[gs.getMessage('CMDB Group Completeness Scorecard')] = { 'type': 'cmdb_group_scorecard_completeness' };

  // Group Count List
  obj[gs.getMessage('Top 10 Incident Generators')] = { 'type': 'cmdb_group_toplist_incident' };
  obj[gs.getMessage('Top 10 Alert Generators')] = { 'type': 'cmdb_group_toplist_alert' };
  obj[gs.getMessage('Top 10 Change Generators')] = { 'type': 'cmdb_group_toplist_change' };
   
  // Group Hierarchy Tree
  obj[gs.getMessage('CMDB Health Group List')] = { 'type' : 'cmdb_group_dashboard_class_hierarchy' };
  
  return obj;
}

function render() {
  // Get widget
  var widget = renderer.getPreferences().get('type');
  
  // Get widget type
  var type = null;

  if(widget.indexOf('cmdb_group_scorecard') == 0)
    type = 'cmdb_group_scorecard';
  else if(widget.indexOf('cmdb_group_toplist') == 0)
    type = 'cmdb_group_toplist';
  else if(widget.indexOf('cmdb_group_dashboard_class_hierarchy') == 0) {
    type = 'cmdb_group_dashboard_class_hierarchy';
  }
  
  // If type is valid
  if(type == 'cmdb_group_scorecard' || type == 'cmdb_group_toplist') {

    // Get metadata for the widget
    var m = meta[widget];
	  
	var firstGroupId = '';
	  
	// Get the first group
	var gr = new GlideRecord('cmdb_group');
	gr.addQuery('group_type', 'health');
	gr.orderBy('group_name');
	gr.query();
	  
	if(gr.next()) {
		firstGroupId = gr.getUniqueValue();
	}

    // Create a jelly runner to insert an iframe
    var jr = new GlideJellyRunner();
    renderer.getRenderProperties().setDeferInlineScripts(false);
    jr.setRenderProperties(renderer.getRenderProperties());
    jr.setTwoPhase(true);
    
    // Set the URL the iframe should have and other variables
    jr.setVariable('jvar_type', type);
    jr.setVariable('jvar_widget', widget);
    jr.setVariable('jvar_uid', randInt(100000, 999999) + '' + randInt(100000, 999999));
    jr.setVariable('jvar_url', m.url); 
	jr.setVariable('jvar_cmdb_group', firstGroupId);

    // Run a template that returns the iframe
    return jr.runFromTemplate('cmdb_group_widget_iframe.xml');
  } else if(type == 'cmdb_group_dashboard_class_hierarchy') {
	  var jr = new GlideJellyRunner();
	  renderer.getRenderProperties().setDeferInlineScripts(false);
	  jr.setRenderProperties(renderer.getRenderProperties());
	  jr.setTwoPhase(true);
	  
	  return jr.runFromTemplate('cmdb_group_hierarchy_widget.xml');
  } else {
    // Default to NOOP
    return 'Invalid widget type';
  }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEditLink() {  
        return '';  
}
