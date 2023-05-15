// prepare data
// create a image collection in which each territory is exported as a unique image containing their bounds and buffer zone
// dhemerson.costa@ipam.org.br

// input territories data as features
var input = ee.FeatureCollection('users/rayalves/te_amzl_tis_2020_funai_isa_raisg')
input = ee.FeatureCollection(input.toList(input.size()).slice(0, 9));


var count= 0

// build auxiliary as image
var input_image = ee.Image(1).clip(input);
Map.addLayer(input_image);

// set buffer zone size
var buffer_size = 10000;

// set output imageCollection
var output = 'users/dh-conciani/help/tonomapa/sites';

// read input data
var data = ee.ImageCollection(
  input.map(function(feature) {
    // get ocjectid
    var obj = feature.get('code_funai');
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
    
    return (image);
  })
);

print('raw', data);

// convert to list
var imageList = data.toList(data.size());

// export each image
for (var i = 0; i < imageList.length().getInfo(); i++) {
  var image = ee.Image(imageList.get(i));
  count = count + 1;
  Export.image.toAsset({
        image: image,
        description: count.toString(),
        assetId: output + '/' + count.toString(),
        scale: 10,
        //region: image.geometry()
      });
}
