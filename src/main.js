import { createApp } from "vue";
import { createPinia } from "pinia";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import router from "./router";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.vue";

const vuetify = createVuetify({ components, directives });

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(vuetify);
app.mount("#app");
