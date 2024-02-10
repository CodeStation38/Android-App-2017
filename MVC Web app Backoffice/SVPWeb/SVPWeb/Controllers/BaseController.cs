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

namespace SVPWeb.Controllers
{
    public class BaseController : Controller
    {
        public svpdesaEntities16 db = new svpdesaEntities16();        
    }
}