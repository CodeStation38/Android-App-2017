//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace SVPWebApi.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class PermisosUsuario
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public PermisosUsuario()
        {
            this.UsuarioSVPWebs = new HashSet<UsuarioSVPWeb>();
        }
    
        public int Id { get; set; }
        public Nullable<int> NLegajoUsuario { get; set; }
        public Nullable<bool> InciR { get; set; }
        public Nullable<bool> InciRW { get; set; }
        public Nullable<bool> WebR { get; set; }
        public Nullable<bool> WebRW { get; set; }
        public Nullable<bool> MobileR { get; set; }
        public Nullable<bool> MobileRW { get; set; }
        public Nullable<bool> GrillaPermisosR { get; set; }
        public string Estado { get; set; }
        public Nullable<System.DateTime> FechaCreacion { get; set; }
        public Nullable<System.DateTime> UltimaModificacion { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<UsuarioSVPWeb> UsuarioSVPWebs { get; set; }
    }
}