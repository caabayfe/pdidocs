/************************************************************************************************************************
 * Validates a single classification criterion result. Processed against all criteria results one by one.
 * @param string name The Classification Criteria Name of the query.
 * @param XMLObj(//cimqueryset/cimquery/result/instance) instance The instance returned. Format:
 *   {_key: {string:string,..}, _namespace: string, _classname: string, _cidata: {string:string,..}, {MyProp:string},..}
 * @param {criteria.name:XMLObj(//cimqueryset/cimquery)} queries The entire hash-array of Fullfilled CIM Queries. Format:
 *   string : XMLObj({ query: string, result: { instance: <instance>[] } }),.. }
 * @return false|XMLObj(//cimqueryset/cimquery/result/instance) Return instance if approved, false to skip.
 */
function classify(name, instance, queries) {
	// OtherIdentifyingInfo should be an array, but I'm not 100% sure how cimquery handles
	// array values.  For our test fabric (using Brocade switches) it's getting returned as
	// a string.  Cisco returns the value as an array of arrays.  I'm not sure how that gets
	// passed into here.
	return check(instance.OtherIdentifyingInfo);

	function check(oid) {
		if (typeof oid == 'string')
			return oid.toLowerCase() == 'fabric';
		if (oid instanceof Array)
			return oid.some(check);
	}
}
