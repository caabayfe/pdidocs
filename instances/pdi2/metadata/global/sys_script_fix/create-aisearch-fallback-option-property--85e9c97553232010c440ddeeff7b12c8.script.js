var LOG_ID = '[Create AISearch Fallback Option Property]';
var PROP_NAME = 'remove_oob_ai_search_fallback_option_after_upgrade';
var PLUGIN = 'com.glide.cs.topics';
var OOB_CONTEXT_PROFILE_ID = '3a33973653211010a813ddeeff7b125a';

process();

function process() {

	// check if the plugin is installed or not
	// If the plugin is not installed, nothing to worry about.
	if (!isPluginInstalled(PLUGIN)) {
		gs.info('{0}:The plugin:"{1}" is not installed. No need to proceed', [LOG_ID, PLUGIN]);
		return;
	}
	
	// if the property already exists, remove the property. this should not happen.
	if (foundProperty() && removeProperty())
		gs.info('{0}:The property already existed. Removed the property:"{1}"', [LOG_ID, PROP_NAME]);
	
	//This is the case for if the fallback option value already exists, but the property value does not exist.
	//In this case, we need to keep the option value.
	if (foundAISearchFallbackOption()) {
		gs.info('{0}:Found the value for AISearch fallback option, This value for the option won\'t be removed',[LOG_ID, PROP_NAME]);
		return;
	}
	
	// 1. plugin is installed,
	// 2. The value for AI Search fallback option is not set
	// In this case, the fallback option needs to be removed after the upgrade.
	// In order to do that, a new property needs to be created. 
	// After the upgrade process, the property will be read, and used to remove the fallback option value
	if(!gs.nil(createProperty()))
		gs.info('{0}:The property-"{1}" is now created to remove AISearch fallback option after the upgrade', [LOG_ID, PROP_NAME]);
}

function isPluginInstalled(plugin) {
	// check if the plugin is installed.
	var pluginGr = new GlideRecord('sys_plugins');
	pluginGr.addActiveQuery();
	pluginGr.addQuery('source', plugin);
	pluginGr.query();

	return pluginGr.next();
}

function foundAISearchFallbackOption() {
	
	var TABLE_NAME = 'sys_cs_context_profile_topic';
	
	// if the table does not exist, return false.
	if(!gs.tableExists(TABLE_NAME))
		return false;
	
	var gr = new GlideRecord(TABLE_NAME);
	
	// the default chat OOB propfile
	gr.addQuery('context_profile', OOB_CONTEXT_PROFILE_ID);
	gr.addQuery('topic_type', 'ai_search_fallback');
	gr.addNotNullQuery('topic');
	gr.query();
	
	return gr.next();
}

function foundProperty() {
	return !gs.nil(gs.getProperty(PROP_NAME));
}

function createProperty(){
	var gr = new GlideRecord('sys_properties');
	gr.setValue('name', PROP_NAME);
	gr.setValue('value', "true");
	return gr.insert();
}

function removeProperty() {
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', PROP_NAME);
	gr.query();
	
	if(gr.next())
		return gr.deleteRecord();
	
	return false;
}
