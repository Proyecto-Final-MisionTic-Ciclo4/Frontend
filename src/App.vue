<template>
<!--
#    src/App.vue is part of "Demo MisionTIC-2021 C4 - WebFrontend", 
#    created by Carlos Andrés Sierra.
#
#    "Demo MisionTIC-2021 C4 - WebFrontend" is free software: 
#    you can redistribute it and/or modify it under the terms of the 
#    GNU General Public License as published by the Free Software Foundation, 
#    either version 3 of the License, or (at your option) any later version.
#
#    "Demo MisionTIC-2021 C4 - WebFrontend" is distributed in 
#    the hope that it will be useful, but WITHOUT ANY WARRANTY; 
#    without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
#    PARTICULAR PURPOSE.  See the GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with "Demo MisionTIC-2021 C4 - WebFrontend". 
#    If not, see <https://www.gnu.org/licenses/>.
#
#    For contact, you can write to casierrav@unal.edu.co
-->

  <div id="app" class="app">
    <div class="header">
      <h1>Banco<br />MT2021-C4</h1>
      <nav>
        <button v-if="isAuth" v-on:click="loadHome"> Inicio </button>
        <button v-if="isAuth" v-on:click="loadAccount"> Cuenta </button>
        <button v-if="isAuth" v-on:click="loadTransaction"> Transacción </button>
        <button v-if="isAuth" v-on:click="logOut"> Cerrar Sesión </button>

        <button v-if="!isAuth" v-on:click="loadLogIn"> Iniciar Sesión </button>
        <button v-if="!isAuth" v-on:click="loadSignUp"> Registrarse </button>
      </nav>
    </div>

    <div class="main-component">
      <router-view
        v-on:completedLogIn="completedLogIn"
        v-on:completedSignUp="completedSignUp"
        v-on:completedTransaction="completedTransaction"
        v-on:logOut="logOut"
      >
      </router-view>
    </div>

    <div class="footer">
      <h2>MisionTic 2022 - C4</h2>
    </div>
  </div>
</template>


<script>
  export default{
    name: 'App',

    computed: {
      isAuth: {
        get: function() {
          return this.$route.meta.requiresAuth;
        },
        set: function() {

        }
      }
    },

    methods:{
      loadHome: function(){
        this.$router.push({name: "home"});
      },

      loadAccount: function(){
        this.$router.push({name: "account"});
      },

      loadTransaction: function(){
        this.$router.push({name: "transaction"});
      },

      logOut: function(){
        localStorage.clear();
        alert("Sesión terminada");
        this.loadLogIn();
      },

      loadLogIn: function(){
        this.$router.push({name: "login"})
      },

      loadSignUp: function(){
        this.$router.push({name: "signUp"})
      },

      completedLogIn: function(data){
        localStorage.setItem('username', data.username);
        localStorage.setItem('tokenRefresh', data.tokenRefresh);
        localStorage.setItem('tokenAccess', data.tokenAccess);
        alert("Autenticación exitosa");
        this.loadHome();
      },

      completedSignUp: function(data){
        alert("Registro exitoso");
        this.completedLogIn(data);
      },

      completedTransaction: function(){
        this.loadAccount();
      },
    },

    created: function(){
    }
  }
</script>

<style>
  body {
    max-width: 0 0 0 0;
  }

  .header{
    margin: 0;
    padding: 0;
    width: 100%;
    height: 10vh;
    min-height: 100px;
    background-color: #283747 ;
    color:#E5E7E9 ;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header h1{
    width: 20%;
    text-align: center;
  }

  .header nav {
    height: 100%;
    width: 30%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    font-size: 20px;
  }

  .header nav button{
    color: #E5E7E9;
    background: #283747;
    border: 1px solid #E5E7E9;
    border-radius: 5px;
    padding: 10px 20px;
  }

  .header nav button:hover{
    color: #283747;
    background: #E5E7E9;
    border: 1px solid #E5E7E9;
  }

  .main-component{
    height: 75vh;
    margin: 0%;
    padding: 0%;
    background: #FDFEFE ;
    align-content: center;
  }

  .footer{
    margin: 0;
    padding: 0;
    width: 100%;
    height: 10vh;
    min-height: 100px;
    background-color: #283747;
    color: #E5E7E9;
  }

  .footer h2{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>s