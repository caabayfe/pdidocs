var ParRequiredTranslationsUtil = Class.create();
ParRequiredTranslationsUtil.prototype = {
	BATCH_SIZE: 100,

	initialize: function() {
		this.fHelper = new SNC.TranslationScriptable();
		this.fStats = {
			components: {processed: 0, skipped: 0, errors: 0},
			widgets: {processed: 0, skipped: 0, errors: 0}
		};
	},

	
	execute: function() {
		var startTime = new Date();

		// Process saved components first
		this._processComponents();

		// Process dashboard widgets grouped by dashboard
		this._processWidgets();

		var duration = (new Date() - startTime) / 1000;
		var totalProcessed = this.fStats.components.processed + this.fStats.widgets.processed;
		var totalSkipped = this.fStats.components.skipped + this.fStats.widgets.skipped;
		var totalErrors = this.fStats.components.errors + this.fStats.widgets.errors;

		if (totalProcessed > 0) {
			gs.info('==== Required Translations Fix script ======');
			gs.info('Duration: ' + Math.round(duration / 60) + ' min ' + Math.round(duration % 60) + ' sec');
			gs.info('Components Processed: ' + this.fStats.components.processed);
			gs.info('Widgets Processed: ' + this.fStats.widgets.processed);
			gs.info('Total Processed: ' + totalProcessed);
			gs.info('Total Skipped: ' + totalSkipped);
			gs.info('Total Errors: ' + totalErrors);
		}

		return {
			duration: duration,
			componentsProcessed: this.fStats.components.processed,
			widgetsProcessed: this.fStats.widgets.processed,
			totalProcessed: totalProcessed,
			totalSkipped: totalSkipped,
			totalErrors: totalErrors
		};
	},

	_processComponents: function() {
		this._processRecords({
			table: 'par_component',
			getFields: this._getComponentFields.bind(this)
		}, this.fStats.components);
	},

	_processWidgets: function() {
		var dashboardIds = this._getDashboardsWithoutRequiredTranslations();

		for (var i = 0; i < dashboardIds.length; i++) {
			var dashboardId = dashboardIds[i];
			this._processRecords({
				table: 'par_dashboard_widget',
				additionalQuery: function(gr) {
					gr.addQuery('canvas.dashboard', dashboardId);
				},
				getFields: this._getWidgetFields.bind(this)
			}, this.fStats.widgets);
		}
	},

	_getDashboardsWithoutRequiredTranslations: function() {
		var dashboardIds = [];
		var gagg = new GlideAggregate('par_dashboard_widget');
		gagg.addNullQuery('required_translations')
			.addOrCondition('required_translations', '')
			.addOrCondition('required_translations', '[]');
		gagg.addNotNullQuery('canvas.dashboard');
		gagg.groupBy('canvas.dashboard');
		gagg.query();

		while (gagg.next()) {
			var dashboardId = gagg.getValue('canvas.dashboard');
			if (dashboardId) {
				dashboardIds.push(dashboardId);
			}
		}

		return dashboardIds;
	},

	_getComponentFields: function(gr) {
		var props = gr.getValue('properties');
		var macro = gr.getValue('macroponent');
		if (!props || !macro) {
			return {valid: false};
		}

		return {
			valid: true,
			props: props,
			macroponent: macro,
			storedComponent: '',
			codePrefix: 'PAR_COMPONENT.' + gr.getValue('sys_id')
		};
	},

	_getWidgetFields: function(gr) {
		var props = gr.getValue('component_props');
		var comp = gr.getValue('component');
		var dashboard = gr.canvas.dashboard.toString();

		if (!props || !comp || !dashboard) {
			return {valid: false};
		}

		return {
			valid: true,
			props: props,
			macroponent: comp,
			storedComponent: gr.getValue('stored_component'),
			codePrefix: 'PAR_DASHBOARD.' + dashboard + '.' + gr.getValue('sys_id')
		};
	},

	_processRecords: function(config, stat) {
		var gr = new GlideRecord(config.table);
		gr.addNullQuery('required_translations')
			.addOrCondition('required_translations', '')
			.addOrCondition('required_translations', '[]');

		if (config.additionalQuery) {
			config.additionalQuery(gr);
		}

		gr.query();

		var batch = [];

		while (gr.next()) {
			try {
				var fields = config.getFields(gr);
				if (!fields.valid) {
					stat.skipped++;
					continue;
				}

				var translations = this.fHelper.buildRequiredTranslations(
					fields.props,
					fields.macroponent,
					fields.storedComponent || '',
					fields.codePrefix
				);

				if (!translations) {
					gs.error('Failed to build translations for ' + gr.getValue('sys_id') + ' in ' + config.table);
					stat.errors++;
					continue;
				}

				batch.push({
					table: config.table,
					sysId: gr.getValue('sys_id'),
					translations: translations
				});

				if (batch.length >= this.BATCH_SIZE) {
					this._processBatch(batch);
					stat.processed += batch.length;
					batch = [];
				}

			} catch (e) {
				gs.error('Error processing ' + gr.getValue('sys_id') + ' in ' + config.table + ': ' + e.message);
				stat.errors++;
			}
		}

		if (batch.length > 0) {
			this._processBatch(batch);
			stat.processed += batch.length;
		}
	},

	_processBatch: function(batch) {
		for (var i = 0; i < batch.length; i++) {
			var item = batch[i];
			try {
				var updateGr = new GlideRecord(item.table);
				updateGr.setWorkflow(false);
				updateGr.autoSysFields(false);
				if (updateGr.get(item.sysId)) {
					updateGr.setValue('required_translations', item.translations);
					updateGr.update();
				}
			} catch (e) {
				gs.error('Error updating ' + item.sysId + ' in ' + item.table + ': ' + e.message);
			}
		}
	},

	type: 'ParRequiredTranslationsUtil'
};
