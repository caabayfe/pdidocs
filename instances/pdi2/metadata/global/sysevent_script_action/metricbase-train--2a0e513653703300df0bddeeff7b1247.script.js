current.group_by == "" ? insertSingle() : insertGroup();

function insertSingle() {
	// Query metric table
	var metricTable = new GlideRecord(current.metric_table);
	metricTable.addEncodedQuery(current.filter);
	metricTable.setLimit(1000);
	metricTable.query();
	
	if (!metricTable.hasNext()) {
		var noRowsMessage = 'No rows returned from query on ' + current.metric_table + ' table during training of ' + current.name;
		gs.logWarning(noRowsMessage);
		markTrainingOutcome('Training failed. ' + noRowsMessage);
		return;
	}
	
	var truncateMessage = '';
	if (metricTable.getRowCount() == 1000) {
		truncateMessage = 'Truncated rows on ' + current.metric_table + ' in order to train quickly. Consider a filter or grouping by a field to avoid this';
		gs.logWarning(truncateMessage);
		truncateMessage = ' ' + truncateMessage;
	}

	var model = trainModel(metricTable);

	if (model.getData() == null) {
		var failedMessage = 'No trained model was returned, check that the metric has data for the chosen training period.';
		gs.logWarning(failedMessage);
		markTrainingOutcome('Training failed. ' + failedMessage + truncateMessage);
	} else {
		// Insert model instance
		var modelInstance = new GlideRecord('mb_model_instance');
		modelInstance.mb_model = current.sys_id;
		modelInstance.model_string = model.getData().toModelString();
		modelInstance.name = current.name;
		modelInstance.insert();
		markTrainingOutcome('Training successful.' + truncateMessage);
	}
}

function insertGroup() {
	var gr = new GlideRecord(current.metric_table);
	gr.setLimit(1);
	gr.query();
	gr.next();
	var groupElem = gr.getElement(current.group_by);
	var isGroupReference = (groupElem.getReferenceTable() != null);

	// Query metric table for each group
	var metricTable = new GlideAggregate(current.metric_table);
	metricTable.groupBy(current.group_by);
	metricTable.addEncodedQuery(current.filter);
	metricTable.query();
	var numberOfGroups = metricTable.getRowCount(); // save number of groups
	
	if (numberOfGroups == 0) {
		var noRowsMessage = 'No rows returned from query on ' + current.metric_table + ' table during training of ' + current.name;
		gs.logWarning(noRowsMessage);
		markTrainingOutcome('Training failed. ' + noRowsMessage);
		return;
	}
	
	var truncateGroups = '';
	if (numberOfGroups > 50) {
		truncateGroups = 'Truncated after 50 groups on ' + current.metric_table + ' for the ' + current.group_by + ' field in order to train quickly. Consider grouping by a different field or adding a filter to avoid this.';
		gs.logWarning(truncateGroups);
		truncateGroups = ' ' + truncateGroups;
		numberOfGroups = 50;
	}
	
	var truncateMessage = '';
	var failedCount = 0;
	var i = 0;
	while (metricTable.next() && i < 50) {
		i++;
		var group = metricTable.getValue(current.group_by);
		
		// query metric table
		var metricTableRecord = new GlideRecord(current.metric_table);
		metricTableRecord.addQuery(current.group_by, group);
		metricTableRecord.addEncodedQuery(current.filter);
		metricTableRecord.setLimit(1000);
		metricTableRecord.query();
		
		if (!metricTableRecord.hasNext()) {
			failedCount++;
			continue;
		}
		
		if (metricTableRecord.getRowCount() == 1000) {
			gs.logWarning('Truncated rows on ' + current.metric_table + ' in order to train quickly for ' + group + ' group. Consider a filter to avoid this');
			if (truncateMessage === '') // Only add this message once
				truncateMessage = ' Truncated rows on ' + current.metric_table + ' in order to train quickly. Consider a filter to avoid this';
		}
		
		var model = trainModel(metricTableRecord);
		var displayName = group;
		if (isGroupReference) {
			var refQ = new GlideRecord(current.metric_table);
			refQ.addQuery(current.group_by, group);
			refQ.setLimit(1);
			refQ.setQueryReferences(true);
			refQ.query();
			refQ.next();
			displayName = refQ.getDisplayValue(current.group_by) ? refQ.getDisplayValue(current.group_by) : refQ.getValue(current.group_by);
		}
		if (model.getData() == null) {
			failedCount++;
		} else {
			// Insert model instance
			var modelInstance = new GlideRecord("mb_model_instance");
			modelInstance.mb_model = current.sys_id;
			modelInstance.model_string = model.getData().toModelString();
			modelInstance.group_name = group;
			modelInstance.name = current.name + "/" + displayName;
			modelInstance.insert();
		}
	}
	
	if (failedCount == numberOfGroups) {
		var allGroupsFailed = 'No group returned a trained model, check that the metric has data for the chosen training period.';
		gs.logWarning(allGroupsFailed);
		markTrainingOutcome('Training failed. ' + allGroupsFailed + truncateGroups + truncateMessage);
	} else if (failedCount > 0) {
		var someFailed = failedCount + ' out of ' + numberOfGroups + ' groups failed to return a trained model. Check that the metric has data for the chosen training period.';
		gs.logWarning(someFailed);
		markTrainingOutcome('Training was partially successful, ' + someFailed + truncateGroups + truncateMessage);
	} else {
		markTrainingOutcome('Training successful.' + truncateGroups + truncateMessage);
	}
}

function markTrainingOutcome(message) {
	var modelRecord = new GlideRecord("mb_model");
	if (modelRecord.get(current.sys_id)) {
		modelRecord.training_outcome = message;
		modelRecord.update();
	}
}

function trainModel(metricTableRecord) {
	try {
		// Initialize transformer/transform
		var transformer = new sn_clotho.Transformer(metricTableRecord);
		
		var model = {};
		if (current.model_class.getValue() === "best_fit")
			model["models"] = ["arima", "probabilistic", "stl", "holtwinters"];
		else
			model["model"] = current.model_class.getValue();
	
		// Configure transformer for fit operation	
		var transform = transformer
			.metric(current.metric.element)
			.fit(model);

		// Execute the transform
		transformer.execute(new GlideDateTime(current.start), new GlideDateTime(current.end));
		
		// Collect transform results
		return transform.getResult();
	} catch (e) {
		markTrainingOutcome('Training failed. ' + e);
		current.setAbortAction(true);
	}
}
