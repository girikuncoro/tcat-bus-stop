var routes = {
    '/map': map,
    '/detail/.*$': detail
};

router = Router(routes);
router.init('/map');
