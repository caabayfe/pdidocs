// Show the LVM related lists only for LVM devices
if (current.device_interface != 'lvm') {
	if (typeof g_scratchpad.hideRelatedLists === 'undefined') // expected
		g_scratchpad.hideRelatedLists = [];
	
	g_scratchpad.hideRelatedLists.push('REL:b92f6c5b37b32100dcd445cbbebe5d1e'); // LVM Composition
	g_scratchpad.hideRelatedLists.push('REL:73fe285c37003100dcd445cbbebe5d36'); // LVM Mappings
}
