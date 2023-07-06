// read indigenous lands and their buffer zones
var territories = ee.ImageCollection('users/dh-conciani/help/nucleo_indigena/fire_23/sites_v2')
      .mosaic();

// get only buffer zones
var buffer = territories.updateMask(territories.eq(2));

// get distance mask
var distance = buffer.distance(ee.Kernel.euclidean(200000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)));



Map.addLayer(territories.randomVisualizer(), {}, 'all');
Map.addLayer(distance, {palette:['green', 'yellow', 'red'], min:1, max:40000}, 'distance');
