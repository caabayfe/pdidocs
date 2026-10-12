var imageGR = new GlideRecord("db_image");
if (imageGR.get(current.getValue("table_sys_id")))
   GlideElementUserImage.checkImageMetaData(imageGR, "image");
