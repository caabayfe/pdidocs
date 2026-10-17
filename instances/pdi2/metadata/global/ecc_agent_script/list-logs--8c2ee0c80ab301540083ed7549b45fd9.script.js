var sdf = Packages.java.text.SimpleDateFormat('MM/dd/yyyy HH:mm:ss.SSS');
var log_dir = new Packages.java.io.File('logs');
var files = log_dir.listFiles();
var result = [];
var fos = [];

// collect our file data...
for (var i = 0; i < files.length; i++) {
   var file = files[i];
   var name = '' + file.getName();
   if (file.isDirectory())
      continue;
   if (name.charAt(0) == '.')
      continue;
   var fo = {};
   fo['name'] = name;
   fo['size'] = '' + file.length();
   var last_mod_dt = new Packages.java.util.Date(file.lastModified());
   fo['last'] = '' + sdf.format(last_mod_dt);
   fos.push(fo);
}

// figure out how big our biggest fields are...
var big_name = 8;
var big_size = 9;
for (var i = 0; i < fos.length; i++) {
   var fo = fos[i];
   if (fo.name.length > big_name)
      big_name = fo.name.length;
   if (fo.size.length > big_size)
      big_size = fo.size.length;
}

// now produce our pretty results...
var bfl = '---------------------------------------------';
result.push('\n\n' + fixlen('Log file', big_name, false) + '|' + fixlen('File size', big_size, true) + '|' + 'Last modified');
result.push('\n' + fixlen(bfl, big_name, false) + '+' + fixlen(bfl, big_size, true) + '+' + '-----------------------');
for (var i = 0; i < fos.length; i++) {
   var fo = fos[i];
   result.push('\n' + fixlen(fo.name, big_name, false) + '|' + fixlen(fo.size, big_size, true) + '|' + fo.last);
}
result.push('\n' + fixlen(bfl, big_name, false) + '+' + fixlen(bfl, big_size, true) + '+' + '-----------------------');
result.join('');

function fixlen(fld, len, padleft) {
   var f = '' + fld;
   if (f.length >= len)
      return f.substring(0, len);
   while (f.length < len)
      f = padleft ? ' ' + f : f + ' ';
   return f;
}
