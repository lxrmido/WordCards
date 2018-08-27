import Vue from 'vue'
import App from './App.vue'
import injection from './lib/installer';

Vue.config.productionTip = false
Vue.use(injection);

injection.Vue = new Vue({
    render: h => h(App)
}).$mount('#app')
