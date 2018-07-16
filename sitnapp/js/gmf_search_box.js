    /**********
    *** Geomapfish compliant full text search & localisation (x,y,z using mns)
    */


  $( function() {
    function log( message ) {
      $( "<div>" ).text( message ).prependTo( "#log" );
      $( "#log" ).scrollTop( 0 );
    }

    $( "#places" ).autocomplete({
        classes: {
            "ui-autocomplete": "sitn-autocomplete"
        },
        source: function( request, response ) {
            $.ajax( {
                url: "https://mapnv.ch/main/wsgi/fulltextsearch?",
                dataType: "jsonp",
                data: {
                    query: request.term,
                    limit: 20,
                    partitionlimit: 24,
                    layer_name: 'adresses_sitn'
                },
                success: function(data) {
                    let features = data.features;
                    let jquiFeatures = [];
                    for(let i=0; i<features.length; i++) {
                        let f = features[i];
                        let jquiF = {
                            geom: f.geometry,
                            id: f.id,
                            label: f.properties.label
                        }
                        jquiFeatures.push(jquiF);
                    }

                    response( jquiFeatures );

                }
            });
        },
        minLength: 2,
        select: function(event, ui) {

            coord = ui.item.geom.coordinates;
            var alti = 700;
            var zoom_out = 100;
            viewer.scene.addAnnotation([coord[0][0], coord[0][1], alti - zoom_out], {
                "title": ui.item.label,
                "description": 'Adresse MAPNV',
                "cameraPosition": [coord[0][0], coord[0][1], alti + zoom_out],
                "cameraTarget": [coord[0][0], coord[0][1], alti]
            });

            let annotationsB = viewer.scene.getAnnotations();
            for (let index in annotationsB.children) {
                if (annotationsB.children[index].description == "Adresse MAPNV") {
                    annotationsB.children[index].elDescription.css('opacity', 0); // hugly hack
                    annotationsB.children[index].moveHere(viewer.scene.camera);
                }
            }

        }
    });
 });
