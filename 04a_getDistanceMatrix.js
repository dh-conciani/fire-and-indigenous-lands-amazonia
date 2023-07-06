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
var distance1 = buffer.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)));

// get distance mask
var distance2 = distance1.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)))
  .updateMask(distance1.mask().not())
  .add(10000);

// get distance mask
var distance3 = distance2.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)))
  .updateMask(distance1.mask().not())
  .updateMask(distance2.mask().not())
  .add(20000);

// get distance mask
var distance4 = distance3.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)))
  .updateMask(distance1.mask().not())
  .updateMask(distance2.mask().not())
  .updateMask(distance3.mask().not())
  .add(30000);

// get distance mask
var distance5 = distance4.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)))
  .updateMask(distance1.mask().not())
  .updateMask(distance2.mask().not())
  .updateMask(distance3.mask().not())
  .updateMask(distance4.mask().not())
  .add(40000);

// get distance mask
var distance6 = distance5.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)))
  .updateMask(distance1.mask().not())
  .updateMask(distance2.mask().not())
  .updateMask(distance3.mask().not())
  .updateMask(distance4.mask().not())
  .updateMask(distance5.mask().not())
  .add(50000);

// get distance mask
var distance7 = distance6.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)))
  .updateMask(distance1.mask().not())
  .updateMask(distance2.mask().not())
  .updateMask(distance3.mask().not())
  .updateMask(distance4.mask().not())
  .updateMask(distance5.mask().not())
  .updateMask(distance6.mask().not())
  .add(60000);

var distance8 = distance7.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)))
  .updateMask(distance1.mask().not())
  .updateMask(distance2.mask().not())
  .updateMask(distance3.mask().not())
  .updateMask(distance4.mask().not())
  .updateMask(distance5.mask().not())
  .updateMask(distance6.mask().not())
  .updateMask(distance7.mask().not())
  .add(70000);

var distance9 = distance8.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)))
  .updateMask(distance1.mask().not())
  .updateMask(distance2.mask().not())
  .updateMask(distance3.mask().not())
  .updateMask(distance4.mask().not())
  .updateMask(distance5.mask().not())
  .updateMask(distance6.mask().not())
  .updateMask(distance7.mask().not())
  .updateMask(distance8.mask().not())
  .add(80000);

var distance10 = distance9.distance(ee.Kernel.euclidean(10000, 'meters'), false)
  .updateMask(territories.updateMask(territories.eq(1)))
  .updateMask(distance1.mask().not())
  .updateMask(distance2.mask().not())
  .updateMask(distance3.mask().not())
  .updateMask(distance4.mask().not())
  .updateMask(distance5.mask().not())
  .updateMask(distance6.mask().not())
  .updateMask(distance7.mask().not())
  .updateMask(distance8.mask().not())
  .updateMask(distance9.mask().not())
  .add(90000);

// merge all
var matrix = distance1.blend(distance2).blend(distance3).blend(distance4).blend(distance5).blend(distance6).blend(distance7)
  .blend(distance8).blend(distance9).blend(distance10);


Export.image.toAsset({
		image: matrix,
    description: 'DISTANCE_MATRIX',
    assetId: 'users/dh-conciani/help/nucleo_indigena/fire_23/distance_matrix_v2',
    region: geometry,
    scale: 30,
    maxPixels: 1e13,
});

Map.addLayer(territories.randomVisualizer(), {}, 'all');
Map.addLayer(matrix, {palette:['green', 'yellow', 'red'], min:1, max:90000}, 'all');
