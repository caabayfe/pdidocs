switch (current.type.toString()) {
	case 'push':
	current.name = gs.getMessage("Pushed to {0}", current.instance.getDisplayValue());
	break;
		
	case 'pull':
	current.name = gs.getMessage("Pulled from {0}", current.instance.getDisplayValue());
	break;
		
	default:
	current.name = gs.getMessage("{0} on {1}", current.type.getDisplayValue(), current.instance.getDisplayValue());
}
