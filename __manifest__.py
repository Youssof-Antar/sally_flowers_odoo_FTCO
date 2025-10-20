{
    "name": "Sally Flowers",
    "version": "1.0",
    "summary": "Manage Sally’s flower shop",
    "category": "Custom",
    "author": "You",
    "depends": ["base", "web", "product", "point_of_sale"],
    "assets": {
        "web.assets_backend": [
            
          "point_of_sale/static/src/app/store/pos_hook.js",
            "sally_flowers/static/src/addons/*.js",
            "sally_flowers/static/src/addons/*.xml",
        ],
        'point_of_sale._assets_pos': [
            "sally_flowers/static/src/**/*.js",
            "sally_flowers/static/src/**/*.xml",
        ],
    },
    "data": [
        "security/ir.model.access.csv",
        "views/menu.xml",
         "views/product_views.xml",
    ],
    "installable": True,
    "application": True,
}
