/* This script parses the running process info from windows
*
*  aleck.lin@servicenow.com
*/
function(result, ciData, debug, sensor) {
	/**
	 * Current is a global variable which is populated by ADM probes (like: Windows - Active Processes's) post processing script .
	 * Expected output:
	 * <result>
		<output>
			{"current":[
				{"pid":"0","ppid":"999990","name":"System Idle Process","parameters":"","command":"System Idle Process"},
				...
				]
			}
		</output>
		</result>
	 */
	sensor.running_processes = (JSON.parse(result.output)).current;
}
