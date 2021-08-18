import card from "./card.js";
import board from "./board.js";
import workitem from "./workitem.js";
import appHome from "./appHome.js";
import hovercontrol from "./hovercontrol.js";

var vueApp =Vue.createApp({
	  el: '#vueapp',
	data: function(){ return {
	}},
	methods:{			
	},
	mounted:  async function(){  
	}});
	
const routes = [
  { path: '/:pathMatch(.*)*', name: 'not-found', component: appHome },
	]
const router =  VueRouter.createRouter({
  routes,
history: VueRouter.createWebHistory()
});
vueApp.component('card',card);
vueApp.component('workitem',workitem);
vueApp.component('board',board);
vueApp.component('appHome',appHome);
vueApp.component('hovercontrol',hovercontrol);
vueApp.use(router);

vueApp.mount('#vueapp');