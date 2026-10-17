/************************************************************************************************************************
 * Validates a single classification criterion result. Processed against all criteria results one by one.
 * @param string name The Classification Criteria Name of the query.
 * @param XMLObj(//cimqueryset/cimquery/result/instance) instance The instance returned. Valid. Format:
 *   {_key: {string:string,..}, _namespace: string, _classname: string, _cidata: {string:string,..}, {MyProp:string},..}
 * @param {criteria.name:XMLObj(//cimqueryset/cimquery)} queries The entire hash-array of Fullfilled CIM Queries. Format:
 *   string : XMLObj({ query: string, result: { instance: <instance>[] } }),.. }
 * @return false|XMLObj(//cimqueryset/cimquery/result/instance) Return instance if approved, false to skip.
 */
function classify(name, instance, queries) {
	// only fire the fabric probe once
	queries.switches.result.instance[0]._discoveryData.discoverFabric = true;
	return true;
}
