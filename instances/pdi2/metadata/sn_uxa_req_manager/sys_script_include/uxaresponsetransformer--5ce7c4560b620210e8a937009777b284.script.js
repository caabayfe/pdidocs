var UxaResponseTransformer = Class.create();

const trendMapping = () => ({
	day: 'daily',
	week: 'weekly',
	month: 'monthly'
}); 

const convertTimestamp = timeStamp => Number(timeStamp);

UxaResponseTransformer.prototype = {
    initialize: function(requestType) {
		this.requestType = requestType;
    },
	
	responseTransformersMapping: function()  {
		return {
			simple: this.transformSimpleResponse
		};
	},
	
	transformScoreResponse: function (scoreData) {
		return scoreData[0]?.count;
	},
	
	transformTrendResponse: function (trendData) {
		if (!Array.isArray(trendData)) {
			return 'cannot transform trend data';
		}
  
		return trendData.map(point => ({
			date: convertTimestamp(point[0]),
			val: point[1]
		}));
	},

	transformChangeResponse: function (changeData) {
		if (!changeData) {
			return null;
		}
		
		const { change, changePercentage, previousStartTime, previousEndTime } = changeData;
  
		return {
			absolute: change,
			percentage: changePercentage,
			lastPeriodStart: previousStartTime,
			lastPeriodEnd: previousEndTime
		};
	},
	
	transformNextgenSimpleResponse: function (simpleData) {
		const { scoreResponse, trendResponse, changeResponse } = simpleData;
  
		return {
			score: this.transformScoreResponse(scoreResponse),
			change: changeResponse ? this.transformChangeResponse(changeResponse) : null,
			trend: trendResponse ? this.transformTrendResponse(trendResponse) : null
		};
	},
	
	transformSimpleResponse: function (simpleData) {
		switch (this.requestType) {
			case 'nextgen':
				return this.transformNextgenSimpleResponse(simpleData);
			case 'par':
				return this.transformParSimpleResponse(simpleData);
		}
	},
	transformNextgenData: function(data) {
		return data;
	},

	transformParSparklineResponse: function(trendData) {

		const { trendResponse, trendInterval, type } = trendData;
        
        const dataArray = [
			["timestamp", "value"],
			...trendResponse.map(point => [point[0], point[1]]),
		];
		
		return [{
			"response": {
				data: dataArray,
				metadata: {
					"series": [
						{
							"label": type,
							"id": "value",
							"type": "value"
						},
					],
					"aggregate": {
						"fieldType": "decimal"
					},
					"format": {
						"unitFormat": "{0}",
						"frequency": trendMapping[trendInterval],
						"precision": 0
					}
				}
			}
		}];
	},

	transformParChangeResponse: function(changeData) {
		const { change, changePercentage }= changeData;

		return [
			change,
			changePercentage
		];
	},
    
	newTransformParChangeResponse: function(changeData, scoreData) {
		const scoreValue = this.transformScoreResponse(scoreData);
		let keysArray = ["value"];
		let valuesArray = [scoreValue];

		Object.keys(changeData).forEach(key => {
			if (changeData[key] !== null) {
				keysArray.push(key);
			    valuesArray.push(changeData[key]);
			}
		});

		return [keysArray, valuesArray];
	},

    transformParChangeDatesResponse: function(changeData) {
      const { previousStartTime, previousEndTime, startTime, endTime } = changeData;
      
      return {
        "previousScoreDate": `${new Date(previousStartTime).getTime()},${new Date(previousEndTime).getTime()} `,
        "scoreDate": `${new Date(startTime).getTime()},${new Date(endTime).getTime()} `,
      };
    },
    
	transformParSimpleResponse: function(simpleData) {
		const { scoreResponse, trendResponse, changeResponse, dateResponse, trendInterval, type } = simpleData;

		const sparklineTransforemedResponse = trendResponse ? this.transformParSparklineResponse({trendResponse, trendInterval, type}) : null;

		const changeTransformedResponse = changeResponse ? this.newTransformParChangeResponse(changeResponse, scoreResponse) : null;
		
		const scoreDatesTransformedResponse = dateResponse ? this.transformParChangeDatesResponse(dateResponse) : null;
		
		const singleTransformedResponse = !changeResponse ? [["value"], [this.transformScoreResponse(scoreResponse)]] : changeTransformedResponse;
		
		const changeArrow = !changeResponse ? null :
		(changeTransformedResponse[0] > 0 ? "up" : (changeTransformedResponse[0] < 0 ? "down" : "neutral") );
        
        const cssCustomProperty = changeArrow === "up" ? "--now-datavis_color--positive" : (changeArrow === "down" ? "--now-datavis_color--negative" : null ); 
		
		const extraMetaData = {
			...(changeResponse ? {
				changeArrow: changeArrow,
				changeColor: {
					defaultColor: "30, 105, 34",
					cssCustomProperty:  cssCustomProperty
				},
			} : {}),
			...scoreDatesTransformedResponse
		};
		
        const transformedData = [{
                "response": {
                    "data": singleTransformedResponse,
                    "metadata": {
                        "aggregate": {
                            "fieldType": "decimal",
                        },
                        "format": {
                            "frequency": trendMapping[trendInterval],
                            "precision": 0,
                            "unitFormat": "{0}",
                        },
                        ...extraMetaData,
                    },
					sparkline: sparklineTransforemedResponse
                },
                "order": 0
            }];
        return transformedData;
    },

	transformParTrendData: function(trendData) {
        const { trendResponse, trendInterval, type } = trendData;

        const transformedData = [{
                "order": 0,
                "response": {
                    "metadata": {
                        "format": {
                            "frequency": trendMapping[trendInterval],
                            "precision": 0,
                            "unitForma": "{0}",
                        },
						"trendBy": {
                            "label": "Activity due",
                            "id": "activity_due",
                            "fieldType": "due_date",
                        },
                        "series": [{
                            "label": type,
                            "id": "value",
                            "type": "value",
                        }, ],
                    },
                    "data": this.transformTrendResponse(trendResponse)
                }
            }];
        return transformedData;
    },

	transformGroupByData: function(groupbyData) {
		const { groupbyResponse, trendInterval, groupedByName } = groupbyData;

		const metaDataElements = groupbyResponse.reduce((acc, element, index) => {
			const [label, value] = element;

			if (index > 0) {
				acc.push({
					label,
					id: label,
					eventData: {},
					defaultColor: "221, 133, 129"
				});
			}

			return acc;
		}, []);

		const metaDataGroupby = [
			{
				"series": [
					{
						"label": groupedByName,
						"id": "value",
						"type": "value"
					}
				],
				"label": "Event property values",
				"elements": metaDataElements,
				"id": "prop-values",
				"fieldType": "integer"
			}
		];

        const transformedData = [{
                "order": 0,
                "response": {
                    "metadata": {
						"dataSourceLabel": groupedByName,
						"groupBy": metaDataGroupby,
                        "format": {
                            "frequency": trendMapping[trendInterval],
                            "precision": 0,
                            "unitFormat": "{0}",
                        },
                        "series": [{
                            "label": groupedByName,
                            "id": "value",
                            "type": "value",
                        }, ],
                    },
                    "data": groupbyResponse
                }
            }];
		
        return transformedData;
    },
	
    type: 'UxaResponseTransformer'
};
