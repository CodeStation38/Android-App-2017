using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Net;
using System.Web;
using System.Web.Mvc;
using SVPWeb.Models;
using PagedList;

namespace SVPWeb.Controllers
{
    public class UsuarioSVPWebController : BaseController
    {
       

        // GET: UsuarioSVPWeb
        public ActionResult Index(int? page)
        {
            UsuarioSVPWeb usuarioWeb = new UsuarioSVPWeb();

            //if (Session["TOKENSITIO"] != null)
            //{
                string solonombre = (string)Session["namestring"];
                ViewBag.namestring = solonombre;

            int numlegajo3 = (int)Session["Numeronamestring"];

            ViewBag.Numeronamestring = numlegajo3;

                 usuarioWeb = db.UsuarioSVPWebs.Where(x => x.NumeroLegajo == numlegajo3).FirstOrDefault();

                if (usuarioWeb == null)
                {
                    usuarioWeb = db.UsuarioSVPWebs.Where(x => x.Id == numlegajo3).FirstOrDefault();
                }

                ViewBag.PermisosAdWeb = usuarioWeb;


                int pageSize = 15;
                int pageNumber = (page ?? 1);


                return View(db.UsuarioSVPWebs.Where(x => x.Estado != "H").OrderByDescending(x => x.Id).ToPagedList(pageNumber, pageSize));
                //return View(db.UsuarioSVPWebs.Where(x=>x.Estado!="H").ToList());
            //}
            //else
            //{
            //    return RedirectToAction("Index", "Login");
            //}

        }

        // GET: UsuarioSVPWeb/Details/5
        public async Task<ActionResult> Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UsuarioSVPWeb usuarioSVPWeb = await db.UsuarioSVPWebs.FindAsync(id);
            if (usuarioSVPWeb == null)
            {
                return HttpNotFound();
            }
            return View(usuarioSVPWeb);
        }

        // GET: UsuarioSVPWeb/Create
        [HttpPost]
        public ActionResult Create()
        {
            UsuarioSVPWeb nuevouwebfrombutton = new UsuarioSVPWeb();

            return PartialView("Create", nuevouwebfrombutton);
        }

        // POST: UsuarioSVPWeb/Create     
        [HttpPost]    
        public ActionResult Crear(UsuarioSVPWeb _UsuarioSVPWeb)
        {
            int idnuevouweb = 0;
            var message1 = "";

            try
            {
                if (ModelState.IsValid)
                {
                    SVPManager.SVPManager biz = new SVPManager.SVPManager();
                    //VERIFICAR SI LEGAJO EXISTE EN TABLA LEGAJOS SCAMNET
                    var consultaPersona = biz.GetPersonaCompania(_UsuarioSVPWeb.NumeroLegajo);
                    if (consultaPersona != null)
                    {
                    
                        //VERIFICAR SI EXISTE EN TABLA USUARIOWEB
                        var osuarioweb = db.UsuarioSVPWebs.Where(r => r.NumeroLegajo == _UsuarioSVPWeb.NumeroLegajo).FirstOrDefault();
                        //SI NO EXISTE EN TABLA USUARIOSVPWEB, SETEAR CONTRASENIA POR DEFAULT, PERMISOS POR DEFAULT(SOLO READ INCIDENCIAS), FECHACREACION  
                        if (osuarioweb == null)
                        {
                            //CREAR NUEVO REGISTRO PERMISOSUSUARIO PARA ESTE LEGAJO
                            int nuevoidpermisouweb = biz.CrearNuevoPermisoUWeb(_UsuarioSVPWeb.NumeroLegajo, db);
                            //OBTENER ID DEL NUEVO REGISTRO PERMISOSUSUARIO RECIEN CREADO
                            _UsuarioSVPWeb.IdPermisos = nuevoidpermisouweb;
                            _UsuarioSVPWeb.Estado = "A";
                            _UsuarioSVPWeb.Contrasenia = "12345";
                            _UsuarioSVPWeb.FechaCreacion = DateTime.Now;                      

                            db.UsuarioSVPWebs.Add(_UsuarioSVPWeb);
                            db.SaveChanges();

                             idnuevouweb = nuevoidpermisouweb;
                             //message1 = "";
                        }
                        else
                        {
                            //SI LEGAJO EXISTE, YA EXISTENTE,ERROR.
                            //RETORNAR ERROR -70     
                            idnuevouweb = -70;
                        }
                    }
                    else
                    {
                        //SI NO EXISTE EN SCAMNET, ERROR, LEGAJO INEXISTENTE.
                        //RETORNAR ERROR -80
                        idnuevouweb = -80;
                    }

                }
               
                message1 = string.Format(Convert.ToString(idnuevouweb));
                Response.Headers["JSonResultado"] = message1;
                return Json(new { Result = message1 }, JsonRequestBehavior.AllowGet);

            }
            catch (System.Data.Entity.Validation.DbEntityValidationException dbEx)
            {
                Exception raise = dbEx;
                foreach (var validationErrors in dbEx.EntityValidationErrors)
                {
                    foreach (var validationError in validationErrors.ValidationErrors)
                    {
                        string message = string.Format("{0}:{1}",
                            validationErrors.Entry.Entity.ToString(),
                            validationError.ErrorMessage);
                        // raise a new exception nesting
                        // the current instance as InnerException
                        raise = new InvalidOperationException(message, raise);
                    }
                }
                throw raise;
            }

        }

        // GET: UsuarioSVPWeb/Edit/5
        [HttpPost]
        public ActionResult Editar(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UsuarioSVPWeb usuarioSVPWeb = db.UsuarioSVPWebs.Find(id);
            if (usuarioSVPWeb == null)
            {
                return HttpNotFound();
            }

            string lblusuwebnombre = usuarioSVPWeb.NombreApellido;

            //PARSEO STRING PARA OBTENER SOLO EL NOMBRE:
            string s3 = lblusuwebnombre;
            string[] values3 = s3.Split(',');

            string solonombreedicion = values3[1];
            string soloapellidoedicion = values3[0];

            ViewBag.NombreEdicion = solonombreedicion;
            ViewBag.ApellidoEdicion = soloapellidoedicion;

            return PartialView("Edit", usuarioSVPWeb);
        }

        // POST: UsuarioSVPWeb/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        public async Task<ActionResult> Edit([Bind(Include = "Id,NumeroLegajo,NombreApellido,Contrasenia,Estado,FechaCreacion,UltimaModificacion,IdPermisos")] UsuarioSVPWeb usuarioSVPWeb)
        {
            if (ModelState.IsValid)
            {


                db.Entry(usuarioSVPWeb).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            return View(usuarioSVPWeb);
        }

        // GET: UsuarioSVPWeb/Delete/5
        public async Task<ActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UsuarioSVPWeb usuarioSVPWeb = await db.UsuarioSVPWebs.FindAsync(id);
            if (usuarioSVPWeb == null)
            {
                return HttpNotFound();
            }
            return View(usuarioSVPWeb);
        }

        // POST: UsuarioSVPWeb/Delete/5
        [HttpPost, ActionName("Delete")]
        public async Task<ActionResult> DeleteConfirmed(int id)
        {
            UsuarioSVPWeb usuarioSVPWeb = await db.UsuarioSVPWebs.FindAsync(id);
            db.UsuarioSVPWebs.Remove(usuarioSVPWeb);
            await db.SaveChangesAsync();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        [HttpPost]
        public ActionResult SaveUpdate(UsuarioSVPWeb _UsuarioSVPWeb, PermisosUsuario _PermisosUsuario)
        {
            string message1 = "";

            try
            {
                var usuweb = db.UsuarioSVPWebs.Find(_UsuarioSVPWeb.Id);
                usuweb.NumeroLegajo = _UsuarioSVPWeb.NumeroLegajo;
                usuweb.NombreApellido = _UsuarioSVPWeb.NombreApellido;
                usuweb.Estado = _UsuarioSVPWeb.Estado;
                if(_UsuarioSVPWeb.Contrasenia=="12345")
                {
                    usuweb.Contrasenia = _UsuarioSVPWeb.Contrasenia;
                    message1 = message1 + "Se establecio la contrasenia por defecto. ~";
                }
         
                usuweb.UltimaModificacion = DateTime.Now;
                message1 = message1 + "Se actualizaron los datos de este usuario web. ~";


                var permisouweb = db.PermisosUsuarios.Where(x => x.Id == _PermisosUsuario.Id).FirstOrDefault();
                permisouweb.NLegajoUsuario = _PermisosUsuario.NLegajoUsuario;

                permisouweb.InciR = _PermisosUsuario.InciR;
                permisouweb.InciRW = _PermisosUsuario.InciRW;

                permisouweb.WebR = _PermisosUsuario.WebR;
                permisouweb.WebRW = _PermisosUsuario.WebRW;

                permisouweb.MobileR = _PermisosUsuario.MobileR;
                permisouweb.MobileRW = _PermisosUsuario.MobileRW;

                permisouweb.GrillaPermisosR = _PermisosUsuario.GrillaPermisosR;

                message1 = message1 + "Se actualizaron los permisos para este usuario web. ~";

                permisouweb.UltimaModificacion = DateTime.Now;

                permisouweb.Estado = _UsuarioSVPWeb.Estado;

                if (ModelState.IsValid)
                {
                    db.Entry(usuweb).State = EntityState.Modified;
                    db.Entry(permisouweb).State = EntityState.Modified;

                    db.SaveChanges();

                }

                Response.Headers["JSonEdUWebResultado"] = message1;
                return Json(new { Result = message1 }, JsonRequestBehavior.AllowGet);
            }
            catch (System.Data.Entity.Validation.DbEntityValidationException dbEx)
            {
                Exception raise = dbEx;
                foreach (var validationErrors in dbEx.EntityValidationErrors)
                {
                    foreach (var validationError in validationErrors.ValidationErrors)
                    {
                        string message = string.Format("{0}:{1}",
                            validationErrors.Entry.Entity.ToString(),
                            validationError.ErrorMessage);
                        // raise a new exception nesting
                        // the current instance as InnerException
                        raise = new InvalidOperationException(message, raise);
                    }
                }
                throw raise;
            }          
        }
    }
}
