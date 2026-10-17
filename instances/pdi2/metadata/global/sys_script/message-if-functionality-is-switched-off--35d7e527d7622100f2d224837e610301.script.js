var layoutPropertyKey = 'glide.sc.use_cart_layouts';
var layoutEnabled = gs.getProperty(layoutPropertyKey, "false");
var layoutArgs = [layoutPropertyKey,layoutEnabled];
    
if (layoutEnabled == "false")
	gs.addErrorMessage(gs.getMessage("Changes to Cart Layouts will not take place as layouts are currently disabled : Property '{0}' is set to {1}" , layoutArgs ));

var twoStepKey = 'glide.sc.checkout.twostep';
var twoStepActive = gs.getProperty(twoStepKey, "false");
var twoStepArgs = [twoStepKey, twoStepActive];

if (twoStepActive == 'false' && current.target == 'cart_view_two_step')
    gs.addInfoMessage(gs.getMessage("Please note that changes to the layout will not show as two-step checkout is disabled: Property '{0}' is set to {1}" ,  twoStepArgs));
