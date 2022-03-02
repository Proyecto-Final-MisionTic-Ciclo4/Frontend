/*
#    src/router.js is part of "Demo MisionTIC-2021 C4 - WebFrontend", 
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
*/


import { createRouter, createWebHashHistory }         from 'vue-router'
import gql                                            from 'graphql-tag'
import { ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client/core'

import Login                                          from './components/Login.vue'
import SignUp                                         from './components/SignUp.vue'
import Home                                           from './components/Home.vue'
import Account                                        from './components/Account.vue'
import Transaction                                    from './components/Transaction.vue'

const routes = [
  {
    path      : '/user/login',
    name      : "login",
    component : Login,
    meta      : {
      requiresAuth: false,
    }
  },
  {
    path      : '/user/signUp',
    name      : "signUp",
    component : SignUp,
    meta      : {
      requiresAuth: false,
    }
  },
  {
    path      : '/user/home',
    name      : "home",
    component : Home,
    meta      : {
      requiresAuth: true,
    }
  },
  {
    path      : '/user/account',
    name      : "account",
    component : Account,
    meta      : {
      requiresAuth: true,
    }
  },
  {
    path      : '/user/transaction',
    name      : "transaction",
    component : Transaction,
    meta      : {
      requiresAuth: true,
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});


const apolloClient = new ApolloClient({
  link : createHttpLink({
    uri: 'https://misiontic-2022-api-gateway-ms.herokuapp.com/'
  }),
  cache: new InMemoryCache()
});


async function isAuth(){
  if(localStorage.getItem("tokenRefresh") === null || localStorage.getItem("tokenAccess") === null) {
    return false;                    
  }

  try {
    var result = await apolloClient.mutate(
      {
        mutation: gql`
            mutation RefreshToken($token: Refresh!) {
              refreshToken(token: $token) {
                access
              }
            }
        `,
        variables: {
            token: {
                refresh: localStorage.getItem("tokenRefresh"),
            }
        }
      }
    )

    localStorage.setItem("tokenAccess", result.data.refreshToken.access);
    return true;
  }
  catch(error) {
    localStorage.clear();
    alert("Su sesión ha expirado. Por favor, ingrese nuevamente.");
    return false;
  }
}

router.beforeEach(async(to, from) => {
  console.log(`Redirecting from ${from.name} to ${to.name}...`);
  let is_auth = await isAuth();

  if(is_auth == to.meta.requiresAuth)
    return true;

  if(is_auth) 
    return { name: "home" };
  else 
    return { name: "login" };
});

export default router;