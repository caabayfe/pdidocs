migrateVTBCardAndBoardLabels();

function createGlobalLabel(labelName) {
	var grLabel = new GlideRecord('label');
	grLabel.initialize();
	grLabel.name = labelName;
	grLabel.viewable_by = 'everyone';
	grLabel.global = true;
	grLabel.background_color = '#6ab7ef';
	return grLabel.insert();
}

function createBoardLabel(board, label, color, active, order) {
	var grBoardLabel = new GlideRecord('vtb_board_label');
	grBoardLabel.initialize();
	grBoardLabel.board = board;
	grBoardLabel.label = label;
	grBoardLabel.color = color;
	grBoardLabel.active = active;
	grBoardLabel.order = order;
	return grBoardLabel.insert();
}

function assignLabel(cardId, labelId, cardDisplayValue) {
	var grLabelEntry = new GlideRecord('label_entry');
	grLabelEntry.initialize();
	grLabelEntry.label = labelId;
	grLabelEntry.table = 'vtb_card';
	grLabelEntry.table_key = cardId;
	grLabelEntry.title = 'Visual Task Board Card - ' + cardDisplayValue;
	grLabelEntry.read = 'yes';
	grLabelEntry.notify_onchange = false;
	grLabelEntry.insert();
}

function queryLabelTable(name) {
	var grLabel = new GlideRecord('label');
	grLabel.addQuery('name', name);
	var qc = grLabel.addQuery('viewable_by', 'everyone');
	qc.addOrCondition('viewable_by', 'groups and users');
	grLabel.setLimit(1);
	grLabel.query();

	return grLabel;
}

function isSharedLabel(name) {
	var grLabel = new GlideAggregate('label');
	grLabel.addQuery('name', name);
	var qc = grLabel.addQuery('viewable_by', 'everyone');
	qc.addOrCondition('viewable_by', 'groups and users');
	grLabel.addAggregate('COUNT');
	grLabel.query();

	return grLabel.next() && grLabel.getAggregate('COUNT') > 0;
}

function migrateVTBCardAndBoardLabels() {
	var colors = ['#f95050', '#278efc', '#71e279', '#6d79e8', '#fc8a3d', '#fcc742', '#fa8da2'];
	var labelMap = {};
	var nameMap = {};
	var duplicateLabelMap = {};
	var duplicateLabelNameMap = {};

	var grBoard = new GlideRecord('vtb_board');
	grBoard.query();
	while (grBoard.next()) {
		var boardLabelIds = [];
		var boardDuplicateLabelCount = {};
		for (var i=1; i<=7; i++) {
			var labelNameOriginal = grBoard.getValue('label_'+i);
			if (labelNameOriginal == null)
				continue;

			var labelName = labelNameOriginal.toLowerCase();
			var labelId = labelMap[labelName] || (nameMap[labelName] && labelMap[nameMap[labelName]]);
			if (labelId && boardLabelIds.indexOf(labelId) > -1) {
				var index = boardDuplicateLabelCount[labelName] || 0;
				if (duplicateLabelNameMap[labelName] && index < duplicateLabelNameMap[labelName].length) {
					labelId = duplicateLabelNameMap[labelName][index];
					if (!boardDuplicateLabelCount[labelName])
						boardDuplicateLabelCount[labelName] = 0;

					boardDuplicateLabelCount[labelName]++;
				} else {
					var j;
					if (!labelMap[labelName] && nameMap[labelName])
						j = parseInt(nameMap[labelName].substr(nameMap[labelName].indexOf('.') + 1)) + 1;
					else
						j = 1;
					var newLabelName = labelNameOriginal+'.'+j;
					while (isSharedLabel(newLabelName)) {
						j++;
						newLabelName = labelNameOriginal+'.'+j;
					}
					labelId = createGlobalLabel(newLabelName);
					if (!boardDuplicateLabelCount[labelName])
						boardDuplicateLabelCount[labelName] = 0;

					if (!duplicateLabelNameMap[labelName])
						duplicateLabelNameMap[labelName] = [];

					boardDuplicateLabelCount[labelName]++;
					duplicateLabelNameMap[labelName].push(labelId);
				}

				duplicateLabelMap[grBoard.getUniqueValue()+'_label_'+i] = labelId;
			}

			if (!labelId) {
				// Check name collision with labels viewable by groups and users.
				// No need to check name collision with labels viewable by me.
				var grLabel = queryLabelTable(labelName);

				if (grLabel.next()) {
					if (grLabel.getValue('viewable_by') == 'everyone') {
						labelId = grLabel.getUniqueValue();
						labelMap[labelName] = labelId;
					} else {
						// If a shared label with this name already exists, add a suffix.
						nameMap[labelName] = labelNameOriginal + '.1';
						for (j=2; isSharedLabel(nameMap[labelName]); j++) {
							nameMap[labelName] = labelNameOriginal + '.' + j;
						}

						labelId = createGlobalLabel(nameMap[labelName]);
						labelMap[nameMap[labelName]] = labelId;
					}
				} else {
					labelId = createGlobalLabel(labelNameOriginal);
					labelMap[labelName] = labelId;
				}
			}

			boardLabelIds.push(labelId);
			createBoardLabel(grBoard.getUniqueValue(), labelId, colors[i-1], grBoard.getValue('label_'+i+'_active'), i-1);
		}
	}

	var grCard = new GlideRecord('vtb_card');
	grCard.addQueryString('removed=false^label_1=true^ORlabel_2=true^ORlabel_3=true^ORlabel_4=true^ORlabel_5=true^ORlabel_6=true^ORlabel_7=true', true);
	grCard.query();
	var boardMap = {};
	while (grCard.next()) {
		var boardId = grCard.getValue('board');
		if (!boardMap[boardId]) {
			grBoard = new GlideRecord('vtb_board');
			grBoard.get(boardId);

			boardMap[boardId] = {};
			for (i=1; i<=7; i++) {
				var labelValue = grBoard.getValue('label_'+i);
				if (labelValue)
					boardMap[boardId]['label_'+i] = labelValue.toLowerCase();
			}
		}

		var labels = [];
		for (i=1; i<=7; i++) {
			if (boardMap[boardId]['label_'+i] && grCard.getValue('label_'+i) == '1') {
				labelName = boardMap[boardId]['label_'+i];
				labelId = duplicateLabelMap[boardId+'_label_'+i] ||
					labelMap[labelName] ||
					labelMap[nameMap[labelName]];
				labels.push(labelId);
			}
		}

		for (i=0; i<labels.length; i++) {
			assignLabel(grCard.getUniqueValue(), labels[i], grCard.getDisplayValue());
		}
	}
}
