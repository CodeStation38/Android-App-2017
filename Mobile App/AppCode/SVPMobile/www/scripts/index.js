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


        $("#btnRegistrar").on("tap", function (e) {
            //CrearUsuarioMovil();
            ValidaCamposRegistracion();
        });

 
        $("#btnSalir").on("tap", function () {
            ExitMyApp();
        });

    };

    function CrearUsuarioMovil()
    {
        //LA TABLA SE CREA AQUI!
        //OBTIENE UUID
        //alert('CREANDO USUARIO sms...');
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
            url: "http://sms.compania.com.ar:9911/user/CrearUsuarioMovil",
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
                                    //    "USUARIO REGISTRADO CON EXITO EN BASE DE DATOS compania". 
                                    //EN CASO DE HABERSE REGISTRADO CON EXITO EN LA BASE DE DATOS compania:
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
             //DE SU TELEFONO Y LUEGO A REGISTRARLO EN LA DBcompania(TABALUSERMOVIL).
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

   
    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }
})();