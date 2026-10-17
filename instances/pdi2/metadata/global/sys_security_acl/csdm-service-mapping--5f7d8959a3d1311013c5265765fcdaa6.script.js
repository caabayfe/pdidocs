answer = true;
if (!gs.nil(current.csdm_service_offering)) {
	answer = (new global.SPMUtilsFactory().getUtils()).checkOfferingAuthorization(current.csdm_service_offering);
} else if(!gs.nil(current.csdm_service)) {
	answer = (new global.SPMUtilsFactory().getUtils()).checkServiceAuthorization(current.csdm_service);
}
