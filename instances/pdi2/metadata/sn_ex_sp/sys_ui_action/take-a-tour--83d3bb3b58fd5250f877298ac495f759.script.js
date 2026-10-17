function openUnifiedNavOnboardingModal() {

		var openInPolaris =
			(top.NOW.isPolarisEnabled == 'true' || top.NOW.isPolarisWrapper == 'true' ||
				top.NOW.isPolarisEnabled == true || top.NOW.isPolarisWrapper == true) &&
			(top.location.href.indexOf('now/polaris/ui') > -1 || top.location.href.indexOf('now/nav/ui') > -1);
		if (!openInPolaris) {
			var dialog = new GlideModal('glide_info', false, 420);
			dialog.setTitle("Advanced portal navigation guidance");
			dialog.setPreference('title', "This guidance is only available in the Now experience.");
			dialog.render();
		} else {
			top.gsft_main.frameElement.dispatchEvent(new CustomEvent('SN_HELP#GUIDANCE_START_REQUESTED', {
				bubbles: true,
				detail: {
					payload: {
						guidanceId: "19976fbb477d12109701fe39116d437c"
					},
					meta: {
						path: []
					}
				}
			}));
		}
	}
