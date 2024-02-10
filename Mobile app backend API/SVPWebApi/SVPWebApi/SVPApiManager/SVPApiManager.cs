using SVPWebApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SVPWebApi.SVPApiManager
{
    public class SVPApiManager
    {
        //public svpdesaEntities7 svpdesaContext = new svpdesaEntities7();
        #region GET OPERATIONS
        //TODO: Este corresponde a UsuarioSVPWebIncidenciaManager
        public UsuarioSVPWebIncidencia GetUsuarioSVPWebIncidenciaByIdIncidencia(int IdIncidencia, svpdesaEntities7 context)
        {
            var usuariowebincidencia = context.UsuarioSVPWebIncidencias.Where(x => x.IdIncidencia == IdIncidencia && x.NLegSVPWeb == 99001).FirstOrDefault();
            return usuariowebincidencia;
        }

        public Incidencia GetIncidenciaById(int IdIncidencia, svpdesaEntities7 context)
        {
            var incidencia = context.Incidencias.Where(x => x.Id == IdIncidencia).FirstOrDefault();
            return incidencia;
        }

        public int GetIncidencia(Incidencia inci, svpdesaEntities7 context)
        {
            var incidencia = inci.Id;
            return incidencia;
        }

        public int GetFoto(Foto fotox, svpdesaEntities7 context)
        {
            var fotosetID = fotox.Id;
            return fotosetID;
        }

        //
        public int GetUsuarioSVPMobile(UsuarioSVPMobile usumobile, svpdesaEntities7 context)
        {
            var usuariosvpmovil = usumobile.Id;
            return usuariosvpmovil;
        }

        public Foto GetFotoById(int idFoto, svpdesaEntities7 context)
        {
            var fotot = context.Fotos.Where(x => x.Id == idFoto).FirstOrDefault();
            return fotot;
        }

        public List<UsuarioSVPWebIncidencia> GetUsuariosWebByIncidenciaId(int idInciden, svpdesaEntities7 context)
        {
            var listauwebIncidencias = context.UsuarioSVPWebIncidencias.Where(x => x.IdIncidencia == idInciden).ToList();
            return listauwebIncidencias;
        }
        #endregion GET OPERATIONS

        #region GET SCAMNET OPERATIONS
        public List<Legajo> GetAllPersonasdemo()
        {
            svpdesaEntities7 context = new Models.svpdesaEntities7();
            //List<LegajosDemo> allpersonasdemo = new List<LegajosDemo>();
            var allpersonasdemo = context.Legajos.ToList();
            return allpersonasdemo;
        }

        //EN ESTA VERSION, PERSONAS ESTA EN TABLA LEGAJODEMO
        public Legajo GetPersonademo(int legajodemo)
        {
            var personademo = GetAllPersonasdemo().Where(x => x.nlegajo == legajodemo).FirstOrDefault();
            return personademo;
        }
        #endregion GET SCAMNET OPERATIONS


        #region INSERT OPERATIONS
        //INSERT FOTO
        //int foto,
        public int CrearConjuntoDeFotos(string fotonombre, string thumbnailnombre, svpdesaEntities7 context)
        {
            Foto fotofromdata = new Foto();
            fotofromdata.Foto1 = 1;


            fotofromdata.Ruta1 = "~/img/" + fotonombre;
            fotofromdata.Thumbnail1="~/img/" + thumbnailnombre;

            context.Fotos.Add(fotofromdata);
            context.SaveChanges();

            //GetFoto()

            //RETORNA EL IDPHOTOSET
            return fotofromdata.Id;
        }

        //INSERT USUARIOMOBILE
        public int MarcarActualTelefonoComoHistorico(UsuarioSVPMobile telefonoanterior, string telefonoID, svpdesaEntities7 context)
        {
            int nuevousermovilID = 0;
            UsuarioSVPMobile umobilenuevo = new UsuarioSVPMobile();

            //ESTE ARTIFICIO MATEMATICO, ASEGURA QUE EL NUEVO REGISTRO,
            //AUNQUE REPITIENDO EL NUMERO DE LEGAJO, 
            //NUEVO LEGAJO, DISTINTO Y UNICO, PARA LAS
            //RESTRICCIONES DE CLAVE PRIMARIA DE ESTA TABLA USUARIOSVPMOBILE
            umobilenuevo.NumeroLegajo = telefonoanterior.NumeroLegajo * 10;
            umobilenuevo.Contrasenia = telefonoanterior.Contrasenia;       
            umobilenuevo.userUUID = telefonoanterior.userUUID;
          

            //SE MARCA COMO HISTORICO, PARA QUE NO APAREZCA EN LA GRILLA
            umobilenuevo.Estado = "H";
            umobilenuevo.EsUsuarioWeb = telefonoanterior.EsUsuarioWeb;
            umobilenuevo.FechaCreacionUMovil = telefonoanterior.FechaCreacionUMovil;

            context.UsuarioSVPMobiles.Add(umobilenuevo);
            context.SaveChanges();

            //OBTENGO EL ID DEL USUARIOSVPMOBILE RECIEN CREADO 
            nuevousermovilID = GetUsuarioSVPMobile(umobilenuevo, context);

            //ESTE ID PUEDE SERVIR MAS ADELANTE.
            return nuevousermovilID;
        }
        //string pass,
        public int CrearUsuarioSVPMobile(int nlegajomobile, string pass, string telefonoID, svpdesaEntities7 context)
        {
            //PREGUNTO A SCAMNET, SI EXISTE EL LEGAJO
            //Personas consultaPersona = new Personas();
            int nuevousermovilID = 0;
            var consultaPersona = GetPersonademo(nlegajomobile);

            if (consultaPersona != null)
            {
                //PREGUNTO SI LA TABLA USUARIOSVPMOBILE YA TIENE ASOCIADA ESTA PERSONA, A UN TELEFONO, PREVIAMENTE.
                var intLegajodemo = consultaPersona.nlegajo;
                var consultaUsuarioSVPMovil = context.UsuarioSVPMobiles.Where(r => r.NumeroLegajo == intLegajodemo).FirstOrDefault();
                if (consultaUsuarioSVPMovil == null)
                {

                    //EL USUARIO QUE INTENTA REGISTRARSE ES NUEVO Y NUNCA SE REGISTRO ANTERIORMENTE PARA EL USO
                    //DE LA APP SVP. SE PROCEDE A SU REGISTRACION
                    UsuarioSVPMobile umobilenuevo = new UsuarioSVPMobile();
                    umobilenuevo.NumeroLegajo = nlegajomobile;
                    umobilenuevo.Contrasenia = pass;
                    //PARA PEDIR MODIFICACION DE CREACION CAMPO
                    umobilenuevo.userUUID = telefonoID;

                    //NUEVO, SE AGREGA UN ESTADO ASIGNADO AUTOMATICO
                    //AL MOMENTO DE LA CREACION
                    umobilenuevo.Estado = "A";
                    umobilenuevo.EsUsuarioWeb = false;
                    umobilenuevo.FechaCreacionUMovil = DateTime.Now;

                    context.UsuarioSVPMobiles.Add(umobilenuevo);
                    context.SaveChanges();

                    //OBTENGO EL ID DEL USUARIOSVPMOBILE RECIEN CREADO: 
                    nuevousermovilID = GetUsuarioSVPMobile(umobilenuevo, context);

                }
                else
                {
                    //EL USUARIO YA TIENE ASOCIADO UN DISPOSITIVO MOVIL. MENSAJE DE ERROR TIPO 2: YA EXISTENTE
                    //nuevousermovilID = -2;

                    //NUEVA LOGICA, EL USUARIO EXISTE Y TIENE EL ESTADO "L"

                    if (consultaUsuarioSVPMovil.Estado == "L")
                    {
                        //EL USUARIO TIENE EL MISMO TELEFONO
                        if (consultaUsuarioSVPMovil.userUUID == telefonoID)
                        {
                            //RETORNA CODIGO "USUARIO REINSTALA APP"

                            //SE MARCA EL ACTUAL REGISTRO COMO "A"


                            //PARA MAS ADELANTE, REGISTRAR EN ALGUNA TABLA
                            //DE SEGUIMIENTO O AUDITORIA, LA REINSTALACION POR
                            //PARTE DEL USUARIO MOVIL.


                            //RETORNA CODIGO "USUARIO REINSTALA APP EN EL TELEFONO YA REGISTRADO."
                            nuevousermovilID = -3;

                        }
                        else
                        {
                            //EL USUARIO TIENE UN TELEFONO NUEVO                       
                            //"EL TELEFONO ANTERIOR QUEDARA INHABILITADO PARA INSTALAR ESTA APLICACION"
                            //RETORNA CODIGO "DESEA CONFIGURAR SU NUEVO TELEFONO COMO ACTIVO?"
                            nuevousermovilID = -4;
                        }

                    }
                    else
                    {
                        //SI NO ES "A" NI "L", EL SERVICIO IGNORA LA PETICION
                        //EL USUARIO YA TIENE ASOCIADO UN DISPOSITIVO MOVIL. MENSAJE DE ERROR TIPO 2: YA EXISTENTE
                        nuevousermovilID = -2;
                    }

                }
            }
            else
            {
                //NO EXISTE EL USUARIO EN DBdemo RRHH. ERROR TIPO 1: NO EXISTE LEGAJO
                nuevousermovilID = -1;
            }

            //RETORNA EL nuevousermovilID
            return nuevousermovilID;
        }


        public int ConfigurarNuevoTelefono(int nlegajomobile, string pass, string telefonoID, svpdesaEntities7 context)
        {
            //PREGUNTO A SCAMNET, SI EXISTE EL LEGAJO
            //Personas consultaPersona = new Personas();
            int nuevotelefonoID = 0;
            var consultaPersona = GetPersonademo(nlegajomobile);

            if (consultaPersona != null)
            {
                //PREGUNTO SI LA TABLA USUARIOSVPMOBILE YA TIENE ASOCIADA ESTA PERSONA, A UN TELEFONO, PREVIAMENTE.
                var intLegajodemo = consultaPersona.nlegajo;
                var consultaUsuarioSVPMovil = context.UsuarioSVPMobiles.Where(r => r.NumeroLegajo == intLegajodemo).FirstOrDefault();
                if (consultaUsuarioSVPMovil == null)
                {
                    //ERROR LEGAJO NO AUTORIZADO PARA CONFIGURAR UN NUEVO TELEFONO
                    nuevotelefonoID = -11;
                }
                else
                {

                    //NUEVA LOGICA, EL USUARIO EXISTE Y TIENE EL ESTADO "L"
                    if (consultaUsuarioSVPMovil.Estado == "L")
                    {
                        //EL USUARIO TIENE EL MISMO TELEFONO
                        if (consultaUsuarioSVPMovil.userUUID == telefonoID)
                        {
                            //ERROR, INTENTA CONFIGURAR NUEVO TELEFONO EN UN TELEFONO YA REGISTRADO
                            nuevotelefonoID = -12;

                        }
                        else
                        {
                            //EL USUARIO ACEPTA UN NUEVO TELEFONO COMO ACTIVO

                            //ACTUALIZAR ESTE LEGAJO CON INFO DEL NUEVO TELEFONO
                            //Y FECHA DE MODIFICACION
                            //CONFIGURAR NUEVO TELEFONO EXITO
                            //RETORNA CODIGO 10=OK
                            nuevotelefonoID = 10;
                        }

                    }
                    else
                    {
                        //SI NO ES "A" NI "L", EL SERVICIO IGNORA LA PETICION
                        //INFORMA ERROR, "ERROR AL CONFIGURAR NUEVO TELEFONO"
                        nuevotelefonoID = -13;
                    }

                }
            }
            else
            {
                //NO EXISTE EL USUARIO EN DBdemo RRHH.
                //NO AUTORIZADO PARA ACTUALIZAR EL NUEVO DE TELEFONO
                nuevotelefonoID = -14;
            }

            //RETORNA EL nuevousermovilID
            return nuevotelefonoID;
       }



        //VERIFICA ESTADO USUARIOMOBILE
        //int nlegajo,
        public int VerificaLogin(int nlegajomobile, svpdesaEntities7 context)
        {
            //PREGUNTO POR EL ESTADO DEL LEGAJO(AUTORIZADO, BLOQUEADO O INHABILITADO)
            //ERROR -50: BLOQUEADO
            //ERROR -55: INHABILITADO
            //ERROR -60: ESTADO DE USUARIO DESCONOCIDO.

            int estadolegajologin = 0;    
            var consultaUsuarioSVPMovil = context.UsuarioSVPMobiles.Where(r => r.NumeroLegajo == nlegajomobile).FirstOrDefault();
            if(consultaUsuarioSVPMovil.Estado=="B")
            {
                estadolegajologin = -50;
            }
            else
            {
                if (consultaUsuarioSVPMovil.Estado == "I")
                {
                    estadolegajologin = -55;
                }
                else
                {
                    if (consultaUsuarioSVPMovil.Estado == "A")
                    {
                        estadolegajologin = 10;
                    }
                    else
                    {
                        estadolegajologin = -60;
                    }
                }
            }

            //RETORNA estadolegajologin
            return estadolegajologin;
        }


        //INSERT INCIDENCIA REAL CON DATOS ENVIADOS POR LA APP SVPMOVIL
        public int CrearNuevaIncidencia(
            int fotosetIDfromPhone,
            int nlegajomobile,
            string pass,
            string obsmobile,
            string calle,
            string altura,
            string localidad,
            decimal gpslatcoord,
            decimal gpslongcoord,
            svpdesaEntities7 context
        )
        {

            //***** NUEVA VERIFICACION
            var consultaUsuarioSVPMovil = context.UsuarioSVPMobiles.Where(r => r.NumeroLegajo == nlegajomobile).FirstOrDefault();
            int incidencianueva = 0;
            
            //USUARIO ESTA BLOQUEADO O INHABILITADO PARA USAR LA APP MOVIL
            if (consultaUsuarioSVPMovil.Estado == "B")
            {
                //MENSAJE DE ERROR: USUARIO BLOQUEADO
                incidencianueva = -20;
            }
            else
            {
                if (consultaUsuarioSVPMovil.Estado == "I")
                {
                    //MENSAJE DE ERROR: USUARIO INHABILITADO
                    incidencianueva = -25;
                }
            }
            //***** FIN NUEVA VERIFICACION

            if (consultaUsuarioSVPMovil.Estado == "A")
            {
                //AUTORIZADO PARA CREAR INCIDENCIA
                Incidencia nuevainci = new Incidencia();
                nuevainci.Estado = "N";
                //nuevainci.NlegajoUMobile = 1234;
                //
                nuevainci.NlegajoUMobile = nlegajomobile;
                nuevainci.Fecha = DateTime.Now;
                nuevainci.Zona = "  ";
                nuevainci.IdPhotoSet = fotosetIDfromPhone;
                nuevainci.ObsMobile = obsmobile;
                nuevainci.Calle = calle;
                nuevainci.Altura = altura;
                nuevainci.Localidad = localidad;


                nuevainci.GPSLat = gpslatcoord;
                nuevainci.GPSLon = gpslongcoord;

                context.Incidencias.Add(nuevainci);
                context.SaveChanges();

                int nuevainciID = GetIncidencia(nuevainci, context);

                //INSERTO USUARIOSVPWEBINCIDENCIA ASOCIADO
                UsuarioSVPWebIncidencia usuwebinci = new UsuarioSVPWebIncidencia();
                usuwebinci.NLegSVPWeb = 99001;

                //NUEVO, ASIGNA ESTA INCIDENCIA AL VERDADERO LEGAJO
                //AUTORIZADO QUE ESTA ENVIANDO LA INCIDENCIA.
                //usuwebinci.NLegSVPWeb = nlegajomobile;
                usuwebinci.IdIncidencia = nuevainciID;
                context.UsuarioSVPWebIncidencias.Add(usuwebinci);
                context.SaveChanges();

                //RETORNA EL IDINCIDENCIA
                incidencianueva = nuevainci.Id;

            }
            else
            {
                //MENSAJE DE ERROR: ESTADO DE USUARIO DESCONOCIDO
                incidencianueva = -30;
            }


            return incidencianueva;
        }

        #endregion INSERT OPERATIONS

        #region UPDATE OPERATIONS
        //ActualizarConjuntoDeFotos(fotosetupdate, fotoname, thumbnamedestination, db);
        public void ActualizarConjuntoDeFotos(Foto fotoSetToUpdate, string fotonombre, string thumbnailnombre, svpdesaEntities7 context)
        {
            //Foto fotofromdata = new Foto();
            context.Fotos.Attach(fotoSetToUpdate);
            var entry = context.Entry(fotoSetToUpdate);

            if (string.IsNullOrEmpty(fotoSetToUpdate.Ruta2))
            {
                fotoSetToUpdate.Ruta2 = "~/img/" + fotonombre;
                fotoSetToUpdate.Thumbnail2 = "~/img/" + thumbnailnombre;

                entry.Property(e => e.Ruta2).IsModified = true;
                entry.Property(e => e.Thumbnail2).IsModified = true;

            }
            else
            {
                if (string.IsNullOrEmpty(fotoSetToUpdate.Ruta3))
                {
                    fotoSetToUpdate.Ruta3 = "~/img/" + fotonombre;
                    fotoSetToUpdate.Thumbnail3 = "~/img/" + thumbnailnombre;

                    entry.Property(e => e.Ruta3).IsModified = true;
                    entry.Property(e => e.Thumbnail3).IsModified = true;
                }
                else
                {
                    if (string.IsNullOrEmpty(fotoSetToUpdate.Ruta4))
                    {
                        fotoSetToUpdate.Ruta4 = "~/img/" + fotonombre;
                        fotoSetToUpdate.Thumbnail4 = "~/img/" + thumbnailnombre;

                        entry.Property(e => e.Ruta4).IsModified = true;
                        entry.Property(e => e.Thumbnail4).IsModified = true;
                    }
                }
            }

            //context.Fotos.Add(fotoSetToUpdate);
            //context.SaveChanges();

            // other changed properties
            context.SaveChanges();

            //GetFoto()

            //RETORNA EL IDPHOTOSET
            //return fotofromdata.Id;
        }

        #endregion


    }
}