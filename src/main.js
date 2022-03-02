/*
#    src/main.js is part of "Demo MisionTIC-2021 C4 - WebFrontend", 
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


import { createApp }                                   from 'vue'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { createApolloProvider }                        from '@vue/apollo-option'
import { setContext }                                  from 'apollo-link-context'
import App                                             from './App.vue'
import router                                          from './router'


const httpLink = createHttpLink({
    uri: 'https://misiontic-2022-api-gateway-ms.herokuapp.com/'
});

const authLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            "Authorization": localStorage.getItem("tokenAccess") || ""
        }
    }
})

const apolloClient = new ApolloClient({
    link : authLink.concat(httpLink),
    cache: new InMemoryCache()
})

const apolloProvider = new createApolloProvider({
    defaultClient: apolloClient
})


createApp(App).use(router).use(apolloProvider).mount('#app')