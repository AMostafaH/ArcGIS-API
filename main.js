require(["esri/config","esri/Map", "esri/views/MapView","esri/widgets/Home","esri/widgets/BasemapGallery","esri/layers/FeatureLayer","esri/widgets/Legend","esri/request","esri/tasks/Locator","esri/Graphic","esri/symbols/WebStyleSymbol"], function (esriConfig,Map, MapsView,Home,BasemapGallery,FeatureLayer,Legend,esriRequest,Locator,Graphic,WebStyleSymbol) {

    esriConfig.apiKey = "";

    //PopUp window to display some Info
    var myPopUp = {
        content : 'Pop = {POP} </br> rank = {POP_RANK}',
        title: "{CNTRY_NAME} - {CITY_NAME}"
    }
    // Add Symbology
//#region 
    /*
    var render = {
        type: "unique-value",
        field: "CNTRY_NAME",
        uniqueValueInfos: [
            {
                value: "Egypt",
                symbol: {
                type: "simple-marker",
                color: "black",
                style: "circle",
                size: 5
              },
              label: "Egypt"
            }, {
                value: "Libya",
                symbol: {
                type: "simple-marker",
                color: "green",
                style: "circle",
                size: 5
              },
              label: "Libya"
            }, {
                value: "Sudan",
                symbol: {
                type: "simple-marker",
                color: "red",
                style: "circle",
                size: 5
              },
              label: "Sudan"
            }
        ],
        defaultSymbol: {
            type: "simple-marker",
            color: "orange",
            style: "circle",
            size: 5
        }
    }; */

//#endregion
    var render = {
        type : "class-breaks",
        field : "POP",
        classBreakInfos: [
            {
              minValue: 0,
              maxValue: 1000000,
              symbol: {
                type: "simple-marker",
                color: "black",
                style: "circle",
                size: 5
              },
              
              label: "fewer than 1M"
            }, {
              minValue: 1000001,
              maxValue: 10000000,
              symbol: {
                type: "simple-marker",
                color: "green",
                style: "circle",
                size: 5
              },
              label: "range 1M - 10M"
            }, {
              minValue: 10000001,
              maxValue: 100000000,
              symbol: {
                type: "simple-marker",
                color: "red",
                style: "circle",
                size: 5
              },
              label: "more than 10M"
            }
        ],
        defaultSymbol: {
            type: "simple-marker",
            color: "orange",
            style: "circle",
            size: 5
        }
    };
    //Connecting to feature Layer from Server
    const layer = new FeatureLayer({
        // URL to the service
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/world_cities/FeatureServer/0",
        popupTemplate : myPopUp,
        //definitionExpression : "CNTRY_NAME = 'Peru'",
        renderer: render
    });

    // Query used for goTo function
    layer.on("layerview-create",function(){
        //console.log("Hello");
        layer.queryExtent().then(function(result){
            view.goTo(result.extent,{duration:3000});  // go to the extent of the results
        });
    }); 
    
    // Construct your View
    const mymap = new Map({
      basemap: "topo", // Basemap layer service
      layers : layer
    });
    const view = new MapsView({
        map: mymap,
        center: [30, 30], // Longitude, latitude
        zoom: 5, // Zoom level
        container: "viewDiv" // Div element
    });
    console.log(view)
//#region 
    /*
    // Add event to goTo where you clicked
    view.on("click",function(event){
        view.goTo({
            center: [event.mapPoint.longitude,event.mapPoint.latitude],
            zoom: 10
        },
        {
            duration: 5000  // Duration of animation will be 5 seconds
        });
    });
    */
//#endregion
   
    // Adding Home Button to restore Default 
    var homeWidget = new Home({
        view: view
    });
    view.ui.add(homeWidget, "top-right");

    // Adding Drop down list for baseMap
    var basemapGallery = new BasemapGallery({
        view: view
    });

    // Add widget to the top right corner of the view
    //#region 

   /*  view.ui.add(basemapGallery, {
    position: "bottom-right"
    }); */

    //#endregion

    //Button to Toggle baseMap Widget
    var baseflag = true;
    document.getElementById("baseMapToggle").addEventListener("click",function(){

        if(baseflag == false)
        {
            view.ui.remove(basemapGallery);
            baseflag = true;
        }
        else if(baseflag == true)
        {
            view.ui.add(basemapGallery, {
                position: "bottom-left"
            });
            baseflag = false;
        }
    });

    // Legend Widget
    var legend = new Legend({
        view: view,
        layerInfos: [{
            layer: layer,
            title: "Legend"
        }]
    });
    
    //Button to Toggle Legend Widget
    var legendflag = true;
    document.getElementById("legendToggle").addEventListener("click",function(){

        if(legendflag == false)
        {
            view.ui.remove(legend);
            legendflag = true;
        }
        else if(legendflag == true)
        {
            view.ui.add(legend, "bottom-right");
            legendflag = false;
        }
    });

    // Add dropdown List for Countries
    var selectCNTRY = document.getElementById("selectCNTRY");
    var selectCITY = document.getElementById("selectCITY");
    var url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/world_cities/FeatureServer/0/query";
    var qOption = {
        query : {
            where: "1=1",
            f:"json",
            outFields: [ "CNTRY_NAME, CITY_NAME, POP"]
        }
    };
    esriRequest(url,qOption).then(function(res){
        //console.log(res);
        var countryName = [];
        for(let i=0; i < res.data.features.length;i++)
        {
            if(!countryName.includes(res.data.features[i].attributes.CNTRY_NAME))
            {
                countryName.push(res.data.features[i].attributes.CNTRY_NAME);
                var Option = document.createElement("option");
                Option.textContent = res.data.features[i].attributes.CNTRY_NAME;
                Option.value = res.data.features[i].attributes.CNTRY_NAME;

                selectCNTRY.appendChild(Option);
            }
        }
        selectCNTRY.addEventListener("change",function(){
            var cntryName = this.value;
            if(cntryName == "All")
            {
                layer.definitionExpression = "";
                selectCITY.style.visibility = "hidden";
            }
            else{
                layer.definitionExpression = "CNTRY_NAME = '" + cntryName + "'";
            }
            layer.queryExtent().then(function(result){
                view.goTo(result.extent,{duration:3000});  // go to the extent of the results
                layer.queryFeatures({where:"CNTRY_NAME = '" + cntryName + "'"}).then(function(resp){
                   
                    //console.log(resp)
                    selectCITY.style.visibility = "visible";
                    while(selectCITY.options.length){
                        selectCITY.options.remove(0);
                    }
                    for (let i = 0; i < resp.features.length; i++) {
                        var Option = document.createElement("option");
                        Option.textContent = resp.features[i].attributes.CITY_NAME;
                        Option.value = resp.features[i].attributes.CITY_NAME;

                        selectCITY.appendChild(Option);  
                    }
                    //console.log(selectCITY.options.length)
                })
            });
        })
        
    })
    // Web Style Symbol 2D
    const atmSymbol = new WebStyleSymbol({
        name: "atm",
        styleName: "Esri2DPointSymbolsStyle"
    });
    const hospitalSymbol = new WebStyleSymbol({
        name: "hospital",
        styleName: "Esri2DPointSymbolsStyle"
    });
    const coffeeShopSymbol = new WebStyleSymbol({
        name: "coffee-shop",
        styleName: "Esri2DPointSymbolsStyle"
    });
    const gasStationSymbol = new WebStyleSymbol({
        name: "gas-station",
        styleName: "Esri2DPointSymbolsStyle"
    });
    const pharmacySymbol = new WebStyleSymbol({
        name: "pharmacy",
        styleName: "Esri2DPointSymbolsStyle"
    });
    const restaurantSymbol = new WebStyleSymbol({
        name: "restaurant",
        styleName: "Esri2DPointSymbolsStyle"
    });
    // Check the selected Category
    var category = null;//"Hospital";

    var selectedCategory = document.getElementById("category");
    selectedCategory.addEventListener("change", function(){
        category = this.value;
        console.log(category)
    })
    // Start Locator
    var locURL ="https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
    var myLocator = new Locator({
        url:locURL
    })
    //var myGraphic;
    function findPlaces(point){
        myLocator.addressToLocations({
            location: point,//view.center,
            categories:category,//["Hospital, ATM, Pharmacy, Coffee Shop, Gas Station, Pizza"],
            maxLocations: 20,
            outFields: ["*"]
        }).then(function(Places){
            
            console.log(Places)

            Places.forEach(place => {
                console.log(place.attributes.Type )
                
                var myGraphic = new Graphic({
                    attributes: place.attributes,
                    geometry: place.location,
                    popupTemplate:{
                        title: "{PlaceName}",
                        content: "{Place_addr}"
                    }
                })
                if(place.attributes.Type == "Hospital")
                {
                    myGraphic.symbol = hospitalSymbol; 
                }
                else if(place.attributes.Type == "ATM")
                {
                    myGraphic.symbol = atmSymbol;
                }
                else if(place.attributes.Type == "Pharmacy")
                {
                    myGraphic.symbol = pharmacySymbol;
                }
                else if(place.attributes.Type == "Pizza")
                {
                    myGraphic.symbol = restaurantSymbol;
                }
                else if(place.attributes.Type == "Coffee Shop")
                {
                    myGraphic.symbol = coffeeShopSymbol;
                }
                else if(place.attributes.Type == "Gas Station")
                {
                    myGraphic.symbol = gasStationSymbol;
                }
                view.graphics.add(myGraphic)
            })
        })
    }
    
    document.getElementById("clear").addEventListener("click", function(){
        view.graphics.removeAll();
    });

    view.on("click",function(event){
        console.log(event);
        findPlaces(event.mapPoint)
    })
    //view.on("click",findPlaces)
});