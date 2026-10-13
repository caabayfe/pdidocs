/**
 Service-now.com
 
 Description: If a probe that is being added is a identifer probe, then let's be smart by automatically set the phase to "identification". Notice this is only done in insert, but not update because this is heuristics and could be incorrect, we want to allow humans to override the choice.
**/

current.phase = "identification";
