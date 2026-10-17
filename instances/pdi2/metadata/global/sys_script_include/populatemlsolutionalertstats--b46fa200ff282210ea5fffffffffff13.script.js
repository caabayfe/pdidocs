var PopulateMLSolutionAlertStats = Class.create();
PopulateMLSolutionAlertStats.prototype = {
    initialize: function() {},

    populateMLSolutionStats: function() {
        try {
            var teams = this._getTeamDetails();

            teams.forEach(function(team) {
                this._populateMLSolutionStatsInternal(team);
            }, this);

        } catch (err) {
            gs.error("Error occurred while populating ML Soln stats " + err);
        }
    },

    _getTeamDetails: function() {
        var teams = []; // In the future, this can be read from a configuration table, which will provide more control.

        var team = {};
        var teamName = gs.getProperty('glide.platform_ml.monitoring.team.name', "AI Middleware");
        var teamDl = gs.getProperty('glide.platform_ml.monitoring.team.dl', "aimiddleware@servicenow.com");
        team.teamName = this._convertToSnakeCase(teamName);
        team.teamDl = teamDl;
        var states = ['timed_out', 'waiting_for_training', 'solution_error', 'retry', 'solution_complete', 'unauthorized'];
        team.states = states;
        teams.push(team);
        return teams;
    },

    _populateMLSolutionStatsInternal: function(teamObj) {
        try {
            if (JSUtil.nil(teamObj) || !teamObj.teamName || teamObj.teamName.trim() === "") {
                gs.info("Skipping team population for ML solution alert stats due to missing or empty team name");
                return;
            }

            var mlSolutionStatsData = {
                team_name: teamObj.teamName,
                team_dl: teamObj.hasOwnProperty('teamDl') ? teamObj.teamDl : ""
            };

            //Specifies the number of recent hours to exclude from query
            var excludeLastHours = gs.getProperty('glide.platform_ml.monitoring.exclude_last_hours', 6);

            //Defines how many days of past data should be considered for query
            var lookbackDays = gs.getProperty('glide.platform_ml.monitoring.lookback_days', 1);

            var currTime = new GlideDateTime();

            // Calculate the end time for the query: exclude the last `excludeLastHours`
            currTime.subtract(excludeLastHours * 60 * 60 * 1000);
            var queryEndTime = currTime;

            // Calculate the start time for the query by considering data from `lookbackDays` before the current time
            currTime = new GlideDateTime();
            currTime.subtract(lookbackDays * 24 * 60 * 60 * 1000);
            var queryStartTime = currTime;

            teamObj.states.forEach(function(state) {
                mlSolutionStatsData = this._applyFiltersAndFetchSolutionStats(state, queryStartTime, queryEndTime, mlSolutionStatsData);
            }, this);

            this._insertMLSolutionStats(mlSolutionStatsData);

        } catch (err) {
            gs.error("Error occurred while processing data for team: " + teamObj.teamName + " : " + err);
        }
    },

    _insertMLSolutionStats: function(mlSolutionStatsData) {
        try {
            if (JSUtil.nil(mlSolutionStatsData) || typeof mlSolutionStatsData !== 'object' || Object.keys(mlSolutionStatsData).length === 0) {
                gs.info("Skipping record insertion in ml_solution_alert_stats table due to missing or invalid stats data.");
                return;
            }

            var team_name = mlSolutionStatsData.team_name;
            if (JSUtil.nil(team_name) || team_name.trim() === "") {
                gs.info("Skipping record insertion in ml_solution_alert_stats table due to missing or empty team name.");
                return;
            }

            var run_number = this._generateRunNumber();

            if (JSUtil.nil(run_number) || run_number === "" || run_number === 0) {
                gs.info("Generated run_number is invalid. Skipping insertion in ml_solution_alert_stats table for team: " + team_name);
                return;
            }

            for (var key in mlSolutionStatsData) {
                try {
                    if (JSUtil.nil(key) || key.trim() === "" || key === 'team_name') {
                        continue;
                    }

                    var metric_value = mlSolutionStatsData[key];

                    var gr = new GlideRecord('ml_solution_alert_stats');
                    gr.setValue('team_name', team_name);
                    gr.setValue('metric_name', key);
                    gr.setValue('metric_value', metric_value);
                    gr.setValue('run_number', run_number);
                    gr.insert();

                } catch (error) {
                    gs.error("Error occurred while inserting record in ml_solution_alert_stats" + error);
                }
            }
        } catch (err) {
            gs.error("Error occurred while inserting ML Soln stats:" + err);
        }
    },

    _generateRunNumber: function() {
        try {
            // Generating run_number based on current UTC time in YYYYMMDDHH format
            var gdt = new GlideDateTime();
            var year = gdt.getYearUTC();
            var month = (gdt.getMonthUTC()).toString().padStart(2, '0');
            var day = gdt.getDayOfMonthUTC().toString().padStart(2, '0');
            var hour = gdt.getValue().substring(11, 13); // Extract HH from "YYYY-MM-DD HH:MM:SS"

            if (JSUtil.nil(year) || JSUtil.nil(month) || JSUtil.nil(day) || JSUtil.nil(hour)) {
                gs.info("Invalid date components for run_number generation. Defaulting to 0.");
                return 0; // Directly return 0 instead of throwing
            }

            return parseInt(year + month + day + hour, 10);

        } catch (err) {
            gs.info("Error occured while generating run_number: " + err);
            return 0; // Return 0 in case of failure
        }
    },

    _convertToSnakeCase: function(str) {
        try {
            if (JSUtil.nil(str)) {
                return "";
            }
            return str.toLowerCase().trim().replace(/\s+/g, '_');
        } catch (err) {
            return "";
        }
    },

    _applyFiltersAndFetchSolutionStats: function(state, query_start_time, query_end_time, mlSolutionStatsData) {
        try {
            var mlSoln = new GlideRecord('ml_solution');
            mlSoln.addQuery('sys_created_on', '>=', query_start_time);
            mlSoln.addQuery('sys_created_on', '<=', query_end_time);
            mlSoln.addQuery('state', state);
            mlSoln.query();

            var count = mlSoln.getRowCount();
            if (state === "solution_complete") {
                mlSolutionStatsData[state + "_count"] = count;
                return mlSolutionStatsData;
            }

            var soln_ids = [];
            while (mlSoln.next()) {
                soln_ids.push(mlSoln.getUniqueValue());
            }

            var strSolIds = soln_ids.join(',');
            mlSolutionStatsData[state + "_soln_ids"] = strSolIds;
            mlSolutionStatsData[state + "_count"] = count;

            return mlSolutionStatsData;

        } catch (err) {
            gs.error("Error occurred while applying filter state and fetching soln stats: " + err);
            return mlSolutionStatsData;
        }
    },

    type: 'PopulateMLSolutionAlertStats'
};
