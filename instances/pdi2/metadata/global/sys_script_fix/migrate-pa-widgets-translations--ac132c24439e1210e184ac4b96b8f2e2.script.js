var CODE_KEY = 'PAR_MIGRATION_COMPONENT';

function hasMigratedTranslations() {
	var grTranslation = new GlideRecord('sys_ui_message');
	grTranslation.addQuery('code', CODE_KEY);
	grTranslation.query();

	return grTranslation.getRowCount() > 0;
}

function getWidgetsToTranslate() {
	var widgetNames = [];

	var grComponentBridge = new GlideRecord('par_coreui_migration_bridge_component');
	grComponentBridge.addNotNullQuery('widget');
	grComponentBridge.addNullQuery('report');
	grComponentBridge.addNotNullQuery('component');
	grComponentBridge.addNullQuery('filter');
	grComponentBridge.addQuery('is_last', true);
	grComponentBridge.addQuery('type', 'widget');

	grComponentBridge.query();

	while(grComponentBridge.next()) {
		var nameKey = grComponentBridge.widget.name.toString().toLowerCase();
		widgetNames.push(nameKey);		
	}

	var arrayUtil = new ArrayUtil();
	return arrayUtil.unique(widgetNames); // return only the unique entries
}

function getSysTranslationRecords(names) {
	var translations = {};

	var grTranslations = new GlideRecord('sys_translated');
	grTranslations.addQuery('name', 'pa_widgets');
	grTranslations.addQuery('element', "name");
	grTranslations.addQuery('value', 'IN', names.join());

	grTranslations.query();

	while(grTranslations.next()){
		var translationKey = grTranslations.getValue('value');
		var language = grTranslations.getValue('language');
		var translation =  grTranslations.getValue('label');

		var translationObject = {
			key: translationKey,
			translation: translation,
			language: language
		};

		if (!translations[language])
			translations[language] = {};

		translations[language][translationKey] = translationObject;
	}
	return translations;
}


function createSysUiMessageTranslationRecord(translation) {
	var grTranslation = new GlideRecord('sys_ui_message');
	grTranslation.initialize();
	grTranslation.key = translation.key;
	grTranslation.message = translation.translation;
	grTranslation.language = translation.language;
	grTranslation.code = CODE_KEY;
	return grTranslation.insert();
}

function createSysUiMessageTranslationRecords(widgetNames, translations) {
	var sysIds = [];

	for(var language in translations){
		for(var i = 0; i < widgetNames.length; i++) {
			var name = widgetNames[i];
			var translation = translations[language][name];

			var sysId = createSysUiMessageTranslationRecord(translation);
			sysIds.push(sysId);
		}
	}
	
	return sysIds;
}

function hasMigratedDashboardArtifacts() {
	var unifiedAnalyticsEnabled = gs.getProperty('com.glide.par.unified_analytics.enabled', 'false') === 'true';

	var componentGr = new GlideRecord('par_coreui_migration_bridge_component');
	componentGr.query();

	return unifiedAnalyticsEnabled && componentGr.getRowCount();
}

function main() {
	gs.info("***Starting 'Migrate pa_widgets' translation records' fix script***");

	if(!hasMigratedDashboardArtifacts()) {
		gs.info('Bulk migration has not been performed or Platform Analytics Experience has not been activated. Could not query the translation records');
		gs.info("***End of 'Migrate pa_widgets' translation records' fix script***");
		return;
	}

	if(hasMigratedTranslations()){
		gs.info('Migrations have already been migrated. Nothing new to migrate');
		gs.info("***End of 'Migrate pa_widgets' translation records' fix script***");
		return;
	}
	
	var widgetNames = getWidgetsToTranslate();
	gs.info('Found: ' + widgetNames.length + ' unique pa_widget names');

	var translations = getSysTranslationRecords(widgetNames);

	var createdSysUiMessageSysIds = createSysUiMessageTranslationRecords(widgetNames, translations);
	
	gs.info('Created : ' + createdSysUiMessageSysIds.length + ' sys_ui_message records for various languages');
	gs.info('Created sys_ui_message sys_ids: ' + JSON.stringify(createdSysUiMessageSysIds));
	gs.info("***End of 'Migrate pa_widgets' translation records' fix script***");
}

main();
