import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Rol } from 'src/app/Interfaces/rol';
import { Usuario } from 'src/app/Interfaces/usuario';
import { RolService } from 'src/app/Services/rol.service';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Services/utilidad.service';

@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html',
  styleUrls: ['./modal-usuario.component.css']
})
export class ModalUsuarioComponent implements OnInit {

  //variables
  formularioUsuario: FormGroup;
  ocultarPassword: boolean = true;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar"
  listaRoles: Rol[] = [];

  constructor(
    private modalActual: MatDialogRef<ModalUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public datosUsuario: Usuario,
    private fb: FormBuilder,
    private _rolServicio: RolService,
    private _usuarioServicio: UsuarioService,
    private _utilidadServicio: UtilidadService
  ) {
    this.formularioUsuario = this.fb.group({
      nombreCompleto: ['', Validators.required],
      correo: ['', Validators.required],
      id_Rol: ['', Validators.required], // Change this line to use lowercase 'id_Rol'
      clave: ['', Validators.required],
      esActivo: ['1', Validators.required]
    });

    if (this.datosUsuario != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    this._rolServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          this.listaRoles = data.value
        }

      },
      error: (e) => { }
    })
  }

  ngOnInit(): void {
    if (this.datosUsuario != null) {
      this.formularioUsuario.patchValue({
        nombreCompleto: this.datosUsuario.nombreCompleto,
        correo: this.datosUsuario.correo,
        id_Rol: this.datosUsuario.id_Rol,
        clave: this.datosUsuario.clave,
        esActivo: this.datosUsuario.esActivo.toString()
      })
    }
  }

  guardarEditar_Usuario() {
     // Check if the roles are loaded before proceeding with the save
     if (this.listaRoles.length === 0) {
      // Roles are not loaded yet, show an error or a loading message to the user
      return;
    }

    const selectedRoleId = this.formularioUsuario.value.id_Rol;
    console.log('Selected Role ID:', selectedRoleId);

    const selectedRole = this.listaRoles.find((rol) => rol.id_Rol === selectedRoleId);
    console.log('Selected Role:', selectedRole);

    const _usuario: Usuario = {
      id_Usuario: this.datosUsuario == null ? 0 : this.datosUsuario.id_Usuario,
      nombreCompleto: this.formularioUsuario.value.nombreCompleto,
      correo: this.formularioUsuario.value.correo,
      id_Rol: selectedRoleId,
      rolDescripcion: selectedRole ? selectedRole.nombre : '',
      clave: this.formularioUsuario.value.clave,
      esActivo: parseInt(this.formularioUsuario.value.esActivo)
    }

    if (this.datosUsuario == null) {
      this._usuarioServicio.guardar(_usuario).subscribe({
        next: (data) =>{
          if (data.status) {
            this._utilidadServicio.mostrarAlerta("El Usuario Fue Registrado","Exito");
            this.modalActual.close("true")
          }
          else {
            this._utilidadServicio.mostrarAlerta("No se pudo registrar el usuario", "Error")
          }
        },
        error:(e) =>{}
      })
    }
    else {
      this._usuarioServicio.editar(_usuario).subscribe({
        next: (data) =>{
          if (data.status) {
            this._utilidadServicio.mostrarAlerta("El Usuario Fue Editado","Exito");
            this.modalActual.close("true")
          }
          else {
            this._utilidadServicio.mostrarAlerta("El usuario no se pudo editar", "Error")
          }
        },
        error:(e) =>{}
      })
    }
  }

}