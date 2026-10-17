var responseData = new Map();
responseData.validationResult = undefined;
responseData.workingData = undefined;
responseData.wrapperDataMap = new Map();
responseData.pendingECCIds = new Map();
populateViewData(true);

const lengthLimit = 38;

function addHeaderRowColumns(headerRow, columnHeaders) {
	columnHeaders.forEach((name) => {
		const col = document.createElement('td');
		col.textContent = name;
		headerRow.appendChild(col);
	});
}

function addDataRowColumns(tableData, rowData, rowVariables, limitLen) {
	const row = document.createElement('tr');
	tableData.appendChild(row);
	rowVariables.forEach((rowItem) => {
		const col = document.createElement('td');
		row.appendChild(col);
		if (rowItem in rowData) {
			const value = rowData[rowItem] + '';
			const innerElem = document.createElement('p');
			innerElem.setAttribute('title', value);
			col.appendChild(innerElem);
			if (value.length > limitLen) {
				innerElem.textContent = value.substring(0, limitLen - 3) + '...';
			} else {
				innerElem.textContent = value;
			}
		}
	});
}

function populateMismatchTableWithData(tableData, listData, headerNameList, headerMappedFieldNameList, limitLen) {
	const headerRow = document.createElement('tr');
	headerRow.setAttribute('style', 'text-align: center; font-weight: bold;');
	tableData.appendChild(headerRow);

	addHeaderRowColumns(headerRow, headerNameList);

	listData.forEach((rowData) => {
		addDataRowColumns(tableData, rowData, headerMappedFieldNameList, limitLen);
	});
}

function displayMismatchTypeData(tableTd, midMismatchData, identifier) {

	midMismatchData.mismatches.forEach((mismatchData) => {

		if (mismatchData.mismatch_count == 0)
			return;

		const header = document.createElement('p');
		header.setAttribute('style', 'font-weight: bold;');
		header.textContent = mismatchData.type;

		const expandLink = document.createElement('a');
		expandLink.setAttribute('id', 'expand_' + identifier + '_' + mismatchData.type);
		expandLink.setAttribute('style', 'color: #eb5534');
		expandLink.setAttribute('onclick', 'manipulateTable(\'' + identifier + '_' + mismatchData.type + '\')');
		expandLink.textContent = '   ( ' + mismatchData.mismatch_count + ' Mismatch + )';

		tableTd.appendChild(header);
		header.appendChild(expandLink);

		const tableData = document.createElement('table');
		tableData.setAttribute('id', 'table_' + identifier + '_' + mismatchData.type);
		tableData.setAttribute('hidden', 'hidden');
		tableData.setAttribute('border', '2');
		tableData.setAttribute('style', 'width:100%;');
		tableTd.appendChild(tableData);

		const caption = document.createElement('caption');
		caption.setAttribute('style', 'text-align: center;background-color:powderblue;');
		caption.textContent = mismatchData.type;
		tableData.appendChild(caption);

		var headerNameList = [];
		var headerMappedFieldNameList = [];

		if (mismatchData.type == "Cluster") {
			headerNameList = ['Cluster Name', 'Cluster Type', 'Description'];
			headerMappedFieldNameList = ['name', 'type', 'description'];
		} else if ((mismatchData.type == "Config" || mismatchData.type == "Property")) {
			headerNameList = ['Key', 'Profile Value', 'MID Value', 'Description'];
			headerMappedFieldNameList = ['key', 'profile_value', 'mid_value', 'description'];
		} else if (mismatchData.type == "Application") {
			headerNameList = ['Application Name', 'Description'];
			headerMappedFieldNameList = ['name', 'description'];
		} else if (mismatchData.type == "IP Range") {
			headerNameList = ['Name', 'IP Range', 'Description'];
			headerMappedFieldNameList = ['name', 'range', 'description'];
		} else if (mismatchData.type == "Capability") {
			headerNameList = ['Name', 'Value', 'Description'];
			headerMappedFieldNameList = ['name', 'value', 'description'];
		} else if (mismatchData.type == "Wrapper") {
			headerNameList = ['Name', 'Source', 'Description'];
			headerMappedFieldNameList = ['key', 'source', 'result'];
		}

		populateMismatchTableWithData(tableData, mismatchData.data, headerNameList, headerMappedFieldNameList, lengthLimit);
	});
	if ('errors' in midMismatchData) {
		addErrorSection(tableTd, midMismatchData.errors, "Errors", 'mid_errors_'+identifier);
	}
}

function createMidMismatchTable(midTr, midMismatchData, identifier) {

	const tableData = document.createElement('table');
	tableData.setAttribute('id', 'table_' + identifier);
	tableData.setAttribute('hidden', 'hidden');
	tableData.setAttribute('border', '2');
	tableData.setAttribute('style', 'width:100%;');

	midTr.appendChild(tableData);

	const tableTr = document.createElement('tr');
	tableData.appendChild(tableTr);

	const tableTd = document.createElement('td');
	tableTr.appendChild(tableTd);

	displayMismatchTypeData(tableTd, midMismatchData, identifier);
}

function displayMidMismatchData (parent, midMismatchData) {
	var identifier = midMismatchData.name;

	if (!identifier)
		identifier = midMismatchData.sys_id;

	const seperator = document.createElement('hr');
	parent.appendChild(seperator);

	const midTr = document.createElement('tr');
	midTr.setAttribute('id', 'mid_' + identifier);
	parent.appendChild(midTr);

	var expandLink = undefined;

	var findingCount = midMismatchData.mismatch_count;

	if (midMismatchData.errors && midMismatchData.errors.length > 0)
		findingCount += 1;

	if (findingCount > 0) {
		expandLink = document.createElement('a');
		expandLink.setAttribute('id', 'expand_' + identifier);
		expandLink.textContent = '  ( ' + findingCount + ' Finding + )';
		expandLink.setAttribute('style', 'color: #eb5534');
		expandLink.setAttribute('onclick', 'manipulateTable(\'' + identifier + '\')');
	} else {
		expandLink = document.createElement('b');
		expandLink.textContent = '  ( ' + findingCount + ' Finding )';
	}

	const midName = document.createElement('p');
	midName.setAttribute('style', "font-weight: bold;");
	midName.textContent = "MID Server: " + identifier + " ";
	midName.appendChild(expandLink);

	if (midMismatchData.status != 'Up') {
		const midDownNote = document.createElement('b');
		midDownNote.setAttribute('style', "color: #278ecf;");
		midDownNote.textContent = ' **Mid Server Is ' + midMismatchData.status;
		if (midMismatchData.status == 'Down')
			midDownNote.textContent += ' - Results as of last sync. No wrapper validation performed.';
		midName.appendChild(midDownNote);
	} else {
		if (!('wrapperProcessed' in midMismatchData) || !midMismatchData.wrapperProcessed) {
			const pendingValidation = document.createElement('b');
			pendingValidation.setAttribute('style', "color: #278ecf;");
			pendingValidation.textContent = ' **Pending Wrapper Validation.';
			midName.appendChild(pendingValidation);
		}
	}

	midTr.appendChild(midName);

	createMidMismatchTable(midTr, midMismatchData, identifier);
}

function generateMismatchTable(topDiv, mismatchData) {
	topDiv.appendChild(document.createElement('br'));

	const dataMismatchDiv = document.createElement('div');
	dataMismatchDiv.setAttribute('id', "dataMismatchDiv");
	topDiv.appendChild(dataMismatchDiv);

	const divHeader = document.createElement('h4');
	divHeader.setAttribute('style', "text-align: center;");
	divHeader.textContent = 'Details of MID Servers with Mismatch';
	dataMismatchDiv.appendChild(divHeader);

	const divTable = document.createElement('table');
	divTable.setAttribute('border', '2');
	divTable.setAttribute('style', 'width:100%;');
	dataMismatchDiv.appendChild(divTable);

	// sorting the data to show proper values
	mismatchData.sort((a, b) => {
		if (b.mismatch_count != a.mismatch_count)
			return b.mismatch_count - a.mismatch_count;
		return getStatusPreference(b.status) - getStatusPreference(a.status);
	});

	mismatchData.forEach((midMismatchData) => {
		if (shouldShow(midMismatchData))
			displayMidMismatchData(divTable, midMismatchData);
	});
}

function getStatusPreference(status) {
	switch(status) {
		case 'Up':
			return 2;
		case 'Down':
			return 1;
		case 'Invalid':
			return 0;
	}
}

function shouldShow (midMismatchData) {
	return midMismatchData.mismatch_count > 0 || midMismatchData.status != 'Up' || !midMismatchData.wrapperProcessed;
}

function generateSubHeader(value, color, strongText) {
	const subHeader = document.createElement('p');
	var style = "text-align: left;";
	if (color)
		style += "color: " + color +";";
	subHeader.setAttribute('style', style);

	if (strongText) {
		const strongTextElem = document.createElement('strong');
		strongTextElem.textContent = value;
		subHeader.appendChild(strongTextElem);
	} else {
		subHeader.textContent = value;
	}

	return subHeader;
}

function generateHeader(topDiv, workingData) {

	var midCount = 0;
	if('mids' in workingData)
		midCount = Math.round(workingData.mids.length);

	topDiv.appendChild(generateSubHeader("Total number of MID: " + midCount, 'black', true));


	var midsWithMismatch = 0;
	if('mid_mismatch_data' in workingData)
		midsWithMismatch = workingData.mid_mismatch_data.filter((data) => data.mismatch_count > 0).length;
	topDiv.appendChild(generateSubHeader("Total number of MID with mismatch: " + midsWithMismatch , 'black', true));

	if (responseData.pendingECCIds.size != 0) {
		const subHeader = generateSubHeader("Pending wrapper validation response for: " + responseData.pendingECCIds.size + ' Mid Server. (Refresh to check for recent data.)', '#278ecf', true);

		topDiv.appendChild(subHeader);
		const refreshButton = document.createElement('button');
		refreshButton.setAttribute('type', 'button');
		refreshButton.setAttribute('onclick', 'populateViewData(false)');
		refreshButton.textContent = 'Refresh';
		topDiv.appendChild(refreshButton);
	} else {
		const subHeader = generateSubHeader("All validation data recieved. Wrapper validations only performed on Up MID Servers.", '#278ecf', false);
		topDiv.appendChild(subHeader);
	}
}

function populateViewData(forceReload) {
	fetchValidationDataAndPopulate(forceReload);
}

function fetchValidationDataAndPopulate(forceReload) {

	var profileHeader = document.getElementById("profile_header");
	var profileNumber = profileHeader.innerText;

	if ("validationResult" in responseData && !forceReload) {
		fetchConfigValidationResultsAndPopulate();
		return;
	}

	// restting page till data is available
	setPageToLoading();

	var ga = new GlideAjax('MIDProfileValidationAjax');
    ga.addParam('sysparm_name', 'ajaxFunction_verifyProfile');
    ga.addParam('sysparm_mid_ids', '');
    ga.addParam('trigger_profile_validation_requests', true);
    ga.addParam('sysparm_profile_number', profileNumber);

	ga.getXMLAnswer(function(response){
		// try {
			//cached copy of original response
			responseData.validationResult = response;

			var json_response = JSON.parse(response);

			// keeping a map of wrapper request data for O(1) access
			if ("wrapper_request_data" in json_response) {
				json_response.wrapper_request_data.forEach((data => {
					responseData.wrapperDataMap.set(data.sys_id, data);
				}));
			}

			fetchConfigValidationResultsAndPopulate();
		// } catch (error) {
		// 	handleError(error);
		// }
	});
}

function setPageToLoading() {
	const placeholder = document.getElementById("dynamic_section");
	placeholder.innerHTML ="Loading....";
}

function handleError(error) {
	console.log(error);
	//todo: show error on UI
}

function fetchConfigValidationResultsAndPopulate() {

	// resetting the value as we will populate it again
	responseData.pendingECCIds.clear();

	var ecc_request_ids = [];

	responseData.wrapperDataMap.forEach((value, key) => {
		if ('request_id' in value && !('error' in value) && !('response' in value)) {
			ecc_request_ids.push(value.request_id);
			responseData.pendingECCIds.set(value.request_id, value);
		}
	});

	if (responseData.pendingECCIds.size != 0) {

		// restting page till data is available
		setPageToLoading();

		// ajax request to get the results for the profile ecc queue based request
		var ga = new GlideAjax('MIDProfileValidationAjax');
		ga.addParam('sysparm_name', 'ajaxFunction_getProfileEccVerificationResults');
		ga.addParam('ecc_request_ids', ecc_request_ids.join(','));

		ga.getXMLAnswer(function(response){
			// try {
				var json_response = JSON.parse(response);

				var processed_ids = [];

				for (const key in json_response) {

					processed_ids.push(key);
					var value = json_response[key];

					obj = responseData.pendingECCIds.get(key);

					if (obj) {
						if ('error' in value)
							obj.error = value.error;
						if ('response' in value)
							obj.response = value.response;

						if ('error' in value || 'response' in value) {
							obj.wrapperProcessed = true;
						}
					}

					responseData.pendingECCIds.delete(key);
				}

				prepareDataAndUpdateUI(responseData);
			// } catch (error) {
			// 	handleError(error);
			// }

		});
	} else {
		prepareDataAndUpdateUI(responseData);
	}
}

function prepareDataAndUpdateUI(data) {
	// reparsing is intentional. using original data and not old modified data
	responseData.workingData = JSON.parse(responseData.validationResult);

	midDataMap = {};

	if ("mid_mismatch_data" in responseData.workingData) {
			responseData.workingData.mid_mismatch_data.forEach((data) => {
			midDataMap[data.sys_id] = data;
		});
	}

	// processing wrapper validation response and adding it to mid data
	responseData.wrapperDataMap.forEach((value, key) => {

		// we expect this data to always exist but if it does not creating dummy data for ui
		if (!(key in midDataMap)) {
			//todo
			midData = {};
			midData.status = value.status;
			midData.sys_id = key;
			midData.name = "";
			midData.errors = [];
			midData.errors.push("Unable to get proper validation for: " + key);
			midDataMap[key] = midData;
		}
		var obj = midDataMap[key];

		if (value.status != 'Up')
			obj.status = value.status;

		if ('error' in value || 'response' in value) {
			obj.wrapperProcessed = true;
		} else {
			obj.wrapperProcessed = false;
		}

		if ('error' in value) {
			if (!('errors' in obj))
				obj.errors = [];
			obj.errors.push(value.error);
		}

		if ('response' in value && value.response.length > 0) {

			// if there were no mismatched in in memory data
			if (!('mismatches' in obj))
				obj.mismatches = [];

			var mismatchData = {};
			mismatchData.type = 'Wrapper';
			mismatchData.mismatch_count = value.response.length;
			mismatchData.data = value.response;

			obj.mismatches.push(mismatchData);

			obj.mismatch_count += value.response.length;
			responseData.workingData.mismatch_count += value.response.length;
		}
	});

	updateUI(responseData);
}

function addErrorSection(parent, errors, caption, unique_id) {
	if (!errors || errors.length == 0)
		return;


	const captionText = document.createElement('p');
	captionText.setAttribute('style', "font-weight: bold;");
	captionText.textContent =  caption + " ";
	parent.appendChild(captionText);

	const expandLink = document.createElement('a');
	expandLink.setAttribute('id', 'expand_' +unique_id);
	expandLink.setAttribute('style', 'color: #eb5534');
	expandLink.setAttribute('onclick', 'manipulateTable(\''+ unique_id + '\')');
	expandLink.textContent = ' ( Count: ' + errors.length + ' + ) ';
	captionText.appendChild(expandLink);

	const tableData = document.createElement('table');
	tableData.setAttribute('id', 'table_' + unique_id);
	tableData.setAttribute('hidden', 'hidden');
	tableData.setAttribute('border', '2');
	tableData.setAttribute('style', 'width:100%;');
	parent.appendChild(tableData);

	const banner = document.createElement('caption');
	banner.setAttribute('style', 'text-align: center;background-color:#fbd8ca;');
	banner.textContent = caption;
	tableData.appendChild(banner);

	var list = [];
	for (var i = 0; i < errors.length; i++) {
		var obj = {};
		obj.error = errors[i];
		obj.index = i+1;
		list.push(obj);
	}
	populateMismatchTableWithData(tableData, list, ['No.','Error'], ['index','error'], 10000);
}

function updateUI(data) {

	// finding the placeholder element and resetting entire UI
	const placeholder = document.getElementById("dynamic_section");
	placeholder.innerHTML ="";

	if (!('workingData' in data)) {
		placeholder.innerHTML = "Error encountered generating validation results.";
		return;
	}

	const workingData = data.workingData;

	const topDiv = document.createElement('div');
	placeholder.appendChild(topDiv);
	topDiv.setAttribute('style', "overflow-y: auto;");

	generateHeader(topDiv, workingData);

	if ('errors' in workingData) {
		addErrorSection(topDiv, workingData.errors, "Errors", 'top_level_errors');
	}

	if ('mid_mismatch_data' in workingData && workingData.mid_mismatch_data.length > 0) {

		var mismatchExists = false;
		workingData.mid_mismatch_data.forEach((data) => {
			if (shouldShow(data))
				mismatchExists = true;
		});

		if (mismatchExists)
			generateMismatchTable(topDiv, workingData.mid_mismatch_data);
	}
}

function manipulateTable(mid_name) {

	var tag = document.getElementById("expand_" + mid_name);
	var table = document.getElementById("table_" + mid_name); 

	if (tag.innerHTML.includes('+')) {
		tag.innerHTML = tag.innerHTML.replace('+', '-');
		table.removeAttribute("hidden");
	} else {
		tag.innerHTML = tag.innerHTML.replace('-', '+');
		table.setAttribute("hidden", "hidden");
	}
}
