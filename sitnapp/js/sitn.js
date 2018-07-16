// Basic Cutomization and extension of the standard Potree viewer


sitn = {};

sitn.loadedAnnontations = [];

sitn.setup = function (){
    $("#sldPointBudget").slider('option',{max: 15000000});
    // sitn.loadInitialAnnotations('sitnapp/data/annotations/ne_districts_simple.geojson', 1000);

    // Customize UI...
    $("#lblCameraPosition").parents('ul').css("visibility", "hidden");
    $("#lblCameraPosition").parents('ul').css("height", "0px");

    // hide tile layer in ol3 map
    viewer.mapView.getSourcesLayer().setVisible(false);

    sitn.setupClassifications();

}

sitn.setupClassifications = function () {

    viewer.classifications = {
        1: { visible: true, name: 'Non classé' },
        2: { visible: true, name: 'Sol' },
        3: { visible: true, name: 'Végétation' },
        6: { visible: true, name: 'Bâtiment' },
        9: { visible: true, name: 'Eau' },
        11: { visible: true, name: 'Route' }
    };

    let elClassificationList = $('#classificationList');
    elClassificationList.empty();
    let addClassificationItem = function (code, name) {
        let inputID = 'chkClassification_' + code;

        let element = $(`
            <li>
                <label style="whitespace: nowrap">
                    <input id="${inputID}" type="checkbox" checked/>
                    <span>${name}</span>
                </label>
            </li>
        `);

        let elInput = element.find('input');

        elInput.click(event => {
            viewer.setClassificationVisibility(code, event.target.checked);
        });

        elClassificationList.append(element);
    };

    for (cls in viewer.classifications) {
        addClassificationItem(cls, viewer.classifications[cls].name);
    }
};

sitn.loadInitialAnnotations = function (url, zoom_out) {

    $.ajax({
        url: url ,
        dataType: 'json',
        cache: false,
        success: function(geojson) {

        for (let i=0; i<geojson.features.length; i++) {

                let coord = geojson.features[i].geometry.coordinates;

                viewer.scene.addAnnotation([coord[0], coord[1], coord[2]], {
                    "title": geojson.features[i].properties.NAME,
                    "description": '',
                    "cameraPosition": [coord[0] + zoom_out, coord[1] + zoom_out, coord[2] + zoom_out],
                    "cameraTarget": [coord[0], coord[1], coord[2]]
                });
            }

            let annotations = viewer.scene.getAnnotations().children;

            for (let i=0; i<annotations.length; i++) {
                annotations[i].domElement[0].onclick = function() {
                    sitn.loadAnnotations('sitnapp/data/annotations/' + geojson.features[i].properties.next_file, 250);
                }
                annotations[i].firstLevel = true;
            }
        },
        error: function(req, status, err) {
            console.log('MC: Erreur au chargement du fichier geojson', status, err );
        }
    });

}


sitn.loadAnnotations = function (url, zoom_out) {

    $.ajax({
        url: url ,
        dataType: 'json',
        cache: false,
        success: function(geojson) {

            for (let i=0; i<geojson.features.length; i++) {
                    let aName = geojson.features[i].properties.NAME;
                    if(sitn.loadedAnnontations.indexOf(aName) == -1) {
                        let coord = geojson.features[i].geometry.coordinates;

                        viewer.scene.addAnnotation([coord[0], coord[1], coord[2]], {
                            "title": aName,
                            "description": '',
                            "cameraPosition": [coord[0] + zoom_out, coord[1] + zoom_out, coord[2] + zoom_out],
                            "cameraTarget": [coord[0], coord[1], coord[2]]
                        });

                        sitn.loadedAnnontations.push(aName)
                    }
                }
            let annotations = viewer.scene.getAnnotations().children;
            for (let i=0; i<annotations.length; i++) {
                if (!annotations[i].firstLevel) {
                    annotations[i].domElement[0].style.fontSize ='12px';
                }
            }
        },
        error: function(req, status, err) {
            console.log('MC: Erreur au chargement du fichier geojson', status, err );
        }
    });

}
