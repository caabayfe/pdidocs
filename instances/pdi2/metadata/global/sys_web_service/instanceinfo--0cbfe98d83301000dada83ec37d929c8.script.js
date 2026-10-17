var requestType = request.purpose;
var resp = {'result':{}};
switch (requestType) {
	case "GetLocalInfo":
		getLocalInfo();
		break;
	default:
		getBasicInfo();
}
response.response = new XMLHelper().toXMLDoc(resp);

/*
 * Returns customizable local settings.
 * Because such values can be changed anytime, the client
 * should call it right before usage in order to get up-to-date info
 */
function getLocalInfo() {
	if (gs.hasRole('mid_server')) {
		resp.result.time_zone_name = '' + gs.getSession().getTimeZoneName();
		resp.result.language = '' + gs.getSession().getLanguage();

		// these functions will fall back to 'glide.sys.date_format' and 
		// 'glide.sys.time_format' if not defined by the user
		resp.result.sys_date_format = '' + gs.getSession().getDateFormat();
		resp.result.sys_time_format = '' + gs.getSession().getTimeFormat();
	}
}

/*
 * Returns basic instance information.
 * DO NOT change this schema other than by adding elements, as it is used by MID servers
 * and any change could cause MID server upgrade failures.
 */
function getBasicInfo() {
	if (!gs.hasRole('mid_server')) {
		resp.result.mid_buildstamp = 'access restricted';
		resp.result.mid_version = 'access restricted';
		resp.result.install_name  = 'access restricted';
		resp.result.instance_name = 'access restricted';
		resp.result.instance_id   = 'access restricted';
		resp.result.build_date    = 'access restricted';
		resp.result.build_tag     = 'access restricted';
		resp.result.system_id     = 'access restricted';
		resp.result.node_id       = 'access restricted';
		resp.result.instance_ip   = 'access restricted';
		return;
	}

	var mv = gs.getProperty('mid.buildstamp');
	var mvo = gs.getProperty('mid.version.override');
	if (mv == null)
		mv = '';
	if (mvo)
		mv = mvo;

	var legacyBuildstamp = null;
	try {
		legacyBuildstamp = MIDPackage.createLegacyBuildstamp(mv);
	} catch (e) {
		legacyBuildstamp = '';
	}

	resp.result.mid_buildstamp = ensure(mv);
	resp.result.mid_version = ensure(legacyBuildstamp); // deprecated at berlin release. use mid_buildstamp.
	resp.result.install_name  = gs.getProperty( 'glide.installation.name', ''             );
	resp.result.instance_name = gs.getProperty( 'instance_name',           'unregistered' );
	resp.result.instance_id   = gs.getProperty( 'instance_id',             'unregistered' );
	resp.result.build_date    = gs.getProperty( 'glide.builddate',         ''             );
	resp.result.build_tag     = gs.getProperty( 'glide.buildtag',          ''             );
	resp.result.release_candidate = gs.getProperty( 'glide.release_candidate', 'false'    );
	resp.result.system_id     = ensure( gs.getSystemID()   );
	resp.result.node_id       = ensure( gs.getNodeID()     );
	resp.result.instance_ip   = ensure( gs.getInstanceIP() );
}

function ensure(datum) {
	return (datum == null) ? '' : datum;
}
