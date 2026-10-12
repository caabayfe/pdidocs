// Sections metadata by type
var meta = {
  // Service Scorecard
  'cmdb_service_scorecard_overall': {
    url: '/$cmdb_scorecard.do?sysparm_type=overall'
  },
  'cmdb_service_scorecard_completeness': {
    url: '/$cmdb_scorecard.do?sysparm_type=completeness'
  },
  'cmdb_service_scorecard_compliance': {
    url: '/$cmdb_scorecard.do?sysparm_type=compliance'
  },
  'cmdb_service_scorecard_correctness': {
    url: '/$cmdb_scorecard.do?sysparm_type=correctness'
  },

  // Service Top List
  'cmdb_service_toplist_incident' : {
    url:'/$cmdb_widget_countlist.do?sysparm_task=incident'
  },
  'cmdb_service_toplist_alert' : {
    url:'/$cmdb_widget_countlist.do?sysparm_task=em_alert'
  },
  'cmdb_service_toplist_change' : {
    url:'/$cmdb_widget_countlist.do?sysparm_task=change_request'
  },
  'cmdb_service_dashboard_class_hierarchy' : {
    url: '/$cmdb_service_hierarchy.do?'
  }
};

// Function to return available widget 
function sections() {
  var obj = {};

  // Service Scorecards
  obj[gs.getMessage('CMDB Service Health Scorecard')] = { 'type': 'cmdb_service_scorecard_overall' };
  obj[gs.getMessage('CMDB Compliance Scorecard')] = { 'type': 'cmdb_service_scorecard_compliance' };
  obj[gs.getMessage('CMDB Correctness Scorecard')] = { 'type': 'cmdb_service_scorecard_correctness' };
  obj[gs.getMessage('CMDB Completeness Scorecard')] = { 'type': 'cmdb_service_scorecard_completeness' };

  // Service Count List
  obj[gs.getMessage('Top 10 Incident Generators')] = { 'type': 'cmdb_service_toplist_incident' };
  obj[gs.getMessage('Top 10 Alert Generators')] = { 'type': 'cmdb_service_toplist_alert' };
  obj[gs.getMessage('Top 10 Change Generators')] = { 'type': 'cmdb_service_toplist_change' };
   
  // Service Hierarchy Tree
  obj[gs.getMessage("CMDB Service Hierarchy")] = { "type" : "cmdb_service_dashboard_class_hierarchy" };
  
  return obj;
}

function render() {
  // Get widget
  var widget = renderer.getPreferences().get('type');
  
  // Get widget type
  var type = null;

  if(widget.indexOf('cmdb_service_scorecard') == 0)
    type = 'cmdb_service_scorecard';
  else if(widget.indexOf('cmdb_service_toplist') == 0)
    type = 'cmdb_service_toplist';
  else if(widget.indexOf('cmdb_service_dashboard_class_hierarchy') == 0) {
    type = 'cmdb_service_dashboard_class_hierarchy';
  }
  
  // If type is valid
  if(type == 'cmdb_service_scorecard' || type == 'cmdb_service_toplist' || type == 'cmdb_service_dashboard_class_hierarchy') {

    // Get metadata for the widget
    var m = meta[widget];

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
    // Default is business service dashboard
    jr.setVariable('jvar_service', 'cmdb_ci_service');  

    // Run a template that returns the iframe
    return jr.runFromTemplate('cmdb_service_widget_iframe.xml');
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
