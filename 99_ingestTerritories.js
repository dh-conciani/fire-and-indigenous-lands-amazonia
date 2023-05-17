// prepare data
// create a image collection in which each territory is exported as a unique image containing their bounds and buffer zone
// dhemerson.costa@ipam.org.br

// input territories data as features
var input = ee.FeatureCollection('users/rayalves/te_amzl_tis_2020_funai_isa_raisg');
input = ee.FeatureCollection(input.toList(input.size()).slice(0, 2));

// build auxiliary as image
var input_image = ee.Image(1).clip(input);
Map.addLayer(input_image);

// set buffer zone size
var buffer_size = 10000;

// set output imageCollection
var output = 'users/dh-conciani/help/nucleo_indigena/fire_23/indigenous-lands-image';

// read input data
var data = ee.ImageCollection(
  input.map(function(feature) {
    // get ocjectid
    var obj = feature.get('id');
    // compute buffer zone
    var buffer = feature.buffer(buffer_size)
      // and retain only difference (outer space)
      .difference(feature);
    // convert it to an image
    var image = ee.Image(1).clip(feature)
      .blend(ee.Image(2).clip(buffer))
      .set('territory', obj);
    
    // remove overlaps with other territories
    image = image.where(image.eq(2).and(input_image.eq(1)), 0).selfMask();
    
    return (image.rename(ee.String(obj)));
  })
);

// convert to img
var img = data.toBands().toByte();

// Extract the values after underscore and rename the bands in 'img' variable
var bands = img.bandNames();
var renamedBands = bands.map(function(band) {
  var bandName = ee.String(band)
    .split('_').get(1);  // Extract the value after the underscore

  return img.select([band]).rename([bandName]);
});

// Create a new image with renamed bands
var renamedImage = renamedBands.slice(1).iterate(function(image, previous) {
  return ee.Image(previous).addBands(image);
}, renamedBands.get(0));

// Get the band names of the image
var bandNames = ee.Image(renamedImage).bandNames();

// Add prefix 'territory' to the start of each band name
var prefixedBandNames = bandNames.map(function(band) {
  return ee.String('territory_').cat(band);
});

// Rename the bands of the image with the prefixed names
var renamedImage = ee.Image(renamedImage).rename(prefixedBandNames);
var renameImage = ee.Image(renamedImage).toByte().aside(print);

// stack into a single image
Export.image.toAsset({
  image: ee.Image(renamedImage), 
  description: 'indigenous-lands',
  assetId: output,
  region: input.geometry(),
  scale: 10, 
  maxPixels: 1e13
});



/*

*/
