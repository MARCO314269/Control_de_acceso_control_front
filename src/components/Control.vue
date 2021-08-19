<template>
  <div class="container my-5">
    <img :src="video" class="video" alt="..." />
    <br /><br />
    <div class="form-inline">
      <button type="button" @click="submition2" class="btn btn-primary mr-2">
        Registrar ingreso
      </button>
    </div>
    <br /><br />
    <div class="row">
      <table class="table table-hover table-sm table-striped">
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Fecha Ingreso</th>
            <th scope="col">Fecha Límite</th>
            <th scope="col">Tiempo restante</th>
            <th scope="col">Estatus</th>
          </tr>
        </thead>
        <tbody v-for="oa in resultadoFinal" :key="oa.id_visita">
          <tr @click="openRev(oa.id_visita)">
            <td>{{ oa.nombre }}</td>
            <td>{{ oa.fecha_ingreso_visitante }}</td>
            <td>{{ oa.fecha_fin }}</td>
            <td>
              <vue-countdown-timer
                :start-time="start_at ? start_at : startAt"
                :end-time="end_at ? end_at : oa.fecha_fin"
                :interval="1000"
                :end-text="'TIEMPO FINALIZADO'"
                :day-txt="'dias '"
                :hour-txt="':'"
                :minutes-txt="':'"
                :seconds-txt="''"
              >
              </vue-countdown-timer>
            </td>
            <td class="center">
              <h4>
                <span
                  v-if="oa.alerta_tiempo_visita_activa == 0"
                  class="badge badge-success ml-4"
                  >Visita activa</span
                ><span v-else class="badge badge-danger">Tiempo excedido</span>
              </h4>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--  end row -->

    <!--  modal info visitante -->
    <modal
      ref="my-modal"
      name="info-visitate"
      :reset="true"
      hide-footer
      hide-header
      :width="560"
      :height="600"
    >
      <div class="card-body">
        <div>
          <div class="row">
            <div class="col-6">
              <h4 style="text-align: center">Detalle de la visita</h4>
              <table class="table table-bordered table-striped mb-0">
                <tbody
                  v-for="(value, key) in resultadoConsulta"
                  :key="key"
                  class="inf_visit"
                >
                  <tr v-if="key != 'id_visita'">
                    <td>{{ key }}:</td>
                    <td>{{ value }}</td>
                  </tr>
                </tbody>
                <tr>
                  <td
                    colspan="2"
                    style="text-align: right; background-color: white"
                  >
                    <b-button
                      variant="primary"
                      @click="RegistrarSalida(resultadoConsulta.id_visita)"
                      >Registrar salida</b-button
                    >
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="mr-3" style="text-align: right"></div></modal
    ><!-- ends modal-->

    <!--  modal confirmar salida -->
    <modal
      name="registrarSalida"
      :clickToClose="false"
      :reset="true"
      :width="480"
      :height="200"
    >
      <div class="card">
        <div class="card-header">Registrar Salida</div>
        <div class="card-body">
          <p class="card-text">¿Está seguro que desea registar la salida?</p>
          <div class="my-4" style="text-align: right">
            <b-button variant="primary" class="mr-4" @click="confirmarSalida"
              >Si</b-button
            >
            <b-button variant="secondary" class="mr-4" @click="closeModalSalida"
              >Cerrar</b-button
            >
          </div>
        </div>
      </div> </modal
    ><!-- ends modal-->
    <!--  modal error -->
    <modal
      name="modal-error"
      :clickToClose="true"
      :reset="true"
      :width="480"
      :height="200"
    >
      <p class="card-text">{{ mensaje_error }}</p> </modal
    ><!-- ends modal-->
  </div>
</template>

<script>
import axios from "axios";
import store from "../store";
import * as moment from "moment";
import Vue from "vue";

export default {
  name: "Main",
  data() {
    return {
      video: process.env.VUE_APP_VIDEO_STREAMING,
      datos_QR: {},
      infovisitante: null,
      id_visita: "",
      countdown: null,
      expires_in: null,
      interval: null,
      mensaje_error: "",
      fecha_fin: null,
      fecha_inicio: null,
      permiso_ingreso: false,
      resultadoFinal: [],
      resultadoConsulta: {
        id_visita: "",
        EVENTO: "this.resultadoFinal.nombre_visita",
        CONDOMINIO: "this.resultadoFinal.id_condominio",
        NOMBRE: "this.resultadoFinal.nombre",
        "APELLIDO PATERNO": "this.resultadoFinal.apellido_paterno",
        "APELLIDO MATERNO": "this.resultadoFinal.apellido_materno",
        "TELEFONO CELULAR": "this.resultadoFinal.telefono_celular",
        "TELEFONO PARTICULAR": "this.resultadoFinal.telefono_particular",
        EMAIL: "this.resultadoFinal.email",
        "NOMBRE CONTACTO DE EMERGENCIA":
          "this.resultadoFinal.nombre_contacto_emergencia",
        "NUMERO DE EMERGENCIA": "this.resultadoFinal.numero_emergencia",
      },
      objetoActual: [],
      fecha_salida_visitante: null,
      startAt: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
      fecha_fin_set: null,
      id_visita_aux: "",
      start_at: null,
      end_at: null,
      visitas: {
        id_visita: "",
        id_visitante: "",
        uuid_visitante: "",
        resultado_reconocimiento: {
          id: "0",
          prob: 0,
        },
      },
    };
  },
  mounted() {
    this.actualizarTabla();
  },
  methods: {
    obtenerResultadosReconocimientoFacial() {
      const path_video_vigilancia = "/api/videos_vigilancia/results";
      axios
        .get(path_video_vigilancia)
        .then((response) => {
          this.visitas.resultado_reconocimiento = response.data;
        })
        .catch((error) => {
          this.mensaje_error = "El rostro no se ha identificado correctamente";
          console.log(error);
          Vue.$toast.open({
            message: this.mensaje_error,
            type: "error",
            duration: 8000,
          });
          store.commit("setSession", {});
        });
    },
    obtenerDatosCodigoQR() {
      const path_QR = "/api/videos_vigilancia/QR";
      axios
        .get(path_QR)
        .then((response) => {
          this.datos_QR = response.data.data;
        })
        .catch((error) => {
          this.mensaje_error = "El código QR no se ha leído correctamente";
          console.log(error);
          Vue.$toast.open({
            message: this.mensaje_error,
            type: "error",
            duration: 8000,
          });
          store.commit("setSession", {});
        });
    },
    obtenerDatosVisitaIngreso() {
      axios
        .get(this.datos_QR[0])
        .then((response) => {
          this.visitas.id_visita = response.data.id_visita;
          this.visitas.id_visitante = response.data.id_visitante;
          this.visitas.uuid_visitante = response.data.uuid_visitante;
          this.fecha_fin = response.data.fecha_fin;
          this.enviarValidacion();
        })
        .catch((error) => {
          this.mensaje_error = "Código QR inválido";
          console.log(error);
          Vue.$toast.open({
            message: this.mensaje_error,
            type: "error",
            duration: 8000,
          });
          store.commit("setSession", {});
        });
    },
    submition2() {
      this.obtenerResultadosReconocimientoFacial();
      this.obtenerDatosCodigoQR();

      if (!this.datos_QR[0]) {
        this.mensaje_error = "No se ha detectado QR";
        Vue.$toast.open({
          message: this.mensaje_error,
          type: "error",
          duration: 2000,
        });
      } else if (this.visitas.resultado_reconocimiento.id == "") {
        this.mensaje_error = "No se ha detectado ningún rostro";
        Vue.$toast.open({
          message: this.mensaje_error,
          type: "error",
          duration: 2000,
        });
      } else {
        this.obtenerDatosVisitaIngreso();
      }
    },
    enviarValidacion() {
      if (this.datos_QR[0]) {
        axios
          .put(this.datos_QR[0], this.visitas)
          .then((response) => {
            this.permiso_ingreso = response.data.permiso_ingreso;
            this.actualizarTabla();
            if (this.permiso_ingreso == true) {
              Vue.$toast.open({
                message: response.data.mensaje,
                type: "info",
                duration: 8000,
              });
            } else {
              Vue.$toast.open({
                message: response.data.mensaje,
                type: "warning",
                duration: 8000,
              });
            }
          })
          .catch((error) => {
            this.mensaje_error = "No encontre información";
            console.log(error);
            Vue.$toast.open({
              message: this.mensaje_error,
              type: "error",
              duration: 8000,
            });
            store.commit("setSession", {});
          });
      }
    },
    realTimeInfo(nuevoObjeto) {
      this.objetoActual.push(nuevoObjeto);
    },
    openRev(id_visita) {
      const path_visitas_ingreso = "/api/visitas-ingreso/" + id_visita;
      axios.get(path_visitas_ingreso).then((response) => {
        this.resultadoConsulta["id_visita"] = response.data.id_visita;
        this.resultadoConsulta["EVENTO"] = response.data.nombre_visita;
        this.resultadoConsulta["CONDOMINIO"] = response.data.id_condominio;
        this.resultadoConsulta["NOMBRE"] = response.data.nombre;
        this.resultadoConsulta["APELLIDO PATERNO"] =
          response.data.apellido_paterno;
        this.resultadoConsulta["APELLIDO MATERNO"] =
          response.data.apellido_materno;
        this.resultadoConsulta["TELEFONO CELULAR"] =
          response.data.telefono_celular;
        this.resultadoConsulta["TELEFONO PARTICULAR"] =
          response.data.telefono_particular;
        this.resultadoConsulta["EMAIL"] = response.data.email;
        this.resultadoConsulta["NOMBRE CONTACTO DE EMERGENCIA"] =
          response.data.nombre_contacto_emergencia;
        this.resultadoConsulta["NUMERO DE EMERGENCIA"] =
          response.data.numero_emergencia;
      });
      this.$modal.show("info-visitate");
    },
    closeModalRev: function () {
      this.$modal.hide("info-visitate");
    },
    RegistrarSalida(id_visita) {
      this.id_visita_aux = id_visita;
      this.$modal.show("registrarSalida");
    },
    confirmarSalida() {
      const path_visitas_salida = "/api/visitas-salida/" + this.id_visita_aux;
      var fecha_actual = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
      axios
        .put(path_visitas_salida, {
          id_visita: this.id_visita_aux,
          fecha_salida_visitante: fecha_actual,
        })
        .then((response) => {
          console.log(response);
          this.actualizarTabla();
          this.$modal.hide("registrarSalida");
          this.$modal.hide("info-visitate");
        })
        .catch((error) => {
          this.mensaje_error = "Hubo un error al registrar la salida";
          console.log(error);
          Vue.$toast.open({
            message: this.mensaje_error,
            type: "error",
            duration: 5000,
          });
          store.commit("setSession", {});
        });
    },
    closeModalSalida: function () {
      this.$modal.hide("registrarSalida");
    },
    actualizarTabla() {
      const path_visitas_activas = "/api/visitas-activas";
      axios
        .get(path_visitas_activas)
        .then((response) => {
          this.resultadoFinal = response.data;
        })
        .catch((error) => {
          this.mensaje_error =
            "Existe un problema con el servidor. Intenta nuevamente.";
          Vue.$toast.open({
            message: this.mensaje_error,
            type: "error",
            duration: 8000,
          });
          console.log(this.mensaje_error);
          console.log(error);
          store.commit("setSession", {});
        });
    },
  },
};
</script>

<style scoped>
.inf_visit > tr > td:first-child {
  min-width: 300px;
}
.video {
  height: auto;
  width: auto;
}
</style>