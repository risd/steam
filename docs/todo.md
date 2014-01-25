### left off

- how does geojson get made?
    - clock.py should intermittenly make a new geojson file
    - properties about each cluster should be in the geojson properties
        - tlg id?
        - aggregate count of work_in option values

- point frontend to the correct geojson file path

- put together queries for the steamie networks

- profile work
    - disable editing while requests are being made

    - consider transition between states. particularly while requests are being made. what kind of animation do you want?

    - go through a clean sign up.


## consider

CONSIDER:

Either patch `tasty_pie.full_dehydrate` to pass `update_fields` to the `model.save()` method, particularly when using the `patch_detail` method (which is meant for partial updates).
    
    model.save(updated_fields=('top_level_input', 'work_in'))


OR just check everytime. getting the `previous` object, which is really the current object that is about to be saved over. if the values coming in are different, then adjust the `work_in` count, that is being (will be)tracked in `TopLevelGeo`

    previous = model.objects.get(pk=instance.pk)
    if previous.top_level_input === instance.top_level_input:
        continue
    else:
        if previous.work_in == 'education':
            previous.top_level.work_in_education -= 1

OR

PERHAPS. work_in should be a write once operation. when your steamie is created, write the number to the cluster.

should a person be able to change their work_in value?

Either way, would be good to track the total work_in count for each STEAMie type in top_level_geo.

It makes it easier if you don't have to track previous values in order to subtract from the previous count, and then add to the new TLG.

Also consider how counting will be effected if someone changes locations

Should these things be interchangable?

Things like personal info should be updatable/retractable. But these other bits?

:END CONSIDER