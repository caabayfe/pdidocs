/*
 * Note:
 * 1. Sensors are processed as scheduled jobs.
 * 2. Scheduled jobs only log the transaction if such transaction time > 1000 ms
 * Obs: See TransactionalWorkerThread.shouldLog(), controlled via glide.scheduler.log.threshold
 * 3. Therefore we may not be able to build the link
*/

(function() {
	var instanceName, error, hostName, uri, txInfo, searchStr, splunkInstance,
		URI = gs.getProperty('glide.servlet.uri');

	// We report this error in two cases:
	// 1) We couldn't find the syslog message at all, in which case we don't try to open splunk
	// 2) We found the syslog message and got the transaction ID from it but we couldn't get the
	// transaction log record. In this case we try to open splunk anyway and we report the error
	// in case splunk doesn't have anything for the transaction.
	error = 'The transaction for this ecc input record was not found. This may happen when '  +
			'the transaction took less than 100 ms to process, and therefore was not logged, ' +
			'or the input ecc was updated after sensor processing.';

	getTxInfo(current);

	if (txInfo) {
		if (txInfo.hasTxLog)
			error = '';

		try {
			searchStr = buildSearchString(txInfo);
			splunkInstance = getSplunkInstance(hostName);
			redirectToSplunk(splunkInstance, searchStr);
		} catch (e) {
			error = e;
		}
	} else if (!hostName || !instanceName)
		error = 'The URI (' + uri + ') could not be parsed into instance and hostname values. Please verify instance ' +
				'is supported for Splunk and matches regex, i.e: localhost instances never report to Splunk.';

	if (error)
		gs.addErrorMessage(error);

	function buildSearchString() {
		return 'q=search sourcetype=appnode_localhost_log ' +
			'instance=' + instanceName + ' txid=' + txInfo.txId +
			'&display.page.search.mode=verbose' +
			'&dispatch.sample_ratio=1' +
			'&earliest=' + Math.floor(txInfo.earliest.getNumericValue() / 1000) +
			'&latest=' + Math.floor(txInfo.latest.getNumericValue() / 1000);
	}

	function getSplunkInstance(hostname) {

		switch (hostname) {
			case 'service-now.com':
				return 'https://splunk.servicenow.net/';
			case 'servicenowservices.com':
				return 'https://splunk.fed.servicenow.net/';
			case 'servicenowcloud.mil':
				return 'https://splunk.il5.servicenow.net/';
			case 'servicenowcloud.com.au':
				return 'https://splunk.irap.servicenow.net/';
			default:
				throw new Error('Instance URI does not have a supported Splunk instance. Please contact ITOM-CRE team.');
		}
	}

	function redirectToSplunk(splunkInstance,searchStr) {
		var splunkUri = splunkInstance + "en-US/app/search/search?" + searchStr;

		action.setRedirectURL(splunkUri);
	}

	function getTxInfo(eccGr) {
		var URI_REGEX = /\/\/(.+?)\.(.+)\//m,
			uri = URI && URI.match(URI_REGEX);

		if (uri) {
			instanceName = uri[1];
			hostName = uri[2];

			txInfo = DiscoverySensorJob.getTxInfo(eccGr);
		}
	}
})();
