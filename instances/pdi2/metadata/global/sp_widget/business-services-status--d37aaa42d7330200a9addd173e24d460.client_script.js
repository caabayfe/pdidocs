function($scope) {
	var useDayTranslations = g_lang == 'ja' || g_lang == 'ko' || g_lang == 'zt' || g_lang == 'zh';
	for (var x in $scope.data.dates) {
		var dateStr = moment($scope.data.dates[x]).format('ll').split(',')[0];
		//Now we need to parse the date number into a real number so the screen reader reads it correctly
		var dateObj = {
			month: $scope.data.monthTranslations[dateStr.split(" ")[0]],
			day: useDayTranslations ? $scope.data.dayTranslations[x] : parseInt(dateStr.split(" ")[1])
		}
		$scope.data.dates[x] = dateObj;
	}
}
