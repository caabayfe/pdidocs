angular.module("sn.chg_soc.duration", [])
	.constant("DURATION", {
		TIME: {
			SECONDS: "seconds",
			MINUTES: "minutes",
			HOURS: "hours",
			DAYS: "days",
			WEEKS: "weeks"
		}
	})
	.service("durationFormatter", ["i18n", "DURATION", function(i18n, DURATION) {
		var durationFormatter = this;

		function getUnitDurationDisplay(durations, unit) {
			if (durations[unit] === 0)
				return "";
			var displayUnit = unit;
			if (durations[unit] === 1)
				displayUnit = unit.substring(0, unit.length - 1);
			return i18n.format(i18n.getMessage("{0} " + displayUnit), durations[unit]);
		}

		function getDurationDisplay(durations, arrUnit) {
			var display = "";
			var displayObj = [];

			// If value exceeds a week and needs to be presented in days
			if (arrUnit.length === 1 && DURATION.TIME.DAYS === arrUnit[0])
				return i18n.format(i18n.getMessage("{0} days"), Math.floor(durations.asDays/60/60/24));

			arrUnit.forEach(function(unit) {
				if (durations[unit] === 0)
					return;
				var unitObj = {
					unitDisplay: unit,
					unitValue: durations[unit]
				};
				if (durations[unit] === 1)
					unitObj.unitDisplay = unit.substring(0, unit.length - 1);
				displayObj.push(unitObj);
			});

			var displayUnitValues = [];
			for (var i = 0; i < displayObj.length; i++) {
				display += "{" + i + "} " + displayObj[i].unitDisplay + ", ";
				displayUnitValues.push(displayObj[i].unitValue);
			}
			display = (display.endsWith(", ")) ? display.substring(0, display.length - 2) : display;

			return display ? i18n.format(i18n.getMessage(display), displayUnitValues) : "";
		}

		durationFormatter.buildDurationDisplay = function(startDate, endDate) {
			var duration = moment.duration(moment(endDate).diff(moment(startDate))).asSeconds();
			var durations = {
				duration: duration,
				seconds: moment.duration(duration, DURATION.TIME.SECONDS).seconds(),
				minutes: moment.duration(duration, DURATION.TIME.SECONDS).minutes(),
				hours: moment.duration(duration, DURATION.TIME.SECONDS).hours(),
				days: moment.duration(duration, DURATION.TIME.SECONDS).days(),
				asDays: moment.duration(duration, DURATION.TIME.DAYS).asDays(),
			};

			if (duration < 1)
				return i18n.format(i18n.getMessage("0 seconds"));
			// Less than a minute
			else if (duration < 60)
				return getDurationDisplay(durations, [DURATION.TIME.SECONDS]);
			// Less than an hour
			else if (duration < 3600)
				return getDurationDisplay(durations, [DURATION.TIME.MINUTES]);
			// Less than a day
			else if (duration < 86400)
				return getDurationDisplay(durations, [DURATION.TIME.HOURS, DURATION.TIME.MINUTES]);
			// Less than a week
			else if (duration < 604800)
				return getDurationDisplay(durations, [DURATION.TIME.DAYS, DURATION.TIME.HOURS]);
			else
				return getDurationDisplay(durations, [DURATION.TIME.DAYS]);
		};
	}]);
