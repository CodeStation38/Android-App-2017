using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Http.Description;
using System.Diagnostics;
using System.Web.UI.WebControls;
using SVPWebApi.Models;
using System.Drawing;
using System.IO;
using System.Configuration;

namespace SVPWebApi.Controllers
{
    public class UploadController : BaseController
    {

        [AcceptVerbs("POST")]
        [Route("user/CrearUsuarioMovil")]
        [AllowAnonymous]
        public async Task<HttpResponseMessage> CrearUsuarioMovil
        (
                int nlegajo,
                string pass,
                string phoneUUID
        )
            {


                SVPApiManager.SVPApiManager manager = new SVPApiManager.SVPApiManager();
                try
                {

                    int nuevousuariomovil = manager.CrearUsuarioSVPMobile(
                                                  nlegajo,
                                                  pass,
                                                  phoneUUID,
                                                  db
                                              );


                    if(nuevousuariomovil==-3)
                    {
                        //RETORNA CODIGO REINSTALACION EN EL MISMO TELEFONO    
                        var ouSVPMovil = db.UsuarioSVPMobiles.Where(r => r.NumeroLegajo == nlegajo).FirstOrDefault();
                        //PASA DEL ESTADO "L" AL "A"
                        ouSVPMovil.Estado = "A";
                        if (ModelState.IsValid)
                        {
                            db.Entry(ouSVPMovil).State = EntityState.Modified;
                            db.SaveChanges();

                        }
                    }

                    //var message1 = string.Format("Incidencia creada.");    
                    var message1 = string.Format(Convert.ToString(nuevousuariomovil));
                    return Request.CreateResponse(HttpStatusCode.Created, message1);

                }
                catch (Exception ex)
                {
                    var exep = ex.Message;
                    var stack = ex.StackTrace;

                    //var res = string.Format("Error al crear la incidencia.");
                    var res = "EXECP: " + exep + " STACKTRACE: " + stack;
                    //dict.Add("error", res);
                    //ENVIAR MAIL DE SEGUIMIENTO AQUI
                    return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, res);
                }
            }

    }
}