// get area by territory 
// dhemerson.costa@ipam.org.br

// read indigenous lands and their buffer zones
var ind = ee.ImageCollection('users/dh-conciani/help/nucleo_indigena/fire_23/sites_v2')
      .mosaic();

// get only buffer zones
var buffer = ind.updateMask(ind.eq(2));

// get distance mask
var distance = buffer.distance(ee.Kernel.euclidean(200000, 'meters'), false)
  .updateMask(ind.updateMask(ind.eq(1)));

Map.addLayer(ind.randomVisualizer(), {}, 'all');
Map.addLayer(distance, {palette:['green', 'yellow', 'red'], min:1, max:40000}, 'distance');

// -- * 
// read collection of images in which areas will be computed
var collection = ee.Image('projects/mapbiomas-workspace/public/collection7_1/mapbiomas-fire-collection2-monthly-burned-coverage-1');

// define the years to bem computed 
var years = ee.List.sequence({'start': 1985, 'end': 2022, 'step': 1}).getInfo();
// *-- 

// -- *
// compute areas in hectares
var pixelArea = ee.Image.pixelArea().divide(10000);

// change scale if you need (in meters)
var scale = 30;

// * --
// define a Google Drive output folder 
var driverFolder = 'AREA-EXPORT-IND-LANDS';
// * -- 

// -- *
// read input data
var territories = ee.ImageCollection('users/dh-conciani/help/nucleo_indigena/fire_23/sites_v2');

// for each territory
var computed = territories.map(function(image) {
  
  // get territory
  var territory = image;

  // get geometry boundsma
  var geometry = image.geometry();
  
  // convert a complex object to a simple feature collection 
  var convert2table = function (obj) {
    obj = ee.Dictionary(obj);
      var territory = obj.get('territory');
      var classesAndAreas = ee.List(obj.get('groups'));
      
      var tableRows = classesAndAreas.map(
          function (classAndArea) {
              classAndArea = ee.Dictionary(classAndArea);
              var classId = classAndArea.get('constant');
              var area = classAndArea.get('sum');
              var tableColumns = ee.Feature(null)
                  .set('objectid', image.get('territory'))
                  .set('condition', territory)
                  .set('distance', classId)
                  .set('area', area);
                  
              return tableColumns;
          }
      );
      
      
  
      return ee.FeatureCollection(ee.List(tableRows));
  };
  
  // compute the area
  var calculateArea = function (image, territory, geometry) {
      var territotiesData = pixelArea.addBands(territory).addBands(image)
          .reduceRegion({
              reducer: ee.Reducer.sum().group(1, 'class').group(1, 'territory'),
              geometry: geometry,
              scale: scale,
              maxPixels: 1e12
          });
          
      territotiesData = ee.List(territotiesData.get('groups'));
      var areas = territotiesData.map(convert2table);
      areas = ee.FeatureCollection(areas).flatten();
      return areas;
  };
  
  // perform per year 
  var areas = years.map(
      function (year) {
          var image = collection.select('burned_coverage_' + year);
          image = distance.updateMask(image);
          
          var areas = calculateArea(image, territory, geometry);
          // set additional properties
          areas = areas.map(
              function (feature) {
                  return feature.set('year', year);
              }
          );
          return areas;
      }
  );
  
  // store
  areas = ee.FeatureCollection(areas).flatten();
  
  return areas;
});

// export data
Export.table.toDrive({
      collection: ee.FeatureCollection(computed).flatten(),
      description: 'DISTANCE_INDIGENOUS_LANDS',
      folder: driverFolder,
      fileFormat: 'CSV'
});
