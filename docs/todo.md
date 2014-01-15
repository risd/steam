### left off

@micah, unless we add 'work_in' (edu,res,pol,ind) option to the 'choose_type_add_zip' page, we run the risk of "someone being on the map" without a color associated with them.
    - add 'work_in' options to the 'add_me' modal?

- make tsv of districts
    - including all attributes that will be saved to TopLevelGeo
    - can use the current districts shapefile to determine
        - lat/lon using centroids, no need to geocode them
        - US state names from abbreviations
        - compute ordinal district number

        - since you are geocoding zipcode to district, you only need to know the district. the `us_zip_code` field doesn't even have to be populated. could have it be part of the post_save signal.
        - there would be more than one zipcode per district anyway. there are many more zip codes than districts.
        - remove zip_code value?

- make editable US/zipcode or country drop down list work
    - powered by
        /04_country_list/02_tsv_geocodeable/countries_geocodable.tsv

- load all options into TopLevelGeo
    - countries tsv, with lat lon
    - districts tsv, with lat lon and all us_ variables, except zip_code

- add yourself to map workflow.
    - save data to db
    - return confirmation, and info about which network cluster they are a part of
    - animate a circle from the form into the network the individual is joining