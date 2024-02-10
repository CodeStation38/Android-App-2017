// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var pictureSource; // picture source
var destinationType; // sets the format of returned value 
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    //Variables globales para almacenar las fotos, para ser enviadas con el
    //boton Enviar (Incidente), en la anteultima pagina de la aplicacion
    var externalImagenUri1;
    var externalImagenUri2;
    var externalImagenUri3;
    var externalImagenUri4;
    var nlegajo1 = 1;

    var verifnleg1 = 1;
    var txtNuevoPass1 = "X";
    var legajoalmacenado = 1;
    var passalmacenada = "X";
    var phoneIDalmacenado = 1;

    var pass1 = "X";
    var obsmobile1 = "X";
    var calle1 = "X";
    var altura1 = 9999;
    var localidad1 = "X";
    var fotosetID = -1;
    var contadorFotos = 1;
    var cantfotosrestantes = 0;
    var fsetID_fRestantes = 0;
    var telID = 1;

    var db = null;

    var cantfotosenviarreales = 0;
    var cuatrofotos = false;
    var isGPSActivado = false;
    var GPSLat = 0;
    var GPSLong = 0;
    var nombreHasValidValue= false;
    var surnameHasValidValue= false;
    var legajoHasValidValue = false;
    var contaseniaHasValidValue = false;
    var calleHasValidValue = false;
    var alturaHasValidValue = false;
    var localidadHasValidValue = false;

    var detincidenteHasValidValue = false;


    var domiciliomanualvalido = false;

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        //VERIFICO SI EXISTE

        //CREO LOCALSTORAGE CON SQL LITE
        db = window.sqlitePlugin.openDatabase({ name: 'demo.db', location: 'default' });
        //alert('VERIF LLAMADO');

        db.transaction(function (tx) {
            tx.executeSql('SELECT count(*) AS mycount FROM DemoTable', [], function (tx, rs) {
                var rowcount = rs.rows.item(0).mycount
                //alert(rowcount);
                if (rowcount > 0) {
                    //alert('HAY USUARIO REGISTRADO');
                    //YA SE REGISTRO EN ESTE TELEFONO-OBTENGO DATOS REGISTRADOS
                    //LEGAJO, PASS Y UUID
                    //GO BIENVENIDA LOGIN PAGE
                    $("#Bienvenida-page").show();
                    $.mobile.changePage("#Bienvenida-page");
                }
                else {
                    //alert('NO TERMINO LA REGISTRACION');
                    //ErrorLocal-page               
                    //$("#OlvidoPass-page").hide();
                    $("#ErrorLocal-page").show();
                    document.getElementById("txtErrorLocal").innerHTML = "Error 23 al obtener datos desde Base local.";
                    $.mobile.changePage("#ErrorLocal-page");
                    //tx.executeSql('CREATE TABLE IF NOT EXISTS DemoTable (name, password, phoneUUID)');
                    //tx.executeSql('INSERT INTO DemoTable VALUES (?, ?, ?)', ['Alice', '1234', 'xrk789']);
                    //GO REGISTRACION PAGE
                    //$("#Registrar-page").show();
                }

            }, function (tx, error) {
                //alert('SELECT error: ' + error.message);
                //alert('NO HAY TABLA LOCAL');

                //GO REGISTRACION PAGE
                $("#Registrar-page").show();
                $.mobile.changePage("#Registrar-page");
            });
        });



        //Sacar foto y guardarla
        if (contadorFotos < 4) {
            $("#btnTomarFoto").on("tap", function () {

                navigator.camera.getPicture(onSuccess, onFail,
                {
                    quality: 12,
                    allowEdit: true,
                    correctOrientation: true,  
                    pictureSource: Camera.PictureSourceType.CAMERA,
                    destinationType: Camera.DestinationType.FILE_URI
                   
                    //saveToPhotoAlbum: true
                });
            });

        }
        else {
            //SI YA SACO LAS 4 FOTOS, OCULTO BOTON TOMAR FOTO.
            $("#btnTomarFoto").parent().hide();
        }




        $("#btnFotoYEnviar").on("tap", function () {   

            //INICIALIZO LA PRIMERA VEZ SOLAMENTE
            if (fotosetID === -1) {
                cantfotosrestantes = contadorFotos;                
            }
 
            if (!cuatrofotos) {
                cantfotosenviarreales = cantfotosrestantes - 1;
            }
            else {
                cantfotosenviarreales = 4;
            }

            //AREGO VALIDACION DE CAMPOS DOMICILIO, 
            //EN CASO QUE EL USUARIO QUIERA CARGARLOS MANUALMENTE,
            //SIN USAR EL GPS
            if (!isGPSActivado) {
                //GPS NO ACTIVADO
                //ASEGURO QUE HAYA ELEGIDO CARGA MANUAL DE DOMICILIO
                //VALIDO DOMICILIO, CARGO VARIABLES Y CONTINUO.
                //EL RESTO ES IGUAL PARA LOS DOS.
                ValidaCamposDomicilio();

                if (domiciliomanualvalido) {
                    $("#pnlDomicilio").hide();
                    $("#Domicilio-page").hide();
                    $("#EnvioFotosProgressBar-page").show();
                    $.mobile.changePage("#EnvioFotosProgressBar-page");

                    switch (cantfotosenviarreales) {
                        case 0:
                            //EL USUARIO ELIGE CREAR UNA INCIDENCIA SIN FOTOS
                            fotosetID = -5;
                            CrearIncidencia();
                            break;
                        case 1:            
                            uploadPhoto(externalImagenUri1);
                            break;
                        case 2:                        
                            uploadPhoto(externalImagenUri2);
                            break;
                        case 3:                        
                            uploadPhoto(externalImagenUri3);
                            break;
                        case 4:             
                            uploadPhoto(externalImagenUri4);
                            break;
                    }

                }
                //else
                //{
                //    //ALERT NOTIFICATION, INGRESE CAMPO VALIDO.
                //}

            }
            else {




                //CON GPS ACTIVADO, HAGO TODO LO QUE HACIA LA PARTE DE ABAJO
                //CARGO VARIABLES DOMICILIO CON LOS DATOS QUE TRAJO EL GPS.
                //EL RESTO ES IGUAL PARA LOS DOS.
                $("#pnlGPS").hide();//pnlGPS.Show
                $("#Domicilio-page").hide();
                $("#EnvioFotosProgressBar-page").show();//pnlGPS.Show
                $.mobile.changePage("#EnvioFotosProgressBar-page");

                switch (cantfotosenviarreales) {
                    case 0:
                        //EL USUARIO ELIGE CREAR UNA INCIDENCIA SIN FOTOS
                        fotosetID = -5;
                        CrearIncidencia();
                        break;
                    case 1:
                        uploadPhoto(externalImagenUri1);
                        break;
                    case 2:
                        uploadPhoto(externalImagenUri2);
                        break;
                    case 3:
                        uploadPhoto(externalImagenUri3);
                        break;
                    case 4:
                        uploadPhoto(externalImagenUri4);
                        break;
                }






            }


        });


        $("#btnRegistrar").on("tap", function (e) {
            //CrearUsuarioMovil();
            ValidaCamposRegistracion();
        });

        //
        $("#svpPassOlvido").on("tap", function (e) {
            //alert('OLVIDO PASS PAGE!');
            //OlvidoPass - page
            $("#Registrar-page").hide();
            $("#Bienvenida-page").hide();
            $("#OlvidoPass-page").show();
            $.mobile.changePage("#OlvidoPass-page");
        });

        //
        $("#btnChangePass").on("tap", function (e) {
            //alert('CAMBIO PASS!');
            CambiarContrasenia();
            //OlvidoPass - page
            //$.mobile.navigate("#OlvidoPass-page", { transition: "fade", info: "info about the hash" });
        });


        $("#btnExitoMismoTelefono").on("tap", function (e) {
            $("#ExitoInstMismoTelefono-page").hide();
            $("#Bienvenida-page").show();
            $.mobile.changePage("#Bienvenida-page");
        });



        //btnOmitirNuevoTelefono
        $("#btnOmitirNuevoTelefono").on("tap", function (e) {
            $("#ReinsNuevoTelefono-page").hide();
            $("#RechazaNuevoTelefono-page").show();
            $.mobile.changePage("#RechazaNuevoTelefono-page");
        });





        //btnSalirRechNuevoTel
        $("#btnSalirRechNuevoTel").on("tap", function (e)
        {
            if (window.confirm("Esta seguro que desea salir?")) 
            {
                //EL USUARIO DECIDE SALIR.
                 ExitMyApp();
            }
            //else 
            //{
            //    //USUARIO DECIDE NO SALIR.
            //    alert();
            //}
        });


        $("#btnExitoNuevoTelefono").on("tap", function (e) {
            $("#ExitoInstNuevoTelefono-page").hide();
            $("#Bienvenida-page").show();
            $.mobile.changePage("#Bienvenida-page");
        });


        //btnAsociarNuevoTel
        $("#btnAsociarNuevoTel").on("tap", function (e) {
            //alert('usuario existente, reinstala app en el nuevo telefono!');
            //SUCCESS: NLEGAJO EXISTE Y UTILIZA LA APLICACION EN NUEVO EQUIPO.
            //    "USUARIO REGISTRADO CON EXITO EN BASE DE DATOS demo". 
            //EN CASO DE HABERSE REGISTRADO CON EXITO EN LA BASE DE DATOS demo:
            //ALMACENO USUARIO, PASSWORD Y ID DEL TELEFONO, EN LA DBLOCAL DEL TELEFONO.
            //alert('VAR nlegajo1: ' + nlegajo1);
            //alert('VAR pass1: ' + pass1);
            //alert('VAR telID: ' + telID);
            if (window.confirm("Confirma asociacion de nuevo telefono?"))
            {
                //alert('ACEPTA ASOCIAR');
                $("#ReinsNuevoTelefono-page").hide();
                $("#RegUsuarioProgressBar-page").show();
                $.mobile.changePage("#RegUsuarioProgressBar-page");
                ConfigurarNuevoTelefono();
            }
            else
            {
                //alert('NO ACEPTA ASOCIAR');
                //IR A PAGINA DE "HA DECIDIDO NO INSTALAR LA APLICACION"
                //SOLO BOTON SALIR: Confirma salir de la aplicacion?
                $("#ReinsNuevoTelefono-page").hide();
                //RechazaNuevoTelefono
                $("#RechazaNuevoTelefono-page").show();
                $.mobile.changePage("#RechazaNuevoTelefono-page");
            }


        });



        //btnLogin
        $("#btnLogin").on("tap", function (e) {
            //alert('LOGIN!');
            Ingresar();
            //OlvidoPass - page
            //$.mobile.navigate("#OlvidoPass-page", { transition: "fade", info: "info about the hash" });
        });

        $("#btnIngresar2").on("tap", function (e) {
            //$("#Bienvenida-page").hide();
            $("#GPSReminder-page").hide();
            $("#Foto-page").show();
            $.mobile.changePage("#Foto-page");
        });


        //
        $("#btnConfirmPass").on("tap", function (e) {
            //alert('CONFIRMAR PASS NUEVA!');
            $("#NuevaPassConfirm-page").hide();
            $("#Bienvenida-page").show();
            $.mobile.changePage("#Bienvenida-page");
        });






        $("#btnActivarGPS").on("tap", function (e) {
            //ACTIVO GPS CON ALTA PRECISION, SI ME PERMITE EL TELEFONO
            //O EL USUARIO ACTIVA ESAS OPCIONES MANUALMENTE.
            //onRequestSuccess: USUARIO ACEPTA QUE LA APP ACTIVE LA FUNCION DEL TELEFONO
            //                  , LOCALIZACION DE ALTA PRECISION.
            //onRequestFailure: USUARIO RECHAZA QUE LA APP ACTIVE LA FUNCION DEL TELEFONO
            //                  , LOCALIZACION DE ALTA PRECISION.
            cordova.plugins.locationAccuracy.request(onRequestSuccess, onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);       
        });

        $("#btnOmitirGPS").on("tap", function (e) {
            $("#GPS-page").hide();
            $("#pnlDomicilio").show();
            $("#Domicilio-page").show();
            $.mobile.changePage("#Domicilio-page");
            $('#btnFotoYEnviar').removeClass('ui-state-disabled');
        });
 





        $("#btnDomicilio").on("tap", function (e) {
            //VALIDACION DE CAMPO OBSERVACIONES DE LA INCIDENCIA,
            //ES OBLIGATORIO

            //VERIFICA QUE SE INGRESE INFORMACION ACERCA DE LA INCIDENCIA
            var detincidenteVal = document.getElementById('svpDetIncidente').value;
            if (!detincidenteVal.match(/\S/)) {
                //alert ('Empty value is not allowed');
                detincidenteHasValidValue = false;
                var strinvaliddetincidente = 'Por favor, ingrese una breve descripcion acerca de esta incidencia que desea informar.';
                navigator.notification.alert(
                  strinvaliddetincidente,  // message
                  alertDismissed,         // callback
                  'Revise los datos ingresados.',            // title
                  'Completar'                  // buttonName
                );
            }
            else {
                detincidenteHasValidValue = true;

                //****** DETECTAR SI GPS ESTA ACTIVADO ******
                //FUNCION isGpsLocationEnabled:
                //Comprueba si el ajuste de ubicación del dispositivo está configurado para devolver ubicaciones de alta precisión desde el hardware del GPS. Devuelve true si el modo de ubicación está habilitado y se establece en:

                //RETORNA:
                //Dispositivo solamente = Sólo hardware GPS (alta precisión)
                //Alta precisión = hardware GPS, triangulación de red y ID de red Wifi (alta y baja precisión)

                //FIRMA DE LA FUNCION
                //Cordova.plugins.diagnostic.isGpsLocationEnabled (successCallback, errorCallback);

                cordova.plugins.diagnostic.isGpsLocationEnabled(function (enabled) {
                    //alert('Calculando...');
                    isGPSActivado = enabled;
                    //alert('Continuar: ' + isGPSActivado);

                    //10072017
                    //$("#Foto-page").hide();


                    if (isGPSActivado) {
                        //SI ESTA ACTIVADO, GUARDAR COORDENADAS GPS EN VARIABLES LAT,LONG
                        // Y NO MOSTRAR CAMPOS DE CALLE,ALTURA,ETC:
                        // MOSTRAR SOLO BOTON ENVIAR Y SALIR.  
                        //alert('Activado');

                        $("#Foto-page").hide();
                        $("#msgUbicacionProgressBar").show();
                        $("#Domicilio-page").show();
                        $.mobile.changePage("#Domicilio-page");


                        navigator.geolocation.getCurrentPosition(onGetPositionSuccess, onGetPositionError, { enableHighAccuracy: true });
                        //GPS INTENTA OBTENER DATOS DEL DOMICILIO INCIDENCIA Y LOS MUESTRA.

                        //10072017
                        //$("#msgUbicacionProgressBar").show();
                        //$("#Domicilio-page").show();
                        //$.mobile.changePage("#Domicilio-page");
                    }
                    else {
                        //alert('No Activado');
                        //SI NO ESTA ACTIVADO, MOSTRAR PAGINA "GPS Y LOCALIZACION"
                        $("#Foto-page").hide();
                        $("#GPS-page").show();
                        $.mobile.changePage("#GPS-page");
                    }

                }, function (error) {
                    //EN CASO DE ERROR DE GPS, SE PUEDE CARGAR DOMICILIO MANUAL

                    $("#Foto-page").hide();
                    $("#pnlDomicilio").show();
                    $("#Domicilio-page").show();
                    $.mobile.changePage("#Domicilio-page");
                    $('#btnFotoYEnviar').removeClass('ui-state-disabled');

                    //10072017
                    //$("#Domicilio-page").show();
                    //$.mobile.changePage("#Domicilio-page");
                });
                //****** FIN DETECTAR SI GPS ESTA ACTIVADO ******

            }

       });

        //Limitar la cantidad de caracteres en la Descripcion 
        $("#svpDetIncidente").on("tap", function (e) {
            var max = 250;
            if (e.which < 0x20) {
                return;
            }
            if (this.value.length === max) {
                e.preventDefault();
            } else if (this.value.length > max) {
                // Maximum exceeded
                this.value = this.value.substring(0, max);
            }
        });

        $("#btnSalir").on("tap", function () {
            ExitMyApp();
        });
        $("#btnSalir2").on("tap", function () {
            ExitMyApp();
        });

        $("#btnSalir4").on("tap", function () {
            ExitMyApp();
        });
        $("#btnSalir5").on("tap", function () {
            ExitMyApp();
        });
        $("#btnSalir6").on("tap", function () {
            ExitMyApp();
        });






        $("#btnSalir23").on("tap", function () {
            ExitMyApp();
        });

        $("#btnSalirLogin").on("tap", function () {
            ExitMyApp();
        });
        $("#btnSalirOlvidoPass").on("tap", function () {
            ExitMyApp();
        });
        $("#btnSalir63").on("tap", function () {
            ExitMyApp();
        });

    };

    //ARMO LA MINI-GALERIA DE FOTOS
    function onSuccess(imageuri) {
        if (contadorFotos <= 4) {

            var binaryimg = contadorFotos;
            window['variable' + binaryimg] = imageuri;
          
            switch (contadorFotos) {
                case 1:
                    var newvar1 = window['variable' + binaryimg];
                    externalImagenUri1 = newvar1;
                   
                    var image1 = document.getElementById("thephoto1");
                    image1.innerHTML = "<img src='" + newvar1 + "'class='imgStyle'/>";
                   
                    contadorFotos = contadorFotos + 1;
                    
                    break;
                case 2:
                    var newvar2 = window['variable' + binaryimg];
                    externalImagenUri2 = newvar2;
                    
                    var image2 = document.getElementById("thephoto2");
                    image2.innerHTML = "<img src='" + newvar2 + "'class='imgStyle'/>";
                    
                    contadorFotos = contadorFotos + 1;
                    
                    break;
                case 3:
                    var newvar3 = window['variable' + binaryimg];
                    externalImagenUri3 = newvar3;
                    
                    var image3 = document.getElementById("thephoto3");
                    image3.innerHTML = "<img src='" + newvar3 + "'class='imgStyle'/>";
                   
                    contadorFotos = contadorFotos + 1;
                    
                    break;
                case 4:
                    var newvar4 = window['variable' + binaryimg];
                    externalImagenUri4 = newvar4;
                   
                    var image4 = document.getElementById("thephoto4");
                    image4.innerHTML = "<img src='" + newvar4 + "'class='imgStyle'/>";
                    cuatrofotos = true;
                   
                    contadorFotos = contadorFotos + 1;
                    $("#btnTomarFoto").hide();
                    break;
            }
        }
        else {            
            $("#btnTomarFoto").hide();
        }

    }

    // Called if something bad happens.
    function onFail(message) {
        alert('Error dispositivo camara: ' + message);
    }

    //*******UPLOAD FOTOS TO SERVER btnFotoYEnviar ********
    function uploadPhoto(imageURI) {      
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.trustAllHosts = true;

        var params = {};
       
        params.value1 = fotosetID;    
        params.value2 = cantfotosenviarreales;
        options.params = params;


        var ft = new FileTransfer();

        //CONTROLAR AQUI, SI YA ENVIO LAS 4 FOTOS, O TODAS LAS QUE HABIA PARA ENVIAR,
        //, NO SEGUIR ENVIANDO.       
        
        if (cantfotosenviarreales > 0) {
            ft.upload(imageURI, encodeURI("http://movil.demo.com.ar:9911/user/PostUserImage"), win, fail, options);
        }
    }

    function win(r) {
        //SEPARO LA CLAVE COMPUESTA QUE VIENE DESDE EL WEB API
        fsetID_fRestantes = r.response.match(/\d+/)[0];
       
        //ACTUALIZO CANTIDAD DE FOTOS QUE FALTAN ENVIAR/PROCESAR
        cantfotosenviarreales = fsetID_fRestantes % 100;
      
        //ACTUALIZO EL FOTOSETID       
        fotosetID = (fsetID_fRestantes - cantfotosenviarreales) / 100

        if (cantfotosenviarreales !== 5)
        {
            //REEMPLAZAR ESTO POR PANTALLA ANIMADA CON LOGO demo
            $("#Domicilio-page").hide();            
        }
        
        //switch (cantfotosrestantes) {
        switch (cantfotosenviarreales) {
            case 1:         
                uploadPhoto(externalImagenUri1);
                break;
            case 2:               
                uploadPhoto(externalImagenUri2);
                break;
            case 3:             
                uploadPhoto(externalImagenUri3);
                break;
            case 4:             
                uploadPhoto(externalImagenUri4);
                break;
            case 5:
                CrearIncidencia();
                break;
        }
    }

    function fail(error) {       
        fotosetID = -10;
        CrearIncidencia();
    }
    //**** FIN UPLOAD FOTOS TO SERVER *********************

    function CrearUsuarioMovil()
    {
        //LA TABLA SE CREA AQUI!
        //OBTIENE UUID
        //alert('CREANDO USUARIO MOVIL...');
        telID = device.uuid;
        //alert('UUID= ' + telID);

        //ENVIA REQUEST CREARUSUARIO A LA WEBAPI
        nlegajo1 = $('#svpNumLegajo').val();
        //alert('LEGAJO= ' + nlegajo1);
        pass1 = $('#svpContasenia').val();
        //alert('PASSWORD= ' + pass1);

        //WEB API OBTIENE EL NLEGAJO Y EL UUID
        //Y DETERMINA SI EXISTE O NO EL LEGAJO, EN LA BASE DE RRHH.
        //SI EXISTE, DETERMINA EN LA TABLA UsuarioSVPMobile SI YA SE REGISTRO EN OTRO DISPOSITIVO MOVIL
        $.ajax({
            type: "GET",
            url: "http://movil.demo.com.ar:9911/user/CrearUsuarioMovil",
            xhrFields: { withCredentials: true },
            crossDomain: true,
            //beforeSend: function () { $.mobile.showPageLoadingMsg(); },
            //complete: function () { $.mobile.hidePageLoadingMsg(); },
            data: {
                //int nlegajo,
                //string pass,
                //string phoneUUID
                nlegajo: nlegajo1,
                pass: pass1,
                phoneUUID: telID
            },
            dataType: 'json',
            success: function (response) {
                //alert('RESPONSE PURO:' + response);
                //ERROR: INCLUIDO DENTRO DEL VALOR NUEVOUSUARIOID DE RESPUESTA, COMO VALORES NEGATIVO
                //MODIFICAR POR, LEGAJO NO AUTORIZADO.
                //PERMITIENDO QUE UN LEGAJO REGISTRADO Y ACTIVO("A"), PUEDA DESINSTALAR SU APLICACION
                //Y VOLVER A INSTALARLA


                if (response == -3)
                {
                    //*************************************
                    //REINSTALL SUCCESS - MISMO TELEFONO
                    //RETORNA CODIGO REINSTALACION EN EL MISMO TELEFONO
                    //$("#RegUsuarioProgressBar-page").hide();
                    //$("#ReinsMismoTelefono-page").show();
                    ////document.getElementById("txtErrorLegajo").innerHTML = "Legajo ya registrado.";
                    //$.mobile.changePage("#ReinsMismoTelefono-page");

                    db.transaction(function (tx) {
                        tx.executeSql('CREATE TABLE IF NOT EXISTS DemoTable (name, password, phoneUUID)');
                        tx.executeSql('INSERT INTO DemoTable VALUES (?, ?, ?)', [nlegajo1, pass1, telID]);
                    }, function (error) {
                        //alert('ERROR DISPOSITIVO LOCAL');
                        $("#RegUsuarioProgressBar-page").hide();
                        $("#ErrorLocal-page").show();
                        document.getElementById("txtErrorLocal").innerHTML = "Error al escibir Base de Datos Local.";
                        $.mobile.changePage("#ErrorLocal-page");
                    }, function () {
                        //alert('Populated database OK');
                        //alert('DATOS LOCALES OK');
                        $("#RegUsuarioProgressBar-page").hide();
                        $("#ExitoInstMismoTelefono-page").show();
                        $.mobile.changePage("#ExitoInstMismoTelefono-page");
                    });



                }
                else
                {
                    if (response == -1)
                    {
                        //alert('error no existe');
                        //FAIL1: NLEGAJO NO EXISTE EN RRHH - "VERIFIQUE LOS DATOS INGRESADOS: LEGAJO NO EXISTE."
                        $("#RegUsuarioProgressBar-page").hide();
                        $("#LegajoError-page").show();
                        document.getElementById("txtErrorLegajo").innerHTML = "Verifique los datos ingresados: Legajo no existe.";
                        $.mobile.changePage("#LegajoError-page");
                    }
                    else
                    {

                        if (response == -2)
                        {
                            //RETORNA CODIGO ESTADO DESCONOCIDO, DE USUARIO MOVIL EXISTENTE
                            //SI NO ES "A" NI "L",
                            //"LEGAJO EXISTENTE NO AUTORIZADO"
                            //nuevousermovilID = -2;
                            $("#RegUsuarioProgressBar-page").hide();
                            $("#LegajoError-page").show();
                            document.getElementById("txtErrorLegajo").innerHTML = "Legajo registrado, no autorizado.";
                            $.mobile.changePage("#LegajoError-page");

                        }
                        else
                        {
                           
                            if (response == -4)
                            {
                                //RETORNA CODIGO REINSTALACION EN NUEVO TELEFONO
                                //nuevousermovilID = -4;
                                $("#RegUsuarioProgressBar-page").hide();
                                $("#ReinsNuevoTelefono-page").show();                            
                                $.mobile.changePage("#ReinsNuevoTelefono-page");
                            }
                            else
                            {
                                if (response > 0)
                                {
                                    //alert('nuevo usuario!');
                                    //SUCCESS: NLEGAJO EXISTE Y NUNCA UTILIZO LA APLICACION EN OTRO EQUIPO.
                                    //    "USUARIO REGISTRADO CON EXITO EN BASE DE DATOS demo". 
                                    //EN CASO DE HABERSE REGISTRADO CON EXITO EN LA BASE DE DATOS demo:
                                    //ALMACENO USUARIO, PASSWORD Y ID DEL TELEFONO, EN LA DBLOCAL DEL TELEFONO.
                                    db.transaction(function (tx) {
                                        tx.executeSql('CREATE TABLE IF NOT EXISTS DemoTable (name, password, phoneUUID)');
                                        tx.executeSql('INSERT INTO DemoTable VALUES (?, ?, ?)', [nlegajo1, pass1, telID]);
                                    }, function (error) {
                                        //alert('ERROR DISPOSITIVO LOCAL');
                                        $("#RegUsuarioProgressBar-page").hide();
                                        $("#ErrorLocal-page").show();
                                        document.getElementById("txtErrorLocal").innerHTML = "Error al escibir Base de Datos Local.";
                                        $.mobile.changePage("#ErrorLocal-page");
                                    }, function () {
                                        //alert('Populated database OK');
                                        //alert('DATOS LOCALES OK');
                                        $("#RegUsuarioProgressBar-page").hide();
                                        $("#Bienvenida-page").show();
                                        $.mobile.changePage("#Bienvenida-page");
                                    });
                                }
                            }
                        }
                    }
                }

            },
            error: function (xhr, status, error) {
                //REDIRIGE A PAGINA DE ERROR AL CREAR USUARIO MOVIL
                //ErrorLocal-page   
                //alert('ERROR COMUNICACION CON SERVIDOR');
                $("#RegUsuarioProgressBar-page").hide();
                $("#ErrorLocal-page").show();
                document.getElementById("txtErrorLocal").innerHTML = "Error al procesar su solicitud de registracion.";
                $.mobile.changePage("#ErrorLocal-page");
            }
        });
    }

    function CambiarContrasenia() {
        //alert('CAMBIO PASS!');
        //VERIFICO LEGAJO INGRESADO COINCIDE CON ALMACENADO
        verifnleg1 = $('#txtVerificaLegajo').val();
        //alert('LEGAJO VERIF POR USER: ' + verifnleg1);
        txtNuevoPass1 = $('#txtNuevoPass').val();
        //alert('PASS NUEVO POR USER: ' + txtNuevoPass1);
        //OBTENGO LEGAJO ALMACENADO EN DB
        //getLegajoRegistrado(verifnleg1);
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM DemoTable', [], function (tx, rs) {
                var allrow = rs.rows.item(0);
                //alert(allrow);

                legajoalmacenado = rs.rows.item(0).name;
                //alert('LEGSTORED: ' + rs.rows.item(0).name);
                passalmacenada = rs.rows.item(0).password;
                //alert('PASSSTORED: ' + rs.rows.item(0).password);
                phoneIDalmacenado = rs.rows.item(0).phoneUUID;
                //alert('PHONEID: ' + rs.rows.item(0).phoneUUID);

                if (legajoalmacenado == verifnleg1) {
                    //ACTUALIZO A LA NUEVA CONTRASENIA INGRESADA.
                    //ACTUALIZO NUEVA PASS EN DB LOCAL
                    //ACTUALIZO NUEVA PASS EN USUARIOSVPMOBILE DB FISICA
                    //ActualizarNuevaPass(verifnleg1, txtNuevoPass1);
                    //alert('ACTUALIZANDO PASSWORD EN LOCAL DB...');
                    //error-msgNuevaPass
                    $("#error-msgNuevaPass").show();
                    document.getElementById("error-msgNuevaPass").innerHTML = "Actualizando contrasenia....";

                    db.transaction(function (tx) {
                        //tx.executeSql('INSERT INTO DemoTable VALUES (?, ?, ?)', ['Alice', '1234', 'xrk789']);
                        tx.executeSql('UPDATE DemoTable SET password = ? WHERE name = ?', [txtNuevoPass1, legajoalmacenado], function (tx, rs) {
                            //var allrow = rs.rows.item(0);
                            //alert('TRANSACCION EN PROGRESO...');
                            //alert("insertId: " + res.insertId);
                            //alert("rowsAffected: " + rs.rowsAffected);
                            //alert('UPDATE ok');
                            //SI ESTOY ONLINE, ACTUALIZO LA CONTRASENIA EN LA TABLA USUARIOSVPMOBILE
                            //ActualizoNuevaPassDBFisica();    
                            $("#error-msgNuevaPass").hide();

                            $("#OlvidoPass-page").hide();
                            $("#NuevaPassConfirm-page").show();
                            $.mobile.changePage("#NuevaPassConfirm-page");

                        }, function (tx, error) {
                            //alert('SELECT error: ' + error.message);
                            //alert('UPDATE TX error: ' + error.message);

                            $("#OlvidoPass-page").hide();
                            $("#ErrorLocal-page").show();
                            //
                            document.getElementById("txtErrorLocal").innerHTML = "Error al actualizar su contrasenia.";

                            $.mobile.changePage("#ErrorLocal-page");
                        });
                    });
                }
                else {
                    //SI ES ERRONEO EL LEGAJO, NO HABILITA LOS TEXTBOX PARA LA NUEVA PASS
                    //Y PIDE VERIFICAR LEGAJO INGRESADO
                    //FIELD VALIDATION, REVISE EL LEGAJO INGRESADO.
                    //
                    //$("#error-msgNuevaPass").show();
                    //document.getElementById("error-msgNuevaPass").innerHTML = "Legajo incorrecto. Revise los datos ingresados.";
                    navigator.notification.alert(
                        'Legajo incorrecto.',  // message
                        alertDismissed,         // callback
                        'Revise los datos ingresados.',            // title
                        'Corregir'                  // buttonName
                     );
                }

            }, function (tx, error) {
                //ErrorLocal-page               
                $("#OlvidoPass-page").hide();
                $("#ErrorLocal-page").show();
                document.getElementById("txtErrorLocal").innerHTML = "Error al obtener datos desde Base local.";
                $.mobile.changePage("#ErrorLocal-page");
            });
        });
    }

    function ConfigurarNuevoTelefono() {
        //LA TABLA SE CREA AQUI!
        //OBTIENE UUID
        //alert('CONFIGURANDO NUEVO TELEFONO...');
        //alert('VAR nlegajo1: ' + nlegajo1);
        //alert('VAR pass1: ' + pass1);
        //alert('VAR telID: ' + telID);
         telID = device.uuid;
          //alert('UUID NUEVO TEL: ' + telID);

        //ENVIA REQUEST CREARUSUARIO A LA WEBAPI
        //nlegajo1 = $('#svpNumLegajo').val();
        //alert('LEGAJO= ' + nlegajo1);
        //pass1 = $('#svpContasenia').val();
        //alert('PASSWORD= ' + pass1);

        //WEB API OBTIENE EL NLEGAJO Y EL UUID
        //Y DETERMINA SI EXISTE O NO EL LEGAJO, EN LA BASE DE RRHH.
        //SI EXISTE, DETERMINA EN LA TABLA UsuarioSVPMobile SI YA SE REGISTRO EN OTRO DISPOSITIVO MOVIL
        $.ajax({
            type: "GET",
            url: "http://movil.demo.com.ar:9911/user/ConfigurarNuevoMovil",
            xhrFields: { withCredentials: true },
            crossDomain: true,
            //beforeSend: function () { $.mobile.showPageLoadingMsg(); },
            //complete: function () { $.mobile.hidePageLoadingMsg(); },
            data: {
                //int nlegajo,
                //string pass,
                //string phoneUUID
                nlegajo: nlegajo1,
                pass: pass1,
                phoneUUID: telID
            },
            dataType: 'json',
            success: function (response) {
                //alert('RESPONSE PURO:' + response);
                //ERROR: INCLUIDO DENTRO DEL VALOR NUEVOUSUARIOID DE RESPUESTA, COMO VALORES NEGATIVO
                //MODIFICAR POR, LEGAJO NO AUTORIZADO.
                //PERMITIENDO QUE UN LEGAJO REGISTRADO Y ACTIVO("A"), PUEDA DESINSTALAR SU APLICACION
                //Y VOLVER A INSTALARLA


                if (response == -11) {
                    //ERROR LEGAJO NO AUTORIZADO PARA CONFIGURAR UN NUEVO TELEFONO(NULL)      
                    $("#RegUsuarioProgressBar-page").hide();
                    $("#LegajoError-page").show();
                    document.getElementById("txtErrorLegajo").innerHTML = "Legajo no autorizado para configurar un nuevo telefono.";
                    $.mobile.changePage("#LegajoError-page");

                }
                else {
                    if (response == -12) {
                        //ERROR, INTENTA CONFIGURAR NUEVO TELEFONO EN UN TELEFONO YA REGISTRADO
                        $("#RegUsuarioProgressBar-page").hide();
                        $("#LegajoError-page").show();
                        document.getElementById("txtErrorLegajo").innerHTML = "Intenta configurar nuevo telefono en un telefono ya registrado.";
                        $.mobile.changePage("#LegajoError-page");
                    }
                    else {

                        if (response == -13) {
                            //SI NO ES "A" NI "L", EL SERVICIO IGNORA LA PETICION
                            //INFORMA ERROR, "ERROR AL CONFIGURAR NUEVO TELEFONO"
                            $("#RegUsuarioProgressBar-page").hide();
                            $("#LegajoError-page").show();
                            document.getElementById("txtErrorLegajo").innerHTML = "Legajo con estado desconocido, no autorizado.";
                            $.mobile.changePage("#LegajoError-page");

                        }
                        else {

                            if (response == -14) {
                                //NO EXISTE EL USUARIO EN DBdemo RRHH
                                //NO AUTORIZADO PARA ACTUALIZAR EL NUEVO TELEFONO
                                $("#RegUsuarioProgressBar-page").hide();
                                $("#LegajoError-page").show();
                                document.getElementById("txtErrorLegajo").innerHTML = "Legajo inexistente, no autorizado.";
                                $.mobile.changePage("#LegajoError-page");
                            }
                            else {
                                if (response == 10) {
                                    //alert('CREANDO BASE DE DATOS LOCAL, EN NUEVO TELEFONO.');
                                    //alert('nuevo telefono!');
                                    //SUCCESS: NLEGAJO EXISTE Y UTILIZA LA APLICACION EN NUEVO TELEFONO.
                                    //    "NUEVO TELEFONO REGISTRADO CON EXITO EN BASE DE DATOS demo".
                                    //ALMACENO USUARIO, PASSWORD Y ID DEL NUEVO TELEFONO, EN LA DBLOCAL DEL TELEFONO.
                                    //alert('VAR nlegajo1: ' + nlegajo1);
                                    //alert('VAR pass1: ' + pass1);
                                    //alert('UUID NUEVO TEL: ' + telID);

                                    db.transaction(function (tx) {
                                        tx.executeSql('CREATE TABLE IF NOT EXISTS DemoTable (name, password, phoneUUID)');
                                        tx.executeSql('INSERT INTO DemoTable VALUES (?, ?, ?)', [nlegajo1, pass1, telID]);
                                    }, function (error) {
                                        //alert('ERROR DISPOSITIVO LOCAL');
                                        $("#RegUsuarioProgressBar-page").hide();
                                        $("#ErrorLocal-page").show();
                                        document.getElementById("txtErrorLocal").innerHTML = "Error al escibir Base de Datos Local.";
                                        $.mobile.changePage("#ErrorLocal-page");
                                    }, function () {
                                        //alert('Populated database OK');
                                        //alert('DATOS LOCALES OK');
                                        $("#RegUsuarioProgressBar-page").hide();
                                        $("#ExitoInstNuevoTelefono-page").show();
                                        $.mobile.changePage("#ExitoInstNuevoTelefono-page");
                                    });
                                }
                            }
                        }
                    }
                }

            },
            error: function (xhr, status, error) {
                //REDIRIGE A PAGINA DE ERROR AL CREAR USUARIO MOVIL
                //ErrorLocal-page   
                //alert('ERROR COMUNICACION CON SERVIDOR');
                $("#RegUsuarioProgressBar-page").hide();
                $("#ErrorLocal-page").show();
                document.getElementById("txtErrorLocal").innerHTML = "Error al procesar su solicitud de registracion.";
                $.mobile.changePage("#ErrorLocal-page");
            }
        });
    }

    function Ingresar() {
        //alert('INGRESAR');
        //VERIFICA QUE PASS INGRESADA COINCIDE CON ALMACENADA LOCAL
        var passlogintry = $('#svpContaseniaLogin').val();
        //alert('PASS INGRESADA: ' + passlogintry);


        //alert('LOCALDATA');
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM DemoTable', [], function (tx, rs) {
                var allrow = rs.rows.item(0);
                //alert(allrow);

                //***** NUEVO, VERIFICO SI LEGAJO ESTA AUTORIZADO PARA USAR LA APP
                legajoalmacenado = rs.rows.item(0).name;
                //alert('LEGSTORED: ' + rs.rows.item(0).name);

                //passalmacenada = rs.rows.item(0).password;
                //alert('PASSSTORED: ' + rs.rows.item(0).password);
                //phoneIDalmacenado = rs.rows.item(0).phoneUUID;
                //alert('PHONEID: ' + rs.rows.item(0).phoneUUID);
                if (passlogintry == rs.rows.item(0).password) {

                    //NUEVA VERIFICACION, USUARIO BLOQUEADO O INHABILITADO,
                    //NO USA LA APLICACION, NO PUEDE LOGUEARSE.
                    //MOSTRAR ERROR APROPIADO
                    $.ajax({
                        type: "GET",
                        url: "http://movil.demo.com.ar:9911/user/LoginUserSVPMovil",
                        xhrFields: { withCredentials: true },
                        crossDomain: true,
                        //beforeSend: function () { $.mobile.showPageLoadingMsg(); },
                        //complete: function () { $.mobile.hidePageLoadingMsg(); },
                        data: {
                            nlegajo: legajoalmacenado
                        },
                        dataType: 'json',
                        success: function (response) {
                            //alert('RESPONSE LOGIN PURO: ' + response);
                            //ERROR: INCLUIDO DENTRO DEL VALOR LOGINSTATUS, COMO VALORES NEGATIVOS
                            //ERROR -50: BLOQUEADO
                            //ERROR -55: INHABILITADO
                            //ERROR -60: ESTADO DE USUARIO DESCONOCIDO.
                            if (response == -50) {
                                //estadolegajologin = -50;
                                $("#Bienvenida-page").hide();
                                $("#ErrorLocal-page").show();
                                document.getElementById("txtErrorLocal").innerHTML = "Numero de legajo no autorizado.";
                                $.mobile.changePage("#ErrorLocal-page");
                            }
                            else {
                                //alert('NO ES -50');
                                if (response == -55) {
                                    //estadolegajologin = -55;
                                    $("#Bienvenida-page").hide();
                                    $("#ErrorLocal-page").show();
                                    document.getElementById("txtErrorLocal").innerHTML = "Numero de legajo inhabilitado.";
                                    $.mobile.changePage("#ErrorLocal-page");
                                }
                                else {
                                    //alert('NO ES -55');
                                    if (response == 10) {
                                        //SUCCESS: USUARIO AUTORIZADO EN SU ESTADO "A"
                                        //estadolegajologin = 10;
                                        //AUTORIZA EL INGRESO Y ENVIA A LA PAGINA DE TOMAR FOTOS Y COMPLETAR DETALLES
                                        //Foto - page
                                        $("#Bienvenida-page").hide();
                                        //$("#GPSReminder-page").show();
                                        //$.mobile.changePage("#GPSReminder-page");
                                        $("#Foto-page").show();
                                        $.mobile.changePage("#Foto-page");
                                    }
                                    else {
                                        //alert('NO ES 10');
                                        //estadolegajologin = -60;
                                        $("#Bienvenida-page").hide();
                                        $("#ErrorLocal-page").show();
                                        document.getElementById("txtErrorLocal").innerHTML = "Numero de legajo con situacion desconocida.";
                                        $.mobile.changePage("#ErrorLocal-page");
                                    }
                                }
                            }
                        },
                        error: function (xhr, status, error) {
                            //REDIRIGE A PAGINA DE ERROR AL LOGUEAR AL USUARIO
                            $("#Bienvenida-page").hide();
                            $("#ErrorLocal-page").show();
                            document.getElementById("txtErrorLocal").innerHTML = "Error al verificar su numero de legajo.";
                            $.mobile.changePage("#ErrorLocal-page");
                        }
                    });
                    //***** FIN NUEVO, VERIFICO SI LEGAJO ESTA AUTORIZADO PARA USAR LA APP

                }
                else {
                    //DENIEGA EL ACCESO Y PIDE VERIFICAR LA CONTRASENIA
                    //alert('VERIFIQUE PASS INGRESADA');
                    navigator.notification.alert(
                        'Contrasenia incorrecta.',  // message
                        alertDismissed,         // callback
                        'Revise los datos ingresados.',            // title
                        'Corregir'                  // buttonName
                     );
                }

            }, function (tx, error) {
                //alert('SELECT error: ' + error.message);
                $("#Bienvenida-page").hide();
                $("#ErrorLocal-page").show();
                document.getElementById("txtErrorLocal").innerHTML = "Error en Datos Locales.";
                $.mobile.changePage("#ErrorLocal-page");

            });
        });
    }



    function onRequestSuccess(success) {
       
        isGPSActivado = true;
        $("#GPS-page").hide();
        $("#msgUbicacionProgressBar").show();
        $("#Domicilio-page").show();
        $.mobile.changePage("#Domicilio-page");

        navigator.geolocation.getCurrentPosition(onGetPositionSuccess, onGetPositionError, { enableHighAccuracy: true });

        //10072017
        //$("#GPS-page").hide();
        //$("#msgUbicacionProgressBar").show();
        //$("#Domicilio-page").show();       
        //$.mobile.changePage("#Domicilio-page");
    }






    function onRequestFailure(error) {        
     
        if (error.code === 4) {
            //USUARIO RECHAZO QUE LA APP ACTIVE AUTOMATICAMENTE LA GEOLOCALIZACION DE PRECISION.
            //BRINDA AL USUARIO LA POSIBILIDAD DE ACTIVARLA MANUALMENTE.
            if (window.confirm("Fallo al activar Geolocalizacion de precision automatica. Desea activarla manualmente?"))
            {
                //EL USUARIO DECIDE ACTIVAR MANUALMENTE EL GPS, CON ALTA PRECISION(SINO, DARA ERROR).
                cordova.plugins.diagnostic.switchToLocationSettings();

                //VERIFICO SI GPS CON ALTA PRECISION ESTA ACTIVADO.
                cordova.plugins.diagnostic.isGpsLocationEnabled(function (enabled) {
                  
                    isGPSActivado = enabled;                 

                    if (isGPSActivado) {
                        //SI ESTA ACTIVADO, GUARDAR COORDENADAS GPS EN VARIABLES LAT,LONG
                        // Y NO MOSTRAR CAMPOS DE CALLE,ALTURA,ETC:
                        // MOSTRAR SOLO BOTON ENVIAR Y SALIR.  


                        $("#GPS-page").hide();
                        $("#msgUbicacionProgressBar").show();
                        $("#Domicilio-page").show();
                        $.mobile.changePage("#Domicilio-page");

                        navigator.geolocation.getCurrentPosition(onGetPositionSuccess, onGetPositionError, { enableHighAccuracy: true });
                        //GPS INTENTA OBTENER DATOS DEL DOMICILIO INCIDENCIA Y LOS MUESTRA.

                        //10072017
                        //$("#GPS-page").hide();
                        //$("#msgUbicacionProgressBar").show();
                        //$("#Domicilio-page").show();
                        //$.mobile.changePage("#Domicilio-page");                                        
                    }
                    else {
                        //SI NO ESTA ACTIVADO, HABILITAR CARGA MANUAL DE DOMICILIO.
                        $("#GPS-page").hide();
                        $("#pnlDomicilio").show();
                        $("#Domicilio-page").show();
                        $.mobile.changePage("#Domicilio-page");
                        $('#btnFotoYEnviar').removeClass('ui-state-disabled');

                        //10072017
                        //$("#GPS-page").show();                     
                        //$.mobile.changePage("#GPS-page");
                    }

                }, function (error) {
                    //alert('Ocurrio un error con el GPS: ' + error + '. Asegurese de tener activada la localizacion de alta precision, si su dispositivo posee esa caracteristica.');
                    isGPSActivado = false;
                    //EL USUARIO ELIGE NO USAR GPS Y CARGAR DATOS EN FORMA MANUAL.
                    $("#GPS-page").hide();
                    $("#pnlDomicilio").show();
                    $("#Domicilio-page").show();
                    $.mobile.changePage("#Domicilio-page");
                    $('#btnFotoYEnviar').removeClass('ui-state-disabled');

                });
            }
            else
            {
                //alert('USUARIO NO Desea activar LOCALIZACION DE ALTA PRECISION, manualmente');
                isGPSActivado = false;
                //EL USUARIO ELIGE CARGAR DOMICILIO  EN FORMA MANUAL.
                $("#GPS-page").hide();
                $("#pnlDomicilio").show();
                $("#Domicilio-page").show();                
                $.mobile.changePage("#Domicilio-page");
                $('#btnFotoYEnviar').removeClass('ui-state-disabled');
            }
        }
        else
        {
            //SE PRODUJO UN CODIGO DE ERROR NO RELACIONADO
            //CON LA LOCALIZACION DE ALTA PRECISION
            //SE HABILITA CARGA MANUAL DOMICILIO
            isGPSActivado = false;
            $("#GPS-page").hide();
            $("#pnlDomicilio").show();
            $("#Domicilio-page").show();            
            $.mobile.changePage("#Domicilio-page");
            $('#btnFotoYEnviar').removeClass('ui-state-disabled');
        }
    }





    function onGetPositionSuccess(position) {
        //GUARDA EN LAS VARIABLES GPSLAT, GPSLONG      
        GPSLat = position.coords.latitude;
        //alert('GPS LAT: ' + GPSLat);
        GPSLong = position.coords.longitude;
        //alert('GPS LONG: ' + GPSLong);
    

        $.ajax({
            type: "GET",
            url: "https://maps.googleapis.com/maps/api/geocode/json?latlng="+GPSLat+","+GPSLong+"&key=AIzaSyALpZad1nJlBZA_mIImg3_t1l3Ic-rDG4M",
       
            dataType: "json",
            success: function (json) {

                //alert("Calle, altura y localidad: " + json.results[0].formatted_address);

                if (json.results[1]) {
                    //GOOGLE ENCONTRO DATOS PARA LA UBICACION LAT LON SUMINISTRADA
                    //Y LOS ESTA PROCESANDO PARA MOSTRARLOS.
                                var i = 0
                                var calle = '';
                                var altura = '';
                                var localidad = '';
                            
                                for (i = 0; i < json.results[0].address_components.length; i++) {
                                
                                    if (json.results[0].address_components[i].types[0] === "route") {
                                        //this is the object you are looking for
                                        calle = json.results[0].address_components[i];
                                    }
                                    if (json.results[0].address_components[i].types[0] === "street_number") {
                                        //this is the object you are looking for
                                        altura = json.results[0].address_components[i];
                                    }
                                    if (json.results[0].address_components[i].types[0] === "administrative_area_level_2") {
                                        //this is the object you are looking for
                                        localidad = json.results[0].address_components[i];
                                    }
                                }

                                var today = new Date();
                                var dd = today.getDate();
                                var mm = today.getMonth() + 1; //January is 0!
                                var yyyy = today.getFullYear();

                                if (dd < 10) {
                                    dd = '0' + dd
                                }

                                if (mm < 10) {
                                    mm = '0' + mm
                                }

                                today = dd + '/' + mm + '/' + yyyy;
                                document.getElementById("hCurrentDate").innerHTML ='Fecha de la incidencia: ' + today;

                                var muestracantfotos = 0;
                                if (!cuatrofotos)
                                {
                                    muestracantfotos = contadorFotos - 1;
                                    document.getElementById("hEnvioNFotos").innerHTML = 'Se enviaran ' + muestracantfotos + ' fotos.';
                                }
                                else
                                {
                                    document.getElementById("hEnvioNFotos").innerHTML = 'Se enviaran 4 fotos.';
                                }

                                var textIncidDescipcion = document.getElementById("svpDetIncidente").value;
                                document.getElementById("hDescripcion").innerHTML = 'Descripcion del incidente: ' + textIncidDescipcion;

                                calle1 = calle.long_name;
                                altura1 = altura.long_name;
                                localidad1 = localidad.long_name;
                                document.getElementById("hCalle").innerHTML = 'Calle: ' + calle1;
                                document.getElementById("hAltura").innerHTML = 'Altura: ' + altura1;
                                document.getElementById("hLocalidad").innerHTML = 'Localidad: ' + localidad1;
                              //SETEO HTML DOMICILIO PAGE                      

                              //alert(calle.long_name + " || " + altura.long_name + " || " + localidad.long_name);
                                $("#msgUbicacionProgressBar").hide();
                                $("#pnlGPS").show();
                                $('#btnFotoYEnviar').removeClass('ui-state-disabled');
                            }
                            else
                            {
                              //GOOGLE NO ENCONTRO UBICACION PARA LAS COORDENADAS LAT LON SUMINISTRADAS.

                              //alert("No results found");

                              //SE HABILITA CARGA MANUAL DE DOMICILIO
                              $("#msgUbicacionProgressBar").hide();
                              $("#pnlDomicilio").show();
                              $('#btnFotoYEnviar').removeClass('ui-state-disabled');


                              //10072017
                              //$("#Domicilio-page").show();                    
                              //$.mobile.changePage("#Domicilio-page");
                      
                            }
                 },
            error: function (xhr, status, error) {
                //OCURRIO UN ERROR DE AJAX, EN LA COMUNICACION CON EL SERVICIO
                //DE GEOCODIFICACION DE GOOGLE

                //alert('Error al procesar direccion.');

                //SE HABILITA CARGA MANUAL DE DOMICILIO
                $("#msgUbicacionProgressBar").hide();
                $("#pnlDomicilio").show();
                $('#btnFotoYEnviar').removeClass('ui-state-disabled');

                //10072017
                //$("#Domicilio-page").show();
                //$.mobile.changePage("#Domicilio-page");
             }
           }); 
    };

    function onGetPositionError(error) {
        //alert('NO OBTIENE DIRECCION');
        //alert('Error al obtener direccion: ' + error.code + '. Detalle: ' + error.message);

        //SI SE PRODUCE ERROR AL OBTENER DIRECCION, HABILITAR CARGA DE DOMICILIO MANUAL
        $("#msgUbicacionProgressBar").hide();
        $("#pnlDomicilio").show();
        $('#btnFotoYEnviar').removeClass('ui-state-disabled');

        //10072017
        //$("#Domicilio-page").show();
        //$.mobile.changePage("#Domicilio-page");

    }

    function alertDismissed() {
        // do something
    }

    function ValidaCamposRegistracion()
    {

        //OCULTAR PAGINA REGISTRACION
        //MOSTRAR PAGINA POR FAVOR ESPERE, REGISTRANDO...
        //alert('registrando...');
        //$("#Registrar-page").hide();
        //$("#RegUsuarioProgressBar-page").show();
        //$.mobile.changePage("#RegUsuarioProgressBar-page");


        var strinvalidfields = '';

        //VERIFICA NOMBRE
         var nombreVal = document.getElementById('svpNombre').value;
         if (!nombreVal.match(/\S/)) {
             //alert ('Empty value is not allowed');
             nombreHasValidValue = false;
             strinvalidfields = strinvalidfields + 'Ingrese un Nombre valido. \n\r';
        } else {
             nombreHasValidValue = true;
        }

        //VERIFICA APELLIDO
         var apellidoVal = document.getElementById('svpSurname').value;
         if (!apellidoVal.match(/\S/)) {
             //alert ('Empty value is not allowed');
             surnameHasValidValue = false;
             strinvalidfields = strinvalidfields + 'Ingrese un Apellido valido. \n\r';
            
         } else {
             surnameHasValidValue = true;
         }

        //VERIFICA LEGAJO
         var legajoVal = document.getElementById('svpNumLegajo').value;
         if (!legajoVal.match(/\S/)) {
             //alert ('Empty value is not allowed');
             legajoHasValidValue = false;
             strinvalidfields = strinvalidfields + 'Ingrese un Legajo valido. \n\r';
        
         } else {
             legajoHasValidValue = true;
         }

        //VERIFICA CONTRASEnA
         var contaseniaVal = document.getElementById('svpContasenia').value;
         if (!contaseniaVal.match(/\S/)) {
             //alert ('Empty value is not allowed');
             contaseniaHasValidValue = false;
             strinvalidfields = strinvalidfields + 'Ingrese una Contrasenia valida. \n\r';

         } else {
             contaseniaHasValidValue = true;
         }

         if (nombreHasValidValue && nombreHasValidValue && surnameHasValidValue && legajoHasValidValue && contaseniaHasValidValue)
         {
             //******* VERSION GPSFULL-BORRAR CUANDO ANDE BIEN ESTA VERSION ****************
             ////alert('TODOS LOS CAMPOS SON VALIDOS!');
             ////EN ESTA VERSION, SOLO PERMITIRLE IR A FOTOPAGE.
             //$("#Registrar-page").hide();       
             //$("#Foto-page").show();         
             //$.mobile.changePage("#Foto-page");
             ////REGISTRAR AL USUARIO! CREAR LOCAL DB, CREAR USUARIO EN DB, 
             ////PERMITIRLE CAMBIO DE PASSWORD Y ALMACENAR SU USUARIO PARA QUE NO
             ////TENGA QUE INGRESARLO LA PROXIMA VEZ, INGRESANDO SOLO PASSWORD.
             //******* VERSION GPSFULL-BORRAR CUANDO ANDE BIEN ESTA VERSION ****************


             //alert('TODOS LOS CAMPOS SON VALIDOS!');
             //EN ESTE PRIMER MERGE, PROCEDE A REGISTRAR AL USUARIO EN LA DBLOCAL
             //DE SU TELEFONO Y LUEGO A REGISTRARLO EN LA DBdemo(TABALUSERMOVIL).
             //PERMITIRLE CAMBIO DE PASSWORD Y ALMACENAR SU USUARIO PARA QUE NO
             //TENGA QUE INGRESARLO LA PROXIMA VEZ, INGRESANDO SOLO PASSWORD.

             $("#Registrar-page").hide();
             $("#RegUsuarioProgressBar-page").show();
             $.mobile.changePage("#RegUsuarioProgressBar-page");
             //$("#Foto-page").show();         
             //$.mobile.changePage("#Foto-page");
             CrearUsuarioMovil();
         }
         else
         {
              navigator.notification.alert(
                strinvalidfields,// message
                alertDismissed,// callback
                'Revise los datos ingresados.',// title
                'Corregir'// buttonName
             );
         }
        
    }

    function ValidaCamposDomicilio() {


        var strinvalidfieldsaddress = '';

        //VERIFICA CALLE
        var calleVal = document.getElementById('svpUbCalle').value;
        if (!calleVal.match(/\S/)) {
            calleHasValidValue = false;
            strinvalidfieldsaddress = strinvalidfieldsaddress + 'Ingrese una Calle valida. \n\r';
        } else {
            calleHasValidValue = true;
        }

        //VERIFICA ALTURA
        var alturaVal = document.getElementById('svpUbAltura').value;
        if (!alturaVal.match(/\S/)) {
            alturaHasValidValue = false;
            strinvalidfieldsaddress = strinvalidfieldsaddress + 'Ingrese una Altura valida. \n\r';
        } else {
            alturaHasValidValue = true;
        }

        //VERIFICA LOCALIDAD
        var localidadVal = document.getElementById('svpUbLocalidad').value;
        if (!localidadVal.match(/\S/)) {
            localidadHasValidValue = false;
            strinvalidfieldsaddress = strinvalidfieldsaddress + 'Ingrese una Localidad valida. \n\r';
        } else {
            localidadHasValidValue = true;
        }

        if (calleHasValidValue && alturaHasValidValue && localidadHasValidValue) {
        
            //GUARDAR EN VARIABLES CALLE ALTURA Y LOCALIDAD Y CONTINUAR
            //ESTO LO HACE EN LA FUNCION CrearIncidencia()
            domiciliomanualvalido = true;
        }
        else {
            domiciliomanualvalido = false;
            navigator.notification.alert(
              strinvalidfieldsaddress,// message
              alertDismissed,// callback
              'Revise los datos ingresados.',// title
              'Corregir'// buttonName
           );
        }

    }

    //************** VERSION MERGE REGISTRACION->GPSFULL ******************************************
    function CrearIncidencia() {
        //ft.upload(imageURI, encodeURI("http://movil.demo.com.ar:9911/user/PostUserImage"), win, fail, options);
        //COMPLETAR PARAMETROS A ENVIAR:

        //******** DATOS DESDE DB LOCAL ****************
        //MODIFICAR DBLOCAL PARA QUE ALMACENE OBS MOBILE?

        //PROBAR SI SERA NECESARIO ADEMAS, ALMACENAR CALLE,ALTURA,LOCALIDAD
        //Y FOTOSETID

        //MODIFICAR PARAMETROS PARA QUE VENGAN DE LA DBLOCAL:
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM DemoTable', [], function (tx, rs) {
                var allrow = rs.rows.item(0);

                nlegajo1 = rs.rows.item(0).name;
                pass1 = rs.rows.item(0).password;

                //********** DATOS GPS ***************
                //ESTA VERSION TRAE ESTOS DATOS DE LA DBLOCAL

                obsmobile1 = $('#svpDetIncidente').val();

                if (!isGPSActivado) {
                    //GPS NO SELECCIONADO, TOMA DATOS DESDE CARGA MANUAL
                    //alert('CARGA SIN GPS');
                    calle1 = $('#svpUbCalle').val();
                    altura1 = $('#svpUbAltura').val();
                    localidad1 = $('#svpUbLocalidad').val();
                    GPSLat = 0;
                    GPSLong = 0;
                }
                else {
                    //GPS ACTIVADO, TOMO LAT Y LONG Y LOS ENVIO CON LA INCIDENCIA:
                    //VERIFICO SI YA GUARDE LAS COORDENADAS PREVIAMENTE
                    //alert('CARGA CON GPS');
                    //GPSLat = position.coords.latitude;
                    //alert('GPS LAT: ' + GPSLat);
                    //GPSLong = position.coords.longitude;
                    //alert('GPS LONG: ' + GPSLong);

                }


                //********** FIN DATOS GPS ***************


                //********** ENVIO POR AJAX *************
                $.ajax({
                    type: "GET",
                    url: "http://movil.demo.com.ar:9911/user/CrearIncidencia",
                    xhrFields: { withCredentials: true },
                    crossDomain: true,
                    data: {
                        fotoset: fotosetID,
                        nlegajo: nlegajo1,
                        pass: pass1,
                        obsmobile: obsmobile1,
                        calle: calle1,
                        altura: altura1,
                        localidad: localidad1,
                        gpslatcoord: GPSLat,
                        gpslongcoord: GPSLong
                    },
                    dataType: 'json',
                    success: function (response) {
                        //alert('NUEVA INCIDENCIA STATUS: ' + response);
                        $("#EnvioFotosProgressBar-page").hide();
                        $("#EnvNuevoIncidente-page").show();

                        //**** NUEVA VERIFICACION, USUARIO BLOQUEADO O INHABILITADO
                        // NO PUEDE CREAR INCIDENCIA.
                        if (response == -20) {
                            //MENSAJE USUARIO BLOQUEADO
                        }
                        else {
                            if (response == -25) {
                                //MENSAJE USUARIO INHABILITADO
                            }
                            else {
                                if (response == -30) {
                                    //MENSAJE USUARIO ESTADO DESCONOCIDO
                                }
                                else {
                                    //INCIDENCIA CREADA CON EXITO.
                                    //alert('Incidencia creada ' + response);
                                    if (fotosetID == -10) {
                                        document.getElementById("txtNuevaIncidencia").innerHTML = "La incidencia " + response + " ha sido registrada. Ocurrio un error al enviar las fotos.";
                                    }
                                    else {
                                        document.getElementById("txtNuevaIncidencia").innerHTML = "La incidencia " + response + " ha sido registrada.";
                                    }
                                }
                            }
                        }
                        //**** FIN NUEVA VERIFICACION       

                        $.mobile.changePage("#EnvNuevoIncidente-page");
                    },
                    error: function (xhr, status, error) {
                        //alert('Error al crear la incidencia.');
                        //CAMBIAR ESTO POR PAGINA DE ERROR:
                        //ESTAMOS TRABAJANDO PARA MEJORAR SU EXPERIENCIA
                        //LA APLICACION WEBAPI DEBERIA SER CAPAZ
                        //DE ENVIAR UN MAIL CON EL ERROR, ASI SE LE PUEDE
                        //HACER SEGUIMIENTO.
                        $("#EnvioFotosProgressBar-page").hide();
                        $("#ErrorNuevoIncidente-page").show();
                        $.mobile.changePage("#ErrorNuevoIncidente-page");

                    }
                });

                //********** FIN ENVIO POR AJAX *************


            }, function (tx, error) {
                //ErrorLocal-page  
                //Domicilio-page
                $("#Domicilio-page").hide();
                $("#ErrorLocal-page").show();
                document.getElementById("txtErrorLocal").innerHTML = "Error 22 al obtener datos desde Base local.";
                $.mobile.changePage("#ErrorLocal-page");
            });
        });

    }
    //************** FIN VERSION MERGE REGISTRACION->GPSFULL **************************************




    //********* VERSION GPSFULL-BORRAR SI ANDUVO ESTA VERSION MERGE CON REGISTRACION **************
    //function CrearIncidencia() {       
    //    //COMPLETAR PARAMETROS A ENVIAR:

    //    nlegajo1 = $('#svpNumLegajo').val();
    //    pass1 = $('#svpContasenia').val();
    //    obsmobile1 = $('#svpDetIncidente').val();

    //    //alert('ESTADO GPS CREA INCI: ' + isGPSActivado);

    //    if (!isGPSActivado)
    //    {
    //        //GPS NO SELECCIONADO, TOMA DATOS DESDE CARGA MANUAL
    //        //alert('CARGA SIN GPS');
    //        calle1 = $('#svpUbCalle').val();
    //        altura1 = $('#svpUbAltura').val();
    //        localidad1 = $('#svpUbLocalidad').val();
    //    }
    //    //else
    //    //{
    //        //GPS ACTIVADO, TOMO LAT Y LONG Y LOS ENVIO CON LA INCIDENCIA:
    //        //VERIFICO SI YA GUARDE LAS COORDENADAS PREVIAMENTE
    //        //alert('CARGA CON GPS');
    //        //GPSLat = position.coords.latitude;
    //        //alert('GPS LAT: ' + GPSLat);
    //        //GPSLong = position.coords.longitude;
    //        //alert('GPS LONG: ' + GPSLong);
    //    //}



    //    $.ajax({
    //        type: "GET",
    //        url: "http://movil.demo.com.ar:9911/user/CrearIncidencia",
    //        xhrFields: { withCredentials: true },
    //        crossDomain: true,         
    //        data: {
    //            fotoset: fotosetID,
    //            nlegajo: nlegajo1,
    //            pass: pass1,
    //            obsmobile: obsmobile1,
    //            calle: calle1,
    //            altura: altura1,
    //            localidad: localidad1,
    //            gpslatcoord: GPSLat,
    //            gpslongcoord: GPSLong
    //        },
    //        dataType: 'json',
    //        success: function (response) {
                
    //            //CAMBIAR ESTO POR MOSTRAR ULTIMA PAGINA CON NUMERO
    //            //REAL DE LA INCIDENCIA, CREADA.
    //            $("#EnvioFotosProgressBar-page").hide();                       

    //            $("#EnvNuevoIncidente-page").show();

    //            if (fotosetID===-10)
    //            {
    //                document.getElementById("txtNuevaIncidencia").innerHTML = "La incidencia " + response + " ha sido registrada. Ocurrio un error al enviar las fotos. Si lo desea puede remitirlas online a traves de https://www.demo.com.ar/seguridadviapublica";
    //            }
    //            else
    //            {
    //                document.getElementById("txtNuevaIncidencia").innerHTML = "La incidencia " + response + " ha sido registrada.";
    //            }
               
               
    //            $.mobile.changePage("#EnvNuevoIncidente-page");
    //        },
    //        error: function (xhr, status, error) {
    //            //alert('Error al crear la incidencia.');
    //            //CAMBIAR ESTO POR PAGINA DE ERROR:
    //            //ESTAMOS TRABAJANDO PARA MEJORAR SU EXPERIENCIA
    //            //LA APLICACION WEBAPI DEBERIA SER CAPAZ
    //            //DE ENVIAR UN MAIL CON EL ERROR, ASI SE LE PUEDE
    //            //HACER SEGUIMIENTO.

    //            $("#EnvioFotosProgressBar-page").hide();
    //            $("#ErrorNuevoIncidente-page").show();
    //            $.mobile.changePage("#ErrorNuevoIncidente-page");

    //        }
    //    });   
    //}
    //********* VERSION GPSFULL-BORRAR SI ANDUVO ESTA VERSION MERGE CON REGISTRACION **************


    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }
})();