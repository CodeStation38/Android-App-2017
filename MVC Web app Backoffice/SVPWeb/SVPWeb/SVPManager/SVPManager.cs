using System;
using System.Collections.Generic;
using System.Linq;
using SVPWeb.Models;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.Data.Entity;
using System.Threading.Tasks;
using System.Net;
using System.Web.Helpers;
using PagedList;
using SVPWeb.SVPManager;

namespace SVPWeb.SVPManager
{
    public class SVPManager
    {
     
        #region Metodos para la grilla detalles de Incidencia
        public List<Incidencia> GetAllIncidencias(svpdesaEntities16 context)
        {
            var listaIncidencias = context.Incidencias.ToList();
            return listaIncidencias;
        }

        public List<Incidencia> GetIncidenciaByZona(string ZonaDescripcion, svpdesaEntities16 context)
        {
            var listaIncidenciaByZona = context.Incidencias.Where(x => x.Zona == ZonaDescripcion).ToList();
            return listaIncidenciaByZona;
        }

        public List<Incidencia> GetIncidenciaByEstado(string EstadoDescripcion, svpdesaEntities16 context)
        {
            var listaIncidenciaByEstado = context.Incidencias.Where(x => x.Estado == EstadoDescripcion).ToList();
            return listaIncidenciaByEstado;
        }

        public List<Incidencia> GetIncidenciaByUsuarioMovil(int LegajoUserMovil, svpdesaEntities16 context)
        {
            var listaIncidenciaByUsuarioMovil = context.Incidencias.Where(x => x.NlegajoUMobile == LegajoUserMovil).ToList();
            return listaIncidenciaByUsuarioMovil;
        }

        public List<Incidencia> GetIncidenciaByFecha(System.DateTime FechaDesde, System.DateTime FechaHasta, svpdesaEntities16 context)
        {
            //var listaIncidenciaByFecha = context.Incidencias.Where(x => (x.Fecha.ToString("yyyy-MM-dd") >= FechaDesde.ToString("yyyy-MM-dd") && x.Fecha.ToString("yyyy-MM-dd" <= FechaHasta.ToString("yyyy-MM-dd"))).ToList();
            var listaIncidenciaByFecha = context.Incidencias.Where(x => (x.Fecha >= FechaDesde && x.Fecha <= FechaHasta)).ToList();
            return listaIncidenciaByFecha;

        }
        #endregion
 

        #region Metodos UsuarioSVPWebIncidencia
        public UsuarioSVPWebIncidencia GetUsuarioSVPWebIncidenciaByIdIncidencia(int IdIncidencia, svpdesaEntities16 context)
        {
            var usuariowebincidencia = context.UsuarioSVPWebIncidencias.Where(x=>x.IdIncidencia==IdIncidencia && x.NLegSVPWeb==99001).FirstOrDefault();
            return usuariowebincidencia;
        }

        public List<UsuarioSVPWebIncidencia> GetUsuariosWebByIncidenciaId(int idInciden, svpdesaEntities16 context)
        {
            var listauwebIncidencias = context.UsuarioSVPWebIncidencias.Where(x => x.IdIncidencia == idInciden).ToList();
            return listauwebIncidencias;
        }
        #endregion Fin Metodos UsuarioSVPWebIncidencia

        #region Metodos Incidencias
        public Incidencia GetIncidenciaById(int IdIncidencia, svpdesaEntities16 context)
        {
            var incidencia = context.Incidencias.Where(x => x.Id == IdIncidencia).FirstOrDefault();
            return incidencia;
        }
        #endregion Fin Metodos Incidencias

        #region Metodos Fotos
        public Foto GetFotoById(int idFoto, svpdesaEntities16 context)
        {
            var fotot = context.Fotos.Where(x => x.Id == idFoto).FirstOrDefault();
            return fotot;
        }
        #endregion Fin Metodos Fotos

        #region Metodos UsuarioWeb
        //GET USUARIO WEB ID
        public int GetUsuarioSVPWeb(UsuarioSVPWeb usumobile, svpdesaEntities16 context)
        {
            var usuariosvpmovil = usumobile.Id;
            return usuariosvpmovil;
        }

        //INSERT USUARIOMOBILE
        public int ConvertirUMobileEnUWeb(int nlegajomobile,string apenom ,string pass, svpdesaEntities16 context)
        {
            int nuevousermovilwebID = 0;
            UsuarioSVPWeb umobilewebnuevo = new UsuarioSVPWeb();
            umobilewebnuevo.NumeroLegajo = nlegajomobile;
            umobilewebnuevo.NombreApellido = apenom;
            umobilewebnuevo.Contrasenia = pass;
            //PARA PEDIR MODIFICACION DE CREACION CAMPO
            //umobilenuevo.userUUID = telefonoID;
            umobilewebnuevo.FechaCreacion = DateTime.Now;

            //NUEVO, SE AGREGA UN ESTADO ASIGNADO AUTOMATICO
            //AL MOMENTO DE LA CREACION

            int nuevoidpermisouweb = CrearNuevoPermisoUWeb(nlegajomobile, context);
            umobilewebnuevo.IdPermisos = nuevoidpermisouweb;

            umobilewebnuevo.Estado = "A";

            context.UsuarioSVPWebs.Add(umobilewebnuevo);
            context.SaveChanges();

            //OBTENGO EL ID DEL USUARIOSVPMOBILE RECIEN CREADO: 
            nuevousermovilwebID = GetUsuarioSVPWeb(umobilewebnuevo, context);

            return nuevousermovilwebID;
        }

        public void SaveUpdate(int IdUsuarioWeb,string nuevaclave, svpdesaEntities16 context)
        {
            //try
            //{
            //    var usuweb = context.UsuarioSVPWebs.Find(IdUsuarioWeb);
            //        usuweb.Contrasenia = nuevaclave;


            //    if (ModelSate.IsValid)
            //    {
            //        context.Entry(usuweb).State = EntityState.Modified;
            //        //db.Entry(usuwebinci).State = EntityState.Modified;

            //        context.SaveChanges();

            //    }

            //    //return Json(new { Result = "OK" }, JsonRequestBehavior.AllowGet);
            //}
            //catch (System.Data.Entity.Validation.DbEntityValidationException dbEx)
            //{
            //    Exception raise = dbEx;
            //    foreach (var validationErrors in dbEx.EntityValidationErrors)
            //    {
            //        foreach (var validationError in validationErrors.ValidationErrors)
            //        {
            //            string message = string.Format("{0}:{1}",
            //                validationErrors.Entry.Entity.ToString(),
            //                validationError.ErrorMessage);
            //            // raise a new exception nesting
            //            // the current instance as InnerException
            //            raise = new InvalidOperationException(message, raise);
            //        }
            //    }
            //    throw raise;
            //}
        }
        #endregion Fin Metodos UsuarioWeb

        #region Metodos PermisosUsuarios
        public int CrearNuevoPermisoUWeb(int nlegajouweb, svpdesaEntities16 context)
        {
            PermisosUsuario permisouwebfromdata = new PermisosUsuario();
            permisouwebfromdata.NLegajoUsuario = nlegajouweb;

            permisouwebfromdata.InciR = false;
            permisouwebfromdata.InciRW = false;

            permisouwebfromdata.WebR = false;
            permisouwebfromdata.WebRW = false;

            permisouwebfromdata.MobileR = false;
            permisouwebfromdata.MobileRW = false;

            permisouwebfromdata.GrillaPermisosR = false;
            permisouwebfromdata.FechaCreacion = DateTime.Now;

            context.PermisosUsuarios.Add(permisouwebfromdata);
            context.SaveChanges();

            //GetFoto()

            //RETORNA EL IDPHOTOSET
            return permisouwebfromdata.Id;
        }


        #endregion Metodos PermisosUsuarios

        #region GET SCAMNET OPERATIONS
        public Legajo GetPersonaCompania(int legajoCompania)
        {
            var personaCompania = GetAllPersonasCompania().Where(x => x.nlegajo == legajoCompania).FirstOrDefault();
            return personaCompania;
        }

        public List<Legajo> GetAllPersonasCompania()
        {
            svpdesaEntities16 context = new Models.svpdesaEntities16();
            //List<LegajosDemo> allpersonasCompania = new List<LegajosDemo>();
            var allpersonasCompania = context.Legajos.ToList();
            return allpersonasCompania;
        }

        #endregion GET SCAMNET OPERATIONS


    }
}