var classifierGrWeb = new GlideRecord('discovery_classifier_probe');
var classifierGrJboss = new GlideRecord('discovery_classifier_probe');
var classifierGrWebW = new GlideRecord('discovery_classifier_probe');
var classifierGrJbossW = new GlideRecord('discovery_classifier_probe');
 
classifierGrWeb.get('970e1523c3f22100d8d4bea192d3ae25');
classifierGrJboss.get('b3d40916c3b22100d8d4bea192d3aede');
classifierGrWebW.get('5bbc47360a0a0a6f001bf74600baa46c');
classifierGrJbossW.get('5b1ee9960a0a0a6f01669e55314d5b5c');
 
if (classifierGrWeb.active || 
	classifierGrJboss.active || 
	classifierGrWebW.active || 
	classifierGrJbossW.active)
{              
	// Incase at least one probe related classifier conditions is true - run the below probe classification script before executing probe
	// otherwise this script will be overidden and pattern wil be executed instead	current.tcp_port = g_process.listening_on;

	// Classpath = "C:\Program Files (x86)\Java\jdk1.7.0_67\lib\tools.jar;C:\jboss-6.1.0.Final\bin\run.jar"
	if (type=='windows') {
		var i = parameters.indexOf('-classpath');
		if (i > -1) {
		  var s = parameters.substring(i);
		  var cpath = s.split("-classpath")[1];
		  var fullpath = s.split(";");
		  var runjarclasspath = null;
		  //JBOSS_CLASSPATH=%JBOSS_CLASSPATH%;%JAVAC_JAR%;%RUNJAR%
		  if (fullpath.length == 3) {
			runjarclasspath = fullpath[2];
		  //JBOSS_CLASSPATH=%JAVAC_JAR%;%RUNJAR%
		  } else if (fullpath.length == 2) {
			runjarclasspath = fullpath[1];
		  } else {
			// This case should never happen
		  }

		  if (!JSUtil.nil(runjarclasspath) && (runjarclasspath.lastIndexOf("bin\\run.jar") != -1)) {
			g_probe_parameters['deploy_dir'] = runjarclasspath.substring(0, runjarclasspath.lastIndexOf("bin\\run.jar")) + "server\\default\\deploy";

			g_probe_parameters['service_dir'] = runjarclasspath.substring(0, runjarclasspath.lastIndexOf("bin\\run.jar")) + "server\\default\\conf\\jboss-service.xml";
		  }
		}
	}
}
