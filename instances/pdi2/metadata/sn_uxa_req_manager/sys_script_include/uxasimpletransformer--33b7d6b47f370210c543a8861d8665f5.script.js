var UXASimpleTransformer = Class.create();
UXASimpleTransformer.prototype = {
    initialize: function() {
        this.utils = new UXAUtils();
    },

    transform: function(externalResponse, uxaDTO) {
        let result = this._getResultObject(uxaDTO);

        result.response = {
            ...result.response,
            data: this._getData(externalResponse, uxaDTO),
            metadata: this._getMetaData(externalResponse, result.response),
            filters: new UXAUtils().getFilterObject(uxaDTO)
        };

        return result;
    },

    //Returns Array of Array
    _getData: function({
        scoreData,
        changeData
    }, uxaDTO) {
        let scoreValue = scoreData.rows?.[0]?.[0] || '';
        let timeFlag = false;
        if (scoreValue && [UXAConstants.METRIC_FIELD.DURATION, UXAConstants.METRIC_FIELD.RETENTION.AVG_TIME_BETWEEN_SESSIONS].includes(uxaDTO.getMetricField()) && uxaDTO.getType() != UXAConstants.TYPE.PERFORMANCE) {
            timeFlag = true;
            scoreValue = scoreValue * 1000;
        }
        let valuesArray = [scoreValue];
        let keysArray = ["value"];

        if (changeData)
            Object.keys(changeData).forEach(key => {
                if (changeData[key] !== null) {
                    keysArray.push(key);
                    valuesArray.push((timeFlag && key == 'change') ? changeData[key] * 1000 : changeData[key]);
                }
            });

        return [keysArray, valuesArray];
    },

    _getMetaData: function({
        changeData,
        dateData
    }, {
        metadata
    }) {
        let metadataObj = this.__setScoreDateMetaData(dateData, metadata, changeData?.change);
        return metadataObj;
    },

    __setScoreDateMetaData: function(dateData, metadata, change) {
        if (!dateData)
            return metadata;
        let {
            previousStartTime,
            previousEndTime,
            startTime,
            endTime
        } = dateData;
        const changeArrow = !change ? null : (change > 0 ? UXAConstants.CHANGE_ARROW.UP : (change < 0 ? UXAConstants.CHANGE_ARROW.DOWN : UXAConstants.CHANGE_ARROW.NEUTRAL) );
		const cssCustomProperty = changeArrow === UXAConstants.CHANGE_ARROW.UP ? UXAConstants.CHANGE_ARROW.COLORS.POSITIVE : (changeArrow === UXAConstants.CHANGE_ARROW.DOWN ? UXAConstants.CHANGE_ARROW.COLORS.NEGATIVE : null ); 
		
        startTime = startTime.getLocalDate();
        endTime = endTime.getLocalDate();
        previousStartTime = previousStartTime.getLocalDate();
        previousEndTime = previousEndTime.getLocalDate();

        const metadataObj = {
            ...metadata,
            ...{
                "previousScoreDate": `${previousStartTime.getNumericValue()},${previousEndTime.getNumericValue()}`,
                "scoreDate": `${startTime.getNumericValue()},${endTime.getNumericValue()}`,
                "changeArrow": changeArrow,
                "changeColor": {
					"defaultColor": "30, 105, 34",
					"cssCustomProperty":  cssCustomProperty
				},
				"timeZone": "SESSION"
            }
        };
        return metadataObj;
    },

    _getResultObject: function(uxaDTO) {
        return {
            order: 0,
            response: {
                data: [],
                filters: {
                    "appliedFilters": [],
                    "notAppliedFilters": []
                },
                metadata: {
                    aggregateBy: 0,
                    aggregate: this._getAggregate(uxaDTO),
                    format: {
                        frequency: UXAConstants.TREND_INTERVAL.DAILY,
                        precision: 0,
                        unitFormat: '{0}'
                    },
                }
            }
        };
    },
    
    _getAggregate: function(uxaDTO) {
        return {
            fieldType: uxaDTO.getMetricField() === UXAConstants.METRIC_FIELD.DURATION ? UXAConstants.PAR_METRIC_FIELD.GLIDE_DURATION  : UXAConstants.PAR_METRIC_FIELD.DECIMAL
        };
    },

    type: 'UXASimpleTransformer'
};
