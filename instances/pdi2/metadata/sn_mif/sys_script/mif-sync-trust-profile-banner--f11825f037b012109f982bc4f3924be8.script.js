(function executeRule(current, previous /*null when async*/ ) {

    if (!sn_mif.MIFBase.isManagerInstance(current.application))
        gs.addInfoMessage(gs.getMessage("The current instance is not a managing instance. Trust profile items will not be synced."));
    else if (!new sn_mif_core.MIFTrustProfile().areAllProfileItemsManaged(current.application))
        gs.addInfoMessage(gs.getMessage("Not all trusting instances are managed by this instance. Changes to this trust profile may not be synced."));

    if (sn_mif.MIFBase.hasInactiveTrustProfiles(current.application))
        gs.addInfoMessage(gs.getMessage("There are inactive trust profile items. This may be due to an instance no longer being managed by this instance."));

})(current, previous);
