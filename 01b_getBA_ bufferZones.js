// export monthly burned area in function of land cover /land use type 
// for amazonia indigenous lands buffer zones 
// dhemerson.costa@ipam.org.br

// set buffer zone size (in meters)
var buffer_size = 10000; 

// set output filename
var basename = 'BA-BUFFER-' + buffer_size / 1000 + 'KM' + '-COL2';

// read indigenous lands as vector
var ind_lands = ee.FeatureCollection('users/rayalves/te_amzl_tis_2020_funai_isa_raisg');

// and convert them to image using the 'id' property 
var territory = ind_lands
  .filter(ee.Filter.notNull(['id']))
  .reduceToImage({
    properties: ['id'],
    reducer: ee.Reducer.first(),
    }
  ).rename('territory');

// compute buffer zones
var buffer = ind_lands.map(function(feature) {
  return feature.buffer(buffer_size);
});

// and convert them to image using the 'id' property 
var territory_buffer = buffer
  .filter(ee.Filter.notNull(['id']))
  .reduceToImage({
    properties: ['id'],
    reducer: ee.Reducer.first(),
    }
  ).rename('territory');

// apply erase (into indigenous lands, to retain only non-indigenous buffer)
var territory = territory_buffer.updateMask(
  ee.Image(1).clip(ind_lands).unmask(0).neq(1)
  );
  
Map.addLayer(territory.randomVisualizer(),{}, 'Buffer - ' + buffer_size / 1000 + ' km');

// read monthly burned area 
var asset = ee.Image('projects/mapbiomas-workspace/public/collection7_1/mapbiomas-fire-collection2-monthly-burned-coverage-1');

// plot regions
Map.addLayer(territory.randomVisualizer(), {}, 'Indigenous lands');

// get geometries
var geometry = asset.geometry();

// change the scale if you need.
var scale = 30;

// define the years to bem computed 
var years = ee.List.sequence({'start': 1985, 'end': 2022, 'step': 1}).getInfo();

// define a Google Drive output folder 
var driverFolder = 'AREA-BA-INDIGENOUS-LANDS';

// Image area in km2
var pixelArea = ee.Image.pixelArea().divide(10000);

// convert a complex object to a simple feature collection 
var convert2table = function (obj) {
  obj = ee.Dictionary(obj);
    var territory = obj.get('territory');
    var classesAndAreas = ee.List(obj.get('groups'));
    
    var tableRows = classesAndAreas.map(
        function (classAndArea) {
            classAndArea = ee.Dictionary(classAndArea);
            var classId = classAndArea.get('class');
            var area = classAndArea.get('sum');
            var tableColumns = ee.Feature(null)
                .set('territory', territory)
                .set('pixel_id', classId)
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
            maxPixels: 1e13
        });
        
    territotiesData = ee.List(territotiesData.get('groups'));
    var areas = territotiesData.map(convert2table);
    areas = ee.FeatureCollection(areas).flatten();
    return areas;
};

// perform per year 
var areas = years.map(
    function (year) {
        var image = asset.select('burned_coverage_' + year);
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

areas = ee.FeatureCollection(areas).flatten();

// Export indigenous land burned area
Export.table.toDrive({
    collection: areas,
    description: basename,
    folder: driverFolder,
    fileFormat: 'CSV'
});
