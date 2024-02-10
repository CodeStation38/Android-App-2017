using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web;
using System.Web.Mvc;
using SVPWebApi.Models;

namespace SVPWebApi.Controllers
{
    public class BaseController : ApiController
    {
        public svpdesaEntities7 db = new svpdesaEntities7();
    }
}