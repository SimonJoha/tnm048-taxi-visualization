// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'
import App from './App'

Vue.config.productionTip = false

console.log(process.env);

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.GMAPS_API_KEY,
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
