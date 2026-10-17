var TBUtil = Class.create();

TBUtil.isGRInstance = function isGRInstance(gr) {
	return gr instanceof GlideRecord;
};

// Object assign pollyfill
TBUtil.assign = function assign(target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];
		for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key];
			}
		}
	}
	return target;
};

TBUtil.getValidTableId = function (value) {
	var gr = new GlideRecord(TBConstants.SYS_CLASS_DB_OBJECT);
	gr.addEncodedQuery('name=' + value + '^ORsys_id=' + value);
	gr.query();
	if (gr.next()) return gr.getValue('sys_id');
	else return value;
};

TBUtil.getRecordLimit = function getRecordLimit(offset, limit) {
	var baseLimit = limit || 10;
	var lower = (offset - 1) * baseLimit;
	var upper = offset * baseLimit;
	return {
		firstIndex: lower,
		lastIndex: upper,
	};
};

TBUtil.prepConditionalQuery = function prepConditionalQuery() {
	var querySets = Array.prototype.slice.call(arguments);
	return querySets
		.filter(function (qset) {
			return qset && qset.trim();
		})
		.join('^');
};

TBUtil.applySortQuery = function applySortQuery(query, sortQuery) {
	if (!gs.nil(sortQuery)) return query + '^EQ^' + sortQuery;
	return query;
};

TBUtil.getPerspectives = function () {
	var perspectives = [];
	for (var i in TBConstants.TB_PERSPECTIVES) {
		perspectives.push(TBConstants.TB_PERSPECTIVES[i]);
	}
	return perspectives;
};

/**
 * normalize query params values, which come in array
 */
TBUtil.normalizeQueryParams = function (params) {
	var nrm = {};
	Object.keys(params).forEach(function (item) {
		nrm[item] = params[item][0];
	});
	return nrm;
};

TBUtil.error = function (res) {
	var error = new sn_ws_err.ServiceError();
	error.setStatus(res.status || TBConstants.CODE_404);
	error.setMessage(res.message);
	error.setDetail(res.detail || '');
	return error;
};

// Note - not using now, but keeping it for sometime for future uses, if any.
TBUtil.getAdditionalInfo = function (fieldClass) {
	var typeRecord = new GlideRecord(TBConstants.FIELD_CLASS_TABLE);
	typeRecord.addQuery('name', fieldClass);
	typeRecord.query();
	typeRecord.next();
	var sysId = typeRecord.getValue('sys_id');
	var primitiveType = typeRecord.getValue('scalar_type');
	var additionalInfo = new GetAdditionalInformation(
		TBConstants.FIELD_CLASS_TABLE,
		sysId,
		primitiveType
	);

	return {
		icon: additionalInfo.getIcon(),
		image: additionalInfo.getImage(),
	};
};

TBUtil.getChoiceTypes = function () {
	var res = [];
	var gr = new GlideRecord(TBConstants.SYS_CLASS_CHOICE);
	gr.addQuery('name', TBConstants.SYS_CLASS_DICTIONARY);
	gr.addQuery('element', 'choice');
	gr.addQuery('language', gs.getSession().getLanguage());
	gr.query();
	while (gr.next()) {
		res.push({
			label: gr.getDisplayValue('label'),
			id: gr.getValue('value'),
		});
	}
	return res;
};

TBUtil.getReadOnlyOptionChoiceValues = function getReadOnlyOptionChoiceValues() {
	var res = [];
	var gr = new GlideRecord(TBConstants.SYS_CLASS_CHOICE);
	gr.addQuery('name', TBConstants.SYS_CLASS_DICTIONARY);
	gr.addQuery('element', 'read_only_option');
	gr.addQuery('language', gs.getSession().getLanguage());
	gr.orderBy('sequence');
	gr.query();
	while (gr.next()) {
		res.push({
			label: gr.getDisplayValue('label'),
			id: gr.getValue('value'),
			active: gr.getValue('inactive') == '0',
		});
	}

	// Sort: active first, then inactive
	res.sort(function (a, b) {
		return b.active - a.active;
	});

	return res;
};

TBUtil.getChoiceFieldMeta = function (choiceType, name, element) {
	var choices = [];

	var gr = new GlideRecord(TBConstants.SYS_CLASS_CHOICE);
	gr.addQuery('name', name);
	gr.addQuery('element', element);

	// if user session language is english - we have to send choice options whose language is only english
	// if user session language is non-english - we have to send choice options whose language is enligsh/session language
	var grOR = gr.addQuery('language', 'en');
	grOR.addOrCondition('language', gs.getSession().getLanguage());

	gr.query();
	while (gr.next()) {
		choices.push({
			sequence: gr.getValue('sequence') || '0',
			sysId: gr.getValue('sys_id'),
			label: gr.getDisplayValue('label'),
			value: gr.getValue('value'),
		});
	}
	return {
		choiceType,
		choices,
		name,
		element,
	};
};

TBUtil.isQueryHasTableFilter = function (query) {
	return query.indexOf('name=') !== -1;
};

TBUtil.prototype = {
	initialize() {},

	type: 'TBUtil',
};
