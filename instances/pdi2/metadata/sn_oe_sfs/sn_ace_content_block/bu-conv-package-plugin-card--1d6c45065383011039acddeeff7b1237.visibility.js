var ciUtil = new sn_oe_sfs.CIUtil();
answer = ciUtil.isInStage3() ? !ciUtil.isAllBUPluginsInstalled() : false;
