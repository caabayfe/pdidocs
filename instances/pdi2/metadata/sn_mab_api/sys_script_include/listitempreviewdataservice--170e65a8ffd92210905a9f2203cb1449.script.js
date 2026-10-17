/**
 * Service for retrieving live data for list item config and list stream live preview.
 */
class ListItemPreviewDataService {
    constructor() {
    }

    /**
     * Returns the preview data retrieved from a table for the correct record.
     *
     * @param {String} table - The table to retrieve the live data from
     * @param {Array} fields - The fields that we want data from (only for list item configs)
	 * @param {String} condition - Filter to apply on the table
     * @param {Number} sampleSize - Max records we want from the table
	 * @param {Array} listItemConfigs - An array of the information from the list item configs on a list stream
	 * 
	 * @returns {Array} An array containing the live data for the records filtered from the table.
     */
    getPreviewData(table, fields, condition, sampleSize, listItemConfigs) {
        try {
            if (!listItemConfigs) {
                return this.getListItemConfigPreviewData(table, fields, condition, sampleSize);
            } else {
                return this.getListStreamPreviewData(table, condition, sampleSize, listItemConfigs);
            }
        } catch (error) {
            gs.error(`[${this.constructor.name}]
                Unable to get preview data for: 
                ${table} because ${error}`);
                
            return [];
			
        }    
    }

    /**
     * Gets a preview data for list item configs.
     * 
     * We need to separately fetch card preview data for list item configs we only have one condition and fields from one
	 * card.
	 * 
     * @param {String} table - The table to retrieve the live data from
     * @param {Array} fields - The fields that we want data from (only for list item configs)
	 * @param {String} condition - Filter to apply on the table
     * @param {Number} sampleSize - Max records we want from the table
	 * 
	 * @returns {Array} An array containing the live data for the records filtered from the table.
     */
    getListItemConfigPreviewData(table, fields, condition, sampleSize) {
        const gr = new GlideRecordSecure(table);

        if (!gr.isValid()) {
            response.setError(new ErrorHandler().throwBadRequestError('Table: ' + table + ' is invalid'));
            return;
        }

        if (!fields || fields.length == 0) {
            return {
                previewData: []
            };
        }

        gr.addEncodedQuery(condition);
        gr.setLimit(sampleSize);
        gr.query();

        var previewData = [];
        while (gr.next()) {
            const previewRecord = {};
            fields.forEach((field) => {
                const element = gr.getElement(field.columnValue);
                if (field.fieldType == "FieldValue") {
                    try {
                        previewRecord[field.cellId] = {
                            value: element.getDisplayValue() + "",
                            type: element.getED().getInternalType() + ""
                        };
                    } catch (e) {
                        previewRecord[field.cellId] = {};
                    }
                } else if (field.fieldType == "FieldLabel") {
                    try {
                        previewRecord[field.cellId] = {
                            value: element.getLabel() + "",
                            type: element.getED().getInternalType() + ""
                        };
                    } catch (e) {
                        previewRecord[field.cellId] = {};
                    }
                }
            });

            previewData.push(previewRecord);
        }
        return previewData;
    }

	/**
     * Gets a preview data for list streams.
     * 
     * We need to separately fetch card preview data for list streams because there could be multiple list item configs and
	 * we need to fetch all records and apply order on the list of records so that the cards are displayed properly.
	 * 
     * @param {String} table - The table to retrieve the live data from
	 * @param {String} condition - Filter to apply on the table
     * @param {Number} sampleSize - Max records we want from the table
	 * @param {Array} listItemConfigs - An array of the information from the list item configs on a list stream
	 * 
	 * @returns {Array} An array containing the live data for the records filtered from the table.
     */
    getListStreamPreviewData(table, condition, sampleSize, listItemConfigs) {
        const previewRecords = {};

		const gr = new GlideRecordSecure(table);
		if (!gr.isValid()) {
			response.setError(new ErrorHandler().throwBadRequestError('Table: ' + table + ' is invalid'));
			return;
		}

		gr.addEncodedQuery(condition);
		gr.setLimit(sampleSize);
		gr.query();

		while (gr.next()) {
			previewRecords[gr.getValue('sys_id')] = {cardId: null};
		}
        return this.getFieldsForPreviewRecords(previewRecords, listItemConfigs, table, sampleSize);
	}

    /**
     * Gets the corrects fields from the list of records returned by the full condition.
     * 
     * This function loops through each list item configs applies its condition on the table so that we
     * can find the matching records and retrieve those fields. 
     * 
     * The list item configs are sorted by order so whichever condition the record matches first is the
     * card that will be displayed in the list stream preview.
	 * 
     * @param {String} previewRecords - The records returned from the full condition
     * @param {Array} listItemConfigs - An array of the information from the list item configs on a list stream
     * @param {String} table - The table to retrieve the live data from
     * @param {Number} sampleSize - Max records we want from the table
	 * 
	 * @returns {Array} An array containing the live data for the records filtered from the table.
     */
	getFieldsForPreviewRecords(previewRecords, listItemConfigs, table, sampleSize) {
			listItemConfigs.forEach((listItem) => {
				const currentFields = listItem.fields;
				const currentCondition = listItem.condition;
				const currentCard = listItem.cardMapping;

				const gr = new GlideRecord(table);
				gr.addEncodedQuery(currentCondition);
				gr.setLimit(sampleSize);
				gr.query();

				while(gr.next()) {
					const sysId = gr.getValue('sys_id');

					const matchingRecord = previewRecords[sysId];
					if (matchingRecord && matchingRecord.cardId === null) {
				
						previewRecords[sysId].cardId = currentCard.cardId;
						previewRecords[sysId].cardClassName = currentCard.cardClassName;

						currentFields.forEach((field) => {
							var element = gr.getElement(field.columnValue);
							if (field.fieldType == "FieldValue") {
								try {
									previewRecords[sysId][field.cellId] = {
										value: element.getDisplayValue() + "",
										type: element.getED().getInternalType() + ""
									};
								} catch (e) {
									previewRecords[sysId][field.cellId] = {};
								}
							} else if (field.fieldType == "FieldLabel") {
								try {
									previewRecords[sysId][field.cellId] = {
										value: element.getLabel() + "",
										type: element.getED().getInternalType() + ""
									};
								} catch (e) {
									previewRecords[sysId][field.cellId] = {};
								}
							}
						});
							

					}
				}
			});

		return Object.values(previewRecords);
	}
}

module.exports = ListItemPreviewDataService;
