function getDateFilterOptions() {
	answer.add('001_Today@javascript:gs.daysAgoStart(0)@javascript:gs.daysAgoEnd(0)', gs.getMessage('Today'));
	answer.add('005_Yesterday@javascript:gs.daysAgoStart(1)@javascript:gs.daysAgoEnd(1)', gs.getMessage('Yesterday'));
	answer.add('010_Tomorrow@javascript:gs.daysAgoStart(-1)@javascript:gs.daysAgoEnd(-1)', gs.getMessage('Tomorrow'));
	answer.add('015_This week@javascript:gs.beginningOfThisWeek()@javascript:gs.endOfThisWeek()', gs.getMessage('This Week'));
	answer.add('020_Last week@javascript:gs.beginningOfLastWeek()@javascript:gs.endOfLastWeek()', gs.getMessage('Last Week'));
	answer.add('025_Next week@javascript:gs.beginningOfNextWeek()@javascript:gs.endOfNextWeek()', gs.getMessage('Next Week'));
	answer.add('030_This month@javascript:gs.beginningOfThisMonth()@javascript:gs.endOfThisMonth()', gs.getMessage('This month'));
	answer.add('035_Last month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()', gs.getMessage('Last month'));
	answer.add('040_Next month@javascript:gs.beginningOfNextMonth()@javascript:gs.endOfNextMonth()', gs.getMessage('Next month'));
	answer.add('045_Last 3 months@javascript:gs.monthsAgoStart(3)@javascript:gs.endOfThisMonth()', gs.getMessage('Last 3 months'));
	answer.add('050_Last 6 months@javascript:gs.monthsAgoStart(6)@javascript:gs.endOfThisMonth()', gs.getMessage('Last 6 months'));
	answer.add('055_Last 9 months@javascript:gs.monthsAgoStart(9)@javascript:gs.endOfThisMonth()', gs.getMessage('Last 9 months'));
	answer.add('060_Last 12 months@javascript:gs.monthsAgoStart(12)@javascript:gs.endOfThisMonth()', gs.getMessage('Last 12 months'));
	answer.add('065_This quarter@javascript:gs.beginningOfThisQuarter()@javascript:gs.endOfThisQuarter()', gs.getMessage('This quarter'));
	answer.add('070_Last quarter@javascript:gs.quartersAgoStart(1)@javascript:gs.quartersAgoEnd(1)', gs.getMessage('Last quarter'));
	answer.add('075_Last 2 quarters@javascript:gs.quartersAgoStart(1)@javascript:gs.endOfThisQuarter()', gs.getMessage('Last 2 quarters'));
	answer.add('080_Next quarter@javascript:gs.quartersAgoStart(-1)@javascript:gs.quartersAgoEnd(-1)', gs.getMessage('Next quarter'));
	answer.add('085_Next 2 quarters@javascript:gs.quartersAgoStart(-1)@javascript:gs.quartersAgoEnd(-2)', gs.getMessage('Next 2 quarters'));
	answer.add('090_This year@javascript:gs.beginningOfThisYear()@javascript:gs.endOfThisYear()', gs.getMessage('This year'));
	answer.add('095_Next year@javascript:gs.beginningOfNextYear()@javascript:gs.endOfNextYear()', gs.getMessage('Next year'));
	answer.add('100_Last year@javascript:gs.beginningOfLastYear()@javascript:gs.endOfLastYear()', gs.getMessage('Last year'));
	answer.add('105_Last 2 years@javascript:gs.beginningOfLastYear()@javascript:gs.endOfThisYear()', gs.getMessage('Last 2 years'));
	answer.add('110_Last 7 days@javascript:gs.daysAgoStart(7)@javascript:gs.daysAgoEnd(0)', gs.getMessage('Last 7 days'));
	answer.add('115_Last 30 days@javascript:gs.daysAgoStart(30)@javascript:gs.daysAgoEnd(0)', gs.getMessage('Last 30 days'));
	answer.add('120_Last 60 days@javascript:gs.daysAgoStart(60)@javascript:gs.daysAgoEnd(0)', gs.getMessage('Last 60 days'));
	answer.add('125_Last 90 days@javascript:gs.daysAgoStart(90)@javascript:gs.daysAgoEnd(0)', gs.getMessage('Last 90 days'));
	answer.add('130_Last 120 days@javascript:gs.daysAgoStart(120)@javascript:gs.daysAgoEnd(0)', gs.getMessage('Last 120 days'));
	answer.add('135_Current hour@javascript:gs.hoursAgoStart(0)@javascript:gs.hoursAgoEnd(0)', gs.getMessage('Current hour'));
	answer.add('140_Last hour@javascript:gs.hoursAgoStart(1)@javascript:gs.hoursAgoEnd(1)', gs.getMessage('Last hour'));
	answer.add('145_Last 2 hours@javascript:gs.hoursAgo(2)@javascript:gs.hoursAgo(0)', gs.getMessage('Last 2 hours'));
	answer.add('150_Current minute@javascript:gs.minutesAgoStart(0)@javascript:gs.minutesAgoEnd(0)', gs.getMessage('Current minute'));
	answer.add('155_Last minute@javascript:gs.minutesAgoStart(1)@javascript:gs.minutesAgoEnd(1)', gs.getMessage('Last minute'));
	answer.add('160_Last 15 minutes@javascript:gs.minutesAgoStart(15)@javascript:gs.minutesAgoEnd(0)', gs.getMessage('Last 15 minutes'));
	answer.add('165_Last 30 minutes@javascript:gs.minutesAgoStart(30)@javascript:gs.minutesAgoEnd(0)', gs.getMessage('Last 30 minutes'));
	answer.add('170_Last 45 minutes@javascript:gs.minutesAgoStart(45)@javascript:gs.minutesAgoEnd(0)', gs.getMessage('Last 45 minutes'));
	answer.add('175_One year ago@javascript:gs.monthsAgo(12)@javascript:gs.endOfThisMonth()', gs.getMessage('One year ago'));
	
}
