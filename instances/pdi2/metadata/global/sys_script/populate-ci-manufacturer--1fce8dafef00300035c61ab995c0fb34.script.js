if (!current.model_id.nil())
   current.manufacturer = current.model_id.manufacturer;
else if (!current.asset.nil() && !current.asset.model.nil())
   current.manufacturer = current.asset.model.manufacturer;
