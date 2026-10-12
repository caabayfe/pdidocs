/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {

        var countArray = [];
        countArray["0"] = "0";
        countArray["1"] = "0";
        countArray["2"] = "0";
        countArray["3"] = "0";

        var labelArray = [];
        labelArray["0"] = "";
        labelArray["1"] = "Small (5,000) Installed";
        labelArray["2"] = "Medium (50,000) Installed";
        labelArray["3"] = "Large (200,000+) Installed";

        var loadedGroup = "0";
        var displayGroup = "";
        try {
            var aggregateResults = api.data.password_group_counts.output.data.GlideAggregate_Query;
            for (var i = 0; i < aggregateResults.length; i++) {
                var group = aggregateResults[i].groupBy[0].value;
                countArray[group] = aggregateResults[i].count;
                if (countArray[group] != "0" && countArray[group] != 0) {
                    loadedGroup = group;
                    displayGroup = labelArray[group];
                }
            }
        } catch (err) {
            // no entries in the table: data / count undef
        }

        var showInstallBtn = loadedGroup == "0" ? true : false;
        api.setState('noInstalledGroups', showInstallBtn);
        api.setState('hasInstalledGroups', !showInstallBtn);
        api.setState('largestInstalledGroupLabel', displayGroup);
        api.setState('loadedListGroup', 'exclusion_list_' + loadedGroup);
}
