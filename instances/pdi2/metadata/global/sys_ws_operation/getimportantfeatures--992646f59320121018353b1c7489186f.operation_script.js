(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var requestData = request.body.data;
    var currentSysId = requestData.sys_id;
    var level = requestData.level;
    var numFeatures = requestData.top_n;
    var className = requestData.class_name;

	// Function to retrieve important features from the 'ml_solution_explainability' table
    function getImportantFeatures(currentSysId) {
        var attachmentTable = new GlideRecord('ml_solution_explainability');
        attachmentTable.addQuery('solution_sys_id', currentSysId);
        attachmentTable.query();
        // If record exists, parse and return the important features
        if (attachmentTable.next()) {
            return JSON.parse(attachmentTable.getValue('important_features'));
        } else {
            return;
        }
    }
	// Function to format stats to fixed decimal places (3 decimal points)
	function formatStats(stats) {
        var gv = stats.global_values;  // Extract global values
        var lv = stats.label_values;  // Extract label values (class-specific)

		// Format global values
        for (var i in gv) {
            gv[i] = parseFloat(gv[i].toFixed(3));
        }

		// Format label values (class-specific)
        for (var i in lv) {
            for (var j in lv[i]) {
                lv[i][j] = parseFloat(lv[i][j].toFixed(3));
            }
        }

        return { gv: gv, lv: lv };
    }

	// Function to filter and rank features based on their importance
    function filterAndRankFeatures(features, numFeatures) {
        var filtered = {};
        var rank = 0;
		// Iterate through each feature and limit the number if numFeatures is provided
        for (var key in features) {
            if (numFeatures && rank >= numFeatures) break;
            filtered[key] = parseFloat(features[key].toFixed(3));
            rank++;
        }
        return filtered;
    }

	// Function to generate response body based on stats, level, number of features, and className
    function generateResponseBody(stats, level, numFeatures, className) {
        var gv = stats.gv;
        var lv = stats.lv;

        var gvRank = [];
        var lvRank = [];

        if (level === 'global') {
            var gvFiltered = filterAndRankFeatures(gv, numFeatures);
            var rank = 0;
            for (var gf in gvFiltered) {
                gvRank.push({ featureName: gf, rank: ++rank, importance: gvFiltered[gf] });
            }
            return { globalImportantFeatures: gvRank };
        } else if (level === 'local') {
            if (numFeatures) {
                if (className) {
                    var lvFiltered = filterAndRankFeatures(lv[className], numFeatures);
                    var rank = 0;
                    for (var lf in lvFiltered) {
                        lvRank.push({ featureName: lf, rank: ++rank, importance: lvFiltered[lf] });
                    }
                    return { classwiseImportantFeatures: lvRank };
                } else {
                    var jsonLvFiltered = {};
                    for (var lf in lv) {
                        var lvFiltered = filterAndRankFeatures(lv[lf], numFeatures);
                        var rank = 0;
                        lvRank = [];
                        for (var pcf in lvFiltered) {
                            lvRank.push({ featureName: pcf, rank: ++rank, importance: lvFiltered[pcf] });
                        }
                        jsonLvFiltered[lf] = lvRank;
                    }
                    return { classwiseImportantFeatures: jsonLvFiltered };
                }
            } else {
                if (className) {
                    var rank = 0;
                    for (var lf in lv[className]) {
                        lvRank.push({ featureName: lf, rank: ++rank, importance: lv[className][lf] });
                    }
                    return { classwiseImportantFeatures: lvRank };
                } else {
                    var jsonLv = {};
                    for (var lf in lv) {
                        var rank = 0;
                        lvRank = [];
                        var lastImportance = 0;
                        for (var pcf in lv[lf]) {
                            var importance = lv[lf][pcf];
                            lvRank.push({ featureName: pcf, rank: (importance === lastImportance ? rank : ++rank), importance: importance });
                            lastImportance = importance;
                        }
                        jsonLv[lf] = lvRank;
                    }
                    return { classwiseImportantFeatures: jsonLv };
                }
            }
		} else {
			var gvFiltered = filterAndRankFeatures(gv, numFeatures); // Filter global features
			var globalFeatures = [];
			var rank = 0;

			// Rank the filtered global features
			for (var gf in gvFiltered) {
				globalFeatures.push({ featureName: gf, rank: ++rank, importance: gvFiltered[gf] });
			}

			var classwiseFeatures = {};

			// Iterate through each class and filter class-specific features
			for (var lf in lv) {
				var lvFiltered = filterAndRankFeatures(lv[lf], numFeatures); // Filter local features
				lvRank = [];
				rank = 0;
				var lastImportance = 0;

				// Rank the filtered class-specific features
				for (var pcf in lvFiltered) {
					var importance = lvFiltered[pcf];
					lvRank.push({ featureName: pcf, rank: (importance === lastImportance ? rank : ++rank), importance: importance });
					lastImportance = importance;
				}
				classwiseFeatures[lf] = lvRank;
			}

			return { globalImportantFeatures: globalFeatures, classwiseImportantFeatures: classwiseFeatures };
			}
		}

    try {
        var stats = getImportantFeatures(currentSysId);
        stats = formatStats(stats);
        var responseBody = generateResponseBody(stats, level, numFeatures, className);
        response.setBody(responseBody);
        response.setStatus(200);
        gs.info("Response Body is: " + JSON.stringify(responseBody));
    } catch (error) {
        gs.error("Error processing request: " + error.message);
        response.setStatus(500);
        response.setBody({ error: error.message });
    }

})(request, response);
