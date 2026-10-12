//This script creates or locates appropriate product models and assigns them to CIs where the "model_id" field is empty.
//Note: this does not apply to the entire CMDB, specific CI classes are called out inside the script include method below
new CSDMModelUtil().populateEmptyProductModels();
