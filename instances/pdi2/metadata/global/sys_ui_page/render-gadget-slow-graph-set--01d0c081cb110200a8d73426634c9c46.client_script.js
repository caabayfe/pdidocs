;
(function () {

  // This multi-array helps us map the Trend + Duration selections to our report id. The first index is the
  // trend selection (Count, Time), the second index is the duration selection (2 hours, 1 day, 1 month), and the last
  // index is our slow performance report type (transaction, query, script)
  var slowGraphs = [
    [
      ['0bbf2d529f200200c0f1fc12957fcfdc', 'fa4315409f300200c0f1fc12957fcf4f', 'a56595409f300200c0f1fc12957fcf3b', '212a3b93c3220200e6da174292d3ae71'],
      ['f1d0bd529f200200c0f1fc12957fcf5a', '90f2d1409f300200c0f1fc12957fcff7', 'f50455409f300200c0f1fc12957fcf4e', '7cbbfb93c3220200e6da174292d3aed9'],
      ['9370bd529f200200c0f1fc12957fcf10', 'c2a2d1409f300200c0f1fc12957fcf82', '95d5d5409f300200c0f1fc12957fcf25', '3d6a7b93c3220200e6da174292d3aea1']
    ],
    [
      ['f86fe9529f200200c0f1fc12957fcf6e', 'f50a62019f200200c0f1fc12957fcf74', '6cea26019f200200c0f1fc12957fcf44', '243bbb93c3220200e6da174292d3aec5'],
      ['e3e6a0019f200200c0f1fc12957fcf2b', '83c9e2019f200200c0f1fc12957fcf47', '29aae2019f200200c0f1fc12957fcfe1', 'c25bfb93c3220200e6da174292d3ae29'],
      ['bde8e1019f200200c0f1fc12957fcfb1', '474ae2019f200200c0f1fc12957fcfd7', 'c89a26019f200200c0f1fc12957fcf32', 'a27bfb93c3220200e6da174292d3ae9b']
    ]
  ];
  
  // Additional filters to reduce the amount of data to be rendered by chart reports
  var additionalFilters = {
	'bde8e1019f200200c0f1fc12957fcfb1' : 'execution_time>60000', // Transaction Execution Time Trend 1 Month
	'9370bd529f200200c0f1fc12957fcf10' : 'execution_time>60000', // Transaction Count Trend 1 Month
	'474ae2019f200200c0f1fc12957fcfd7' : 'execution_time>10000^pattern.exampleNOT LIKESELECT GET_LOCK', // Query Execution Time Trend 1 Month (exclude SELECT GET_LOCK queries)
	'c2a2d1409f300200c0f1fc12957fcf82' : 'execution_time>10000^pattern.exampleNOT LIKESELECT GET_LOCK', // Query Count Trend 1 Month (exclude SELECT GET_LOCK queries)
	'95d5d5409f300200c0f1fc12957fcf25' : 'execution_time>10000^pattern.hash!=1589325296^pattern.hash!=-841186000', // Script Count Trend 1 Month (exclude Business Rule: Metric population and Business Rule: Metric definition each of which has over 8K entries)
	'c89a26019f200200c0f1fc12957fcf32' : 'execution_time>10000^pattern.hash!=1589325296^pattern.hash!=-841186000',  // Script Execution Time Trend 1 Month (exclude Business Rule: Metric population and Business Rule: Metric definition each of which has over 8K entries)
	
	'e3e6a0019f200200c0f1fc12957fcf2b' : 'execution_time>10000', // Transaction Execution Time Trend 1 Day
	'f1d0bd529f200200c0f1fc12957fcf5a' : 'execution_time>10000', // Transaction Count Trend 1 Day
	'83c9e2019f200200c0f1fc12957fcf47' : 'pattern.exampleNOT LIKESELECT GET_LOCK', // Query Execution Time Trend 1 Day (exclude SELECT GET_LOCK queries)
	'90f2d1409f300200c0f1fc12957fcff7' : 'pattern.exampleNOT LIKESELECT GET_LOCK', // Query Count Trend 1 Day (exclude SELECT GET_LOCK queries)
	'f50455409f300200c0f1fc12957fcf4e' : 'pattern.hash!=1589325296^pattern.hash!=-841186000', // Script Count Trend 1 Day  (exclude Business Rule: Metric population and Business Rule: Metric definition)
	'29aae2019f200200c0f1fc12957fcfe1' : 'pattern.hash!=1589325296^pattern.hash!=-841186000',  // Script Execution Time Trend 1 Day  (exclude Business Rule: Metric population and Business Rule: Metric definition)
	
	'f86fe9529f200200c0f1fc12957fcf6e' : 'execution_time>10000', // Transaction Execution Time Trend 1 Day
	'0bbf2d529f200200c0f1fc12957fcfdc' : 'execution_time>10000', // Transaction Count Trend 1 Day
	'f50a62019f200200c0f1fc12957fcf74' : 'pattern.exampleNOT LIKESELECT GET_LOCK', // Query Execution Time Trend 1 Day (exclude SELECT GET_LOCK queries)
	'fa4315409f300200c0f1fc12957fcf4f' : 'pattern.exampleNOT LIKESELECT GET_LOCK', // Query Count Trend 1 Day (exclude SELECT GET_LOCK queries)
	'a56595409f300200c0f1fc12957fcf3b' : 'pattern.hash!=1589325296^pattern.hash!=-841186000', // Script Count Trend 1 Day  (exclude Business Rule: Metric population and Business Rule: Metric definition)
	'6cea26019f200200c0f1fc12957fcf44' : 'pattern.hash!=1589325296^pattern.hash!=-841186000'  // Script Execution Time Trend 1 Day  (exclude Business Rule: Metric population and Business Rule: Metric definition)
  };
  
  var $duration, duration, $trend, trend, $graphs;

  // Doing this because jelly doesn't have a tag for picking a selected option in a select
  function setSelectedValue() {
    $trend.val(trend);
    $duration.val(duration);
  }

  function loadGraphsBasedOnSelections() {
    var graphIds = slowGraphs[trend][duration];
    var url = new GlideURL("report_viewer.do");
    for (var i = 0; i < graphIds.length; i++) {
      url.addParam('jvar_report_id', graphIds[i]);
      embedReportById($j($graphs[i]), graphIds[i], additionalFilters[graphIds[i]]);
    }
  }

  function setEventListeners() {
    var value;
    $j('#slowPerfTrend').change(function(){
      value = $j(this).val();
      trend = value;
      loadGraphsBasedOnSelections();
      setPreference('slow_perf_trend', value, doNothing);
    });
    $j('#slowPerfDuration').change(function(){
      value = $j(this).val();
      duration = value;
      loadGraphsBasedOnSelections();
      setPreference('slow_perf_duration', value, doNothing);
    });
  }

  function onLoad() {
    $trend = $j('#slowPerfTrend');
    $duration = $j('#slowPerfDuration');
    trend = $trend.data('selected');
    duration = $duration.data('selected');
    $graphs = $j('.slowGraph');
    setSelectedValue();
    loadGraphsBasedOnSelections();
    setEventListeners();
  }

  addAfterPageLoadedEvent(onLoad);
})();
