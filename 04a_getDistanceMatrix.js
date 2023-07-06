var geometry = 
    ee.Geometry.Polygon(
        [[[-74.4105002524012, 6.339690689376228],
          [-74.4105002524012, -18.456331274915716],
          [-43.91245337740121, -18.456331274915716],
          [-43.91245337740121, 6.339690689376228]]], null, false);

// read indigenous lands and their buffer zones
var territories = ee.ImageCollection('users/dh-conciani/help/nucleo_indigena/fire_23/sites_v2')
      .mosaic();

// get only buffer zones
var buffer = territories.updateMask(territories.eq(2));

// get distance mask
var distance = buffer.distance(ee.Kernel.euclidean(200000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)));

Export.image.toAsset({
		image: distance,
    description: 'DISTANCE_MATRIX',
    assetId: 'users/dh-conciani/help/nucleo_indigena/fire_23/distance_matrix_v2',
    region: geometry,
    scale: 30,
    maxPixels: 1e13,
});

Map.addLayer(territories.randomVisualizer(), {}, 'all');
Map.addLayer(distance, {palette:['green', 'yellow', 'red'], min:1, max:40000}, 'distance');
