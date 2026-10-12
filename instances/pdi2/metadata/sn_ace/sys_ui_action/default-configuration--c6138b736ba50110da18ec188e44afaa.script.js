var util = new sn_ace.ACEAppBuilderUtil();
var status = util.createAiSearchConfig(current.document_id,current.sys_id);
switch(status){
	case 0:
		gs.addInfoMessage(gs.getMessage('AIS is not enabled'));
		break;
	case 1:
		gs.addInfoMessage(gs.getMessage('Default search configuration already exists'));
		break;
	case 2:
		gs.addInfoMessage(gs.getMessage('Default search configuration created successfully'));
		break;
	default :
		gs.addInfoMessage(gs.getMessage('Default search configuration creation failed'));
		break;
}
