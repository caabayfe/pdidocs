//Moves the business_unit column from Business Applications to Configuration Item tables
GlideDBUtil.promoteColumn('cmdb_ci_business_app', 'cmdb_ci', 'business_unit');
