var ScopedGlideQueryStringExecutor = Class.create();
ScopedGlideQueryStringExecutor.prototype = {
    parseQuery: function(table, query) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return [];
		
		var gqs = new GlideQueryString(table, query);
		gqs.deserialize();
		var termIterator = gqs.getTerms().iterator();
		var keyValuePairArray = [];
		var notSupportedOperators = ["SAMEAS", "NSAMEAS", "GT_FIELD", "LT_FIELD", "GT_OR_EQUALS_FIELD", "LT_OR_EQUALS_FIELD", "DYNAMIC", "MORETHAN", "LESSTHAN", "DATEPART", "RELATIVE"];
		var supportedDatatypes = ["glide_date_time", "boolean", "string", "integer", "reference", "glide_date", "decimal", "float", "field_list", "GUID", "ip_addr", "document_id", "choice"];
		var originalTable = table;

		while (termIterator.hasNext()) {
			var term = termIterator.next();
			var fieldValue = "";
			var keyValueObject = {};

			if (term.getTermField().includes("."))
				return [];

			if (notSupportedOperators.includes(term.getOperator()))
				return [];

			if (term.getOperator() == "=") {
				fieldValue = term.getValue();
				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);
			}

			else if (term.getOperator() == "ISEMPTY" || term.getOperator() == "EMPTYSTRING" ) {
				if (this.getDataTypeofElement(table, term.getTermField()) == "boolean" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "boolean")
					return [];

				fieldValue = "";
				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValueObject["operator"] = term.getOperator();
				keyValuePairArray.push(keyValueObject);
			}

			else if (term.getOperator() == "IN") {
				// If multiple values are provided, split them and select a random value
				var valuesList = term.getValue().split(',').map(function(value) {
					return value.trim();
				});

				// fieldValue = valuesList[Math.floor(Math.random() * valuesList.length)];
				if (valuesList.length < 1)
					return [];
				fieldValue = valuesList[0];

				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);
			}

			else if (term.getOperator() == "!=") {
				if (this.getDataTypeofElement(table, term.getTermField()) == "boolean" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "boolean")
					fieldValue = !term.getValue();
				
				else if (this.getDataTypeofElement(table, term.getTermField()) == "string" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "string" || 
				this.getDataTypeofElement(table, term.getTermField()) == "field_list" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "field_list" ||
				this.getDataTypeofElement(table, term.getTermField()) == "GUID" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "GUID" ||
				this.getDataTypeofElement(table, term.getTermField()) == "ip_addr" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "ip_addr" ||
				this.getDataTypeofElement(table, term.getTermField()) == "document_id" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "document_id" ||
				this.getDataTypeofElement(table, term.getTermField()) == "choice" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "choice") {
					// check which table to the element is present and then fetch the values
					var parentTableStr = GlideDBObjectManager.get().getBase(table);
					var getDataTypeStr = this.getDataTypeofElement(parentTableStr, term.getTermField());

					if (getDataTypeStr)
						table = parentTableStr;

					var grs = new GlideRecord(table);
					var choiceListSTR = j2js(grs.getElement(term.getTermField()).getChoices());
					if (choiceListSTR.length != 0) {
						var notInValuesSTR = term.getValue().trim();
						if (choiceListSTR.length > 0) {
							//fieldValue = choiceListSTR[Math.floor(Math.random() * choiceListSTR.length)];
							fieldValue = choiceListSTR[0];
							if (fieldValue == notInValuesSTR ) {
								if (choiceListSTR.length > 1)
									fieldValue = choiceListSTR[1];
								else
									return [];
							}
						}
						table = originalTable;
					}
					else {
						var randomValue = this.generateRandomString(10);
						if (randomValue === term.getValue()) {
						// If it matches, generate a new random string until it doesn't match the excluded value
						while (randomValue === term.getValue()) {
							randomValue = this.generateRandomString(10); // Change the length as needed
							}
						}
						fieldValue = randomValue;
					}
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "integer" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "integer" ||
				this.getDataTypeofElement(table, term.getTermField()) == "decimal" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "decimal" ||
				this.getDataTypeofElement(table, term.getTermField()) == "float" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "float") {
					// check which table to the element is present and then fetch the values
					var parentTableInt = GlideDBObjectManager.get().getBase(table);
					var getDataTypeINT = this.getDataTypeofElement(parentTableInt, term.getTermField());
					if (getDataTypeINT)
						table = parentTableInt;

					var grInt = new GlideRecord(table);
					var choiceListINT = j2js(grInt.getElement(term.getTermField()).getChoices());
					if (choiceListINT.length != 0) {
						var notInValuesINT = term.getValue().trim();
						if (choiceListINT.length > 0) {
							//fieldValue = choiceListINT[Math.floor(Math.random() * choiceListINT.length)];
							fieldValue = choiceListINT[0];
							if (fieldValue == notInValuesINT) {
								// while(fieldValue == notInValuesINT) {
								// 	fieldValue = choiceListINT[Math.floor(Math.random() * choiceListINT.length)];
								// }
								if (choiceListINT.length > 1)
									fieldValue = choiceListINT[1];
								else
									return [];
							}
						}
					}
					else {
						var randomNumber = this.generateRandomNumber(1, 1000);
						if (randomNumber === term.getValue()) {
						// If it matches, generate a new random string until it doesn't match the excluded value
						while (randomNumber === term.getValue()) {
							randomNumber = this.generateRandomNumber(1, 1000); // Change the length as needed
							}
						}
						fieldValue = randomNumber;
					}	
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "reference" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "reference") {
					var referenceTableName = this.getReferenceTableName(table, term.getTermField());
					if (!referenceTableName)
						return []; // TODO Add flag to cancel the test

					var sysIDsOfReferences = this.getReferenceSysIds(referenceTableName);
					if (!sysIDsOfReferences || sysIDsOfReferences.length == 0)
						return []; // TODO Add flag to cancel the test

					for (var i=0; i<sysIDsOfReferences.length; i++ ) {
						if (sysIDsOfReferences[i] != term.getValue()) {
							fieldValue = sysIDsOfReferences[i];
							break;
						}
					}
				}
				else {
					return [];
				}
				table = originalTable;
				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);
			}

			else if (term.getOperator() == "<=" || term.getOperator() == ">=")  {
				if (this.getDataTypeofElement(table, term.getTermField()) == "glide_date_time" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date_time" || 
				this.getDataTypeofElement(table, term.getTermField()) == "glide_date" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date") {
					var gdt = new GlideDateTime(term.getValue());
					fieldValue = gdt.getDisplayValue();
				}
				else
					fieldValue = term.getValue();

				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);
			}

			else if (term.getOperator() == "BETWEEN") {
				// TODO: Check empty cases and corner cases
				var valuesArray = term.getValue().split("@");
				var firstValue = valuesArray[0];
				var lastValue = valuesArray[1];

				if (!firstValue || !lastValue)
					return [];

				if (this.getDataTypeofElement(table, term.getTermField()) == "integer" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "integer" ||
				this.getDataTypeofElement(table, term.getTermField()) == "decimal" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "decimal" ||
				this.getDataTypeofElement(table, term.getTermField()) == "float" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "float") {
					if (lastValue - firstDate < 2)
						return [];
						
					var parentTable = GlideDBObjectManager.get().getBase(table);
					var getDataType = this.getDataTypeofElement(parentTable, term.getTermField());
					if (getDataType)
						table = parentTable;
					
					var grBT = new GlideRecord(table);
					var choiceListBT = j2js(grBT.getElement(term.getTermField()).getChoices());
					if (choiceListBT.length != 0) {
						fieldValue = choiceListBT[Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * choiceListBT.length)];
						if (fieldValue <= firstValue || fieldValue >= lastValue) {
							var count = 0;
							while (fieldValue <= firstValue || fieldValue >= lastValue) {
								fieldValue = choiceListBT[Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * choiceListBT.length)];
								count ++;

								if (count > 100)
									return [];
							}
						}
					}
					else {
						if (firstValue > lastValue || lastValue - firstValue < 3)
							return [];
						fieldValue = this.generateRandomNumber(firstValue - 1 + 2, lastValue - 1);
					}
						
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "string" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "string" ||
				this.getDataTypeofElement(table, term.getTermField()) == "GUID" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "GUID" ||
				this.getDataTypeofElement(table, term.getTermField()) == "ip_addr" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "ip_addr" ||
				this.getDataTypeofElement(table, term.getTermField()) == "choice" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "choice") {
					fieldValue = this.generateRandomString(10);
					if (fieldValue <= firstValue || fieldValue >= lastValue) {
						while (fieldValue <= firstValue || fieldValue >= lastValue) {
							fieldValue =  this.generateRandomString(10);
						}
					}
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "glide_date_time" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date_time" ||
				this.getDataTypeofElement(table, term.getTermField()) == "glide_date" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date") {
					var firstDate = new GlideDateTime(firstValue);
					var lastDate = new GlideDateTime(lastValue);
					firstDate.addSeconds(1);
					// TODO Add a check
					fieldValue = firstDate.getDisplayValue();
				}
				else {
					return [];
				}

				table = originalTable;
				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);
			}

			else if (term.getOperator() == "ISNOTEMPTY" || term.getOperator() == "ANYTHING") {
				if (this.getDataTypeofElement(table, term.getTermField()) == "string" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "string" ||
				this.getDataTypeofElement(table, term.getTermField()) == "field_list" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "field_list" ||
				this.getDataTypeofElement(table, term.getTermField()) == "GUID" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "GUID" ||
				this.getDataTypeofElement(table, term.getTermField()) == "ip_addr" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "ip_addr" ||
				this.getDataTypeofElement(table, term.getTermField()) == "document_id" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "document_id" ||
				this.getDataTypeofElement(table, term.getTermField()) == "choice" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "choice") {
					var parentTableforString = GlideDBObjectManager.get().getBase(table);
					var getDataTypeforString = this.getDataTypeofElement(parentTableforString, term.getTermField());

					if (getDataTypeforString)
						table = parentTableforString;

					var gr = new GlideRecord(table);
					var choiceListforString = j2js(gr.getElement(term.getTermField()).getChoices());
					//it means a choice string
					if (choiceListforString.length > 0)
						fieldValue = choiceListforString[0];
					else
						fieldValue = this.generateRandomString(10);

					table = originalTable;
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "glide_date_time" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date_time" ||
				this.getDataTypeofElement(table, term.getTermField()) == "glide_date" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date"){
					var currentDate = new GlideDateTime();
					// Subtract one day from the current date
					currentDate.addDays(-1);
					fieldValue = currentDate.getDisplayValue();
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "boolean" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "boolean")
					fieldValue = true;
				else if (this.getDataTypeofElement(table, term.getTermField()) == "integer" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "integer" ||
				this.getDataTypeofElement(table, term.getTermField()) == "decimal" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "decimal" ||
				this.getDataTypeofElement(table, term.getTermField()) == "float" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "float") {
					var parentTableforInteger = GlideDBObjectManager.get().getBase(table);
					var getDataTypeforInteger = this.getDataTypeofElement(parentTableforInteger, term.getTermField());
					if (getDataTypeforInteger)
						table = parentTableforInteger;

					var gr1 = new GlideRecord(table);
					var choiceListforInteger = j2js(gr1.getElement(term.getTermField()).getChoices());
					//it means a choice integer
					if (choiceListforInteger.length > 0)
						fieldValue = choiceListforInteger[0];
					else
						fieldValue = this.generateRandomNumber(1, 100);
					
					table = originalTable;
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "reference" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "reference") {
					var referTableName = this.getReferenceTableName(table, term.getTermField());
					if (!referTableName)
						return []; // TODO Add flag to cancel the test

					var referSysIds = this.getReferenceSysIds(referTableName);
					if (!referSysIds)
						return []; // TODO Add flag to cancel the test
					
					if (referSysIds.length > 0)
						fieldValue = referSysIds[0];
					else
						return [];
				}
				else {
					return [];
				}
				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);				
			}

			else if (term.getOperator() == "STARTSWITH" || term.getOperator() == "ENDSWITH" || term.getOperator() == "CONTAINS") {
				if (this.getDataTypeofElement(table, term.getTermField()) == "reference" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "reference") {
					return [];
				}
				var gr3 = new GlideRecord(table);
				var choiceList3 = j2js(gr3.getElement(term.getTermField()).getChoices());
				// It is a string
				if (!choiceList3 || choiceList3.length == 0)
					fieldValue = term.getValue();
				// else Choice List string
				else {
					// TODO: Check if the function returns empty string empty
					if (term.getOperator() == "STARTSWITH") {
						fieldValue = this.getElementforStringChoice(choiceList3, term.getValue(), "STARTSWITH");
						if (fieldValue == "")
							return [];
					}
					else if (term.getOperator() == "ENDSWITH") {
						fieldValue = this.getElementforStringChoice(choiceList3, term.getValue(), "ENDSWITH");
						if (fieldValue == "")
							return [];
					}
					else if (term.getOperator() == "CONTAINS") {
						fieldValue = this.getElementforStringChoice(choiceList3, term.getValue(), "CONTAINS");
						if (fieldValue == "")
							return [];
					}
				}

				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);	
			}

			else if (term.getOperator() == "<") {
				if (this.getDataTypeofElement(table, term.getTermField()) == "integer" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "integer" ||
				this.getDataTypeofElement(table, term.getTermField()) == "decimal" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "decimal" ||
				this.getDataTypeofElement(table, term.getTermField()) == "float" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "float") {
					var parentTableLt = GlideDBObjectManager.get().getBase(table);
					var getDataTypeLt = this.getDataTypeofElement(parentTableLt, term.getTermField());

					if(getDataTypeLt)
						table = parentTableLt;
					
					var grLt = new GlideRecord(table);
					var choiceListLt = j2js(grLt.getElement(term.getTermField()).getChoices());
					// TODO: check for infinite loop
					if (choiceListLt.length != 0) {
						fieldValue = choiceListLt[Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * choiceListLt.length)];
						if (fieldValue >= term.getValue()) {
							var counter = 0;
							while (fieldValue >= term.getValue()) {
								counter++;
								if (counter > 100)
									return [];

								fieldValue = choiceListLt[Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * choiceListLt.length)];
							}
						}
					}
					else {
						fieldValue = term.getValue() - 1;
					}

					table = originalTable;
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "glide_date_time" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date_time" ||
				this.getDataTypeofElement(table, term.getTermField()) == "glide_date" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date") {
					var gdtLt = new GlideDateTime(term.getValue());
					gdtLt.addDays(-1);
					fieldValue = gdtLt.getDisplayValue();
				}
				else {
					return [];
				}

				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);	
			}

			else if (term.getOperator() == ">") {
				if (this.getDataTypeofElement(table, term.getTermField()) == "integer" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "integer" || 
				this.getDataTypeofElement(table, term.getTermField()) == "decimal" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "decimal" ||
				this.getDataTypeofElement(table, term.getTermField()) == "float" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "float") {
					var parentTableGt = GlideDBObjectManager.get().getBase(table);
					var getDataTypeGt = this.getDataTypeofElement(parentTableGt, term.getTermField());
					if(getDataTypeGt)
						table = parentTableGt;
					
					var grGt = new GlideRecord(table);
					var choiceListGRT = j2js(grGt.getElement(term.getTermField()).getChoices());
					if (choiceListGRT.length != 0) {
						fieldValue = choiceListGRT[Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * choiceListGRT.length)];
						// TODO: check for infinite loop
						if (fieldValue <= term.getValue()) {
							var gtCounter = 0;
							while (fieldValue <= term.getValue()) {
								gtCounter++;

								if (gtCounter > 100)
									return [];
								fieldValue = choiceListGRT[Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * choiceListGRT.length)];
							}
						}
					}
					else {
						fieldValue = term.getValue() -1 + 2;
					}

					table = originalTable;
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "glide_date_time" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date_time" ||
				this.getDataTypeofElement(table, term.getTermField()) == "glide_date" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date") {
					var gdtGt = new GlideDateTime(term.getValue());
					gdtGt.addDays(1);
					fieldValue = gdtGt.getDisplayValue();
				}
				else {
					return [];
				}

				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);	
			}

			else if (term.getOperator() == "ON") {
				if (this.getDataTypeofElement(table, term.getTermField()) == "glide_date_time" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date_time" || 
				this.getDataTypeofElement(table, term.getTermField()) == "glide_date" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date"){
					// structure is like: opened_atONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()
					var getDate = term.getValue().split("@")[1];
					var onTime = new GlideDateTime(getDate);
					fieldValue = onTime.getDisplayValue();
				}
				else {
					return [];
				}

				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);	
			}

			else if (term.getOperator() == "NOTON") {
				if (this.getDataTypeofElement(table, term.getTermField()) == "glide_date_time" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date_time" ||
				this.getDataTypeofElement(table, term.getTermField()) == "glide_date" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "glide_date") {
					// structure is like: opened_atNOTONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()
					var notDate = term.getValue().split("@")[1];
					var notTime = new GlideDateTime(notDate);
					notTime.addDays(-1);
					fieldValue = notTime.getDisplayValue();
				}
				else {
					return [];
				}

				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);	
			}

			else if (term.getOperator() == "NOT IN") {
				var parentTableNt = GlideDBObjectManager.get().getBase(table);
				var getDataTypeNt = this.getDataTypeofElement(parentTableNt, term.getTermField());
				if (getDataTypeNt)
					table = parentTableNt;
				
				var grNt = new GlideRecord(table);
				var choiceListNt = j2js(grNt.getElement(term.getTermField()).getChoices());
				var notInValues = term.getValue().split(',');
				notInValues = notInValues.map(function(value) {
					return value.trim();
				});

				var availableValues = [];
				for (var ii = 0; ii < choiceListNt.length; ii++) {
					var value = choiceListNt[ii];
					if (!this.isValuePresent(notInValues, value)) {
						availableValues.push(value);
					}
				}
				// TODO: IF there is no values present, end the test gen
				if (availableValues.length > 0) {
					// fieldValue = availableValues[Math.floor(Math.random() * availableValues.length)];
					fieldValue = availableValues[0];
				}
				else {
					return [];
				}
				
				table = originalTable;
				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);
			}

			else if (term.getOperator() == "DOES NOT CONTAIN") {
				if (this.getDataTypeofElement(table, term.getTermField()) == "string" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "string" ||
				this.getDataTypeofElement(table, term.getTermField()) == "GUID" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "GUID" ||
				this.getDataTypeofElement(table, term.getTermField()) == "ip_addr" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "ip_addr" ||
				this.getDataTypeofElement(table, term.getTermField()) == "choice" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "choice") {
					var parentTableDnc = GlideDBObjectManager.get().getBase(table);
					var getDataTypeDnc = this.getDataTypeofElement(parentTableDnc, term.getTermField());
					if(getDataTypeDnc)
						table = parentTableDnc;
					
					var grDnc = new GlideRecord(table);
					var choiceListforDnc = j2js(grDnc.getElement(term.getTermField()).getChoices());
					//it means a choice string
					if (choiceListforDnc.length > 0) {
						// TODO: if no values can be selected, end test
						fieldValue = choiceListforDnc[Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * choiceListforDnc.length)];
						if (fieldValue.includes(term.getValue())) {
							var dnCounter = 0;
							while(fieldValue.includes(term.getValue())) {
								dnCounter ++;
								if (dnCounter >100)
									return [];
								fieldValue = choiceListforDnc[Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * choiceListforDnc.length)];
							}
						}
					}
					else {
						var randomString = this.generateRandomString(10);
						if (randomString.includes(term.getValue())) {
						// If it matches, generate a new random string until it doesn't match the excluded value
						while (randomString.includes(term.getValue())){
							randomString = this.generateRandomString(10); // Change the length as needed
							}
						}
						fieldValue = randomString;
					}
				}
				else if (this.getDataTypeofElement(table, term.getTermField()) == "reference" || this.getDataTypeofElement(GlideDBObjectManager.get().getBase(table), term.getTermField()) == "reference") {
					return []; // TODO: Make it fail tests
				}
				else {
					return [];
				}
				table = originalTable;
				keyValueObject["key"] = term.getTermField();
				keyValueObject["value"] = fieldValue;
				keyValuePairArray.push(keyValueObject);
			}
			
			else {
					return [];
				}
		}
		return keyValuePairArray;
    },

	getDataTypeofElement: function(table, element) {
		var grDictionary = new GlideRecord('sys_dictionary');
		grDictionary.addQuery('name', table);
		grDictionary.addQuery('element', element);
		grDictionary.query();

		// Check if the dictionary entry exists
		if (grDictionary.next()) {
			// Get the data type of the field
			var dataType = grDictionary.internal_type.toString();
			return dataType;
		}
	},

	generateRandomString: function(length) {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * charactersLength));
		}
		return result;
	},

	generateRandomNumber: function(min, max) {
		return Math.floor((GlideSecureRandomUtil.getSecureRandomIntBound(1000)/1000) * (max - min + 1)) + min;
	},

	getElementforStringChoice: function(values, element, operator) {
		if (operator == "STARTSWITH") {
			for (var i = 0; i < values.length; i++) {
				if (values[i].startsWith(element)) {
					return values[i];
				}	
			}
			return "";
		}
		else if (operator == "ENDSWITH") {
			for (var j = 0; j < values.length; j++) {
				if (values[j].endsWith(element)) {
					return values[j];
				}	
			}
			return "";
		}
		else if (operator == "CONTAINS") {
			for (var k = 0; k < values.length; k++) {
				if (values[k].indexOf(element) != -1) {
					return values[k];
				}
			}
			return "";
		}
	},

	isValuePresent: function (notInValues, element) {
		for (var i = 0; i < notInValues.length; i++) {
			if (notInValues[i] == element) {
				return true;
			}	
		}
		return false;
	},

	getReferenceTableName: function(tableName, fieldName) {
		var refernceRecord = new GlideRecord(tableName);
		if (!refernceRecord.isValid()) {
			return false;
		} else {
			// Get the dictionary entry for the reference field
			var element = refernceRecord.getElement(fieldName);
			if (element == null) {
				gs.info("Field '" + fieldName + "' does not exist in table '" + tableName + "'.");
				return false;
			} else if (element.getED().getInternalType() != "reference") {
				gs.info("Field '" + fieldName + "' in table '" + tableName + "' is not a reference field.");
				return false;
			} else {
				// Get the reference table name
				var refTableName = element.getReferenceTable();
				return refTableName;
			}
		}
	},

	getReferenceSysIds: function(tableName) {
		// Create an empty array to store sys_ids
		var sysIds = [];
		// Create a GlideRecord object for the specified table
		var gr = new GlideRecord(tableName);
		// Query all records in the table
		gr.query();
		// Iterate through each record
		while (gr.next()) {
			// Get the sys_id of the current record and add it to the array
			sysIds.push(gr.sys_id.toString());
		}
		return sysIds;
	},



	
    type: 'ScopedGlideQueryStringExecutor'
};
