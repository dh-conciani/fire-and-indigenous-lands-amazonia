## pre-proc gee tables 
## dhemerson.costa@ipam.org.br

# read library
library(reshape2)
library(sf)
library(dplyr)

## avoid sci notation
options(scipen= 9e3)

## read tables
ba_ti <- read.csv('./table/raw/BA-INDIGENOUS-LANDS-COL2.csv')
ba_buffer <- read.csv('./table/raw/BA-BUFFER-10KM-COL2.csv')

## insert localtion metadata
ba_ti$place <- 'Indigenous Land'
ba_buffer$place <- 'Buffer zone'

## merge
ba <- rbind(ba_ti, ba_buffer)

## exclude unused columns and temp files
ba <- ba[ , -which(names(ba) %in% c("system.index", ".geo"))]
rm(ba_ti, ba_buffer)

## split bit values into month and mapping class
ba$ba_month <- round(ba$pixel_id / 100, digits=0)
ba$ba_class_id <- ba$pixel_id %% 100 

## translate land cover classes
## import dictionary
mapbiomas_dict <- read.csv('./dict/mapbiomas-dict-ptbr.csv', sep= ';')

## create recipe to translate mapbiomas classes
data <- as.data.frame(NULL)
## for each tenure id
for (l in 1:length(unique(ba$ba_class_id))) {
  ## for each unique value, get mean in n levels
  y <- subset(mapbiomas_dict, id == unique(ba$ba_class_id)[l])
  ## select matched class
  z <- subset(ba, ba_class_id == unique(ba$ba_class_id)[l])
  ## apply translation 
  z$class_name <- gsub(paste0('^',y$id,'$'), y$mapb_1_2, z$ba_class_id)
  ## bind into recipe
  data <- rbind(data, z)
}; rm(ba, y, z)

# read attribute table (from vector) to perform join 
vec <- read_sf('./vec/te_amzl_tis_2020_funai_isa_raisg.shp')
vec_gee <- read.csv('./vec/ind-lands-vec.csv', encoding = 'UTF-8')
vec$id <- vec_gee$id
rm(vec_gee)

## join tables
x <- left_join(x= data, y= vec, by=c('territory' = 'id'))
x <- x[ , -which(names(x) %in% c("geometry"))]

## export table
write.csv(x, './table/proc/BA-INDIGENOUS-LAND-BUFFER-10KM.csv', sep=';', dec=',')
