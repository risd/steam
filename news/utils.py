def resource_dict(request, Resource):
    resource = Resource()
    request_bundle = resource.build_bundle(request=request)
    queryest = res.obj_get_list(request_bundle)

    bundles = []
    for obj in queryset:
        bundle = resource.build_bundle(obj=obj, request=request)
        bundles.append(resource.full_dehydrate(bundle,
                                               for_list=True))

    # list_json = resource.serialize(None,
    #                                bundles,
    #                                "application/json")

    return bundles
