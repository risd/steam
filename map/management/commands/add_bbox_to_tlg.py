# micah and ruben talked about having each
# district zoom you into a bounding box
# for that district. instead of loading
# topojson and searching through all
# features in the browser, just have
# the bouding box coordinates as attributes
# on the toplevelgeo features.

# since then ruben added hover states to
# each of the clusters. that shows whether
# you are opening up a network, or expanding 
# the clusters.

# havent decided that this is necessary.

# if it is, districts_geocoded_w_bbox has been 
# updated to include minx,miny,maxx,maxy coordinates
# they just need to be added to the TopLevelGeo
# data model, then to each instance.