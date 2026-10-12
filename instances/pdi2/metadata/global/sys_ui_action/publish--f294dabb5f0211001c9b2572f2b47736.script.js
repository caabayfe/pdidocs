if (current.state != sc_ic.PUBLISHED)
	sc_ic_Factory.wrap(current).publish();
else
	gs.addInfoMessage(current.name + " was already published - no action taken");
