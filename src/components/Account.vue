<template>
<!--
#    src/components/Account.vue is part of "Demo MisionTIC-2021 C4 - 
#    WebFrontend", created by Carlos Andrés Sierra.
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

    <div id="historial">
        <div class="container">
            <h2>
                Titular de la Cuenta:
                <span> {{ username }} </span>
            </h2>
            <h2>
                Saldo:
                <span>${{ accountByUsername.balance }} COP</span>
            </h2>
            <h2>
                Último Movimiento:
                <span>
                    {{ accountByUsername.lastChange.substring(0, 10) }}
                    {{ accountByUsername.lastChange.substring(11, 19) }} UTC
                </span>
            </h2>
        </div>

        <h2>Transacciones</h2> 
        <select v-model="destinyUsername" v-on:change="reloadFilter">
            <option value="all" selected>Cualquier usuario de destino</option>
            <option v-for="user in transactionUsersDestiny" :key="user" :value="user">{{ user }}</option>
        </select>
        <div class="container-table">
            <table>
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Valor</th>
                    <th>Nota</th>
                    <th>Editar</th>
                    <th>Eliminar</th>
                </tr>
                <template v-if="transactionByUsername.length">
                    <tr v-for="transaction in transactions" :key="transaction.id" >
                        <td>{{ 
                            (new Date(transaction.date)).toLocaleString("es-CO", {timeZone: `${userDetailById.timeZone}`}).split(",")[0]
                         }}</td>
                        <td>{{ 
                            (new Date(transaction.date)).toLocaleString("es-CO", {timeZone: `${userDetailById.timeZone}`}).split(", ")[1]
                        }}</td>
                        <td>{{ transaction.usernameOrigin }}</td>
                        <td>{{ transaction.usernameDestiny }}</td>
                        <td>${{ transaction.value }} COP</td>
                        <td>{{ transaction.note }}</td>
                        <td></td>
                        <td><i v-if="transaction.usernameOrigin == username" v-on:click="deleteTransaction(transaction.id)">Eliminar</i></td>
                    </tr>
                </template>
                <template v-else>
                    <tr>
                        <td colspan="8">Usted no tiene reportado ningún tipo de transacción.</td>
                    </tr>
                </template>
            </table>
        </div>
    </div>
</template>


<script>
    import gql        from 'graphql-tag';
    import jwt_decode from 'jwt-decode';

    export default{
        name: "Account",

        data: function(){
            return {
                userId: jwt_decode( localStorage.getItem("tokenRefresh") ).user_id,
                username: localStorage.getItem("username") || "none",
                transactionByUsername: [],
                accountByUsername: {
                    balance: 0,
                    lastChange: ""
                },
                userDetailById: {
                    timeZone : ""
                },
                destinyUsername: "all",
                transactionUsersDestiny: []
            }
        },

        computed: {
            transactions: function() {
                let destiny = this.destinyUsername;
                if(destiny == "all")
                    return this.transactionByUsername;
                else {
                    let listTransactions = [];
                
                    this.transactionByUsername.forEach(function(transaction) {
                        if(transaction.usernameDestiny == destiny)
                            listTransactions.push(transaction);
                    })
                    return listTransactions;
                }
            },
        },

        methods: {
            deleteTransaction: async function(id_){
                console.log(id_);

                await this.$apollo.mutate(
                    {
                        mutation: gql`
                            mutation DeleteTransaction($transactionId: String!) {
                              deleteTransaction(transactionId: $transactionId)
                            }
                        `,
                        variables: {
                            transactionId: id_
                        }
                    }
                )
                .then((result) => {
                    console.log(result);
                })
                .catch((error) => {
                    console.log(error);
                })

                this.$apollo.queries.transactionByUsername.refetch();
                this.$apollo.queries.accountByUsername.refetch();
            },

            reloadFilter: function(){
                this.$apollo.queries.transactionByUsername.refetch();
                this.$apollo.queries.accountByUsername.refetch();
            }
        },

        apollo: {
            transactionByUsername: {
                query: gql`
                    query Query($username: String!) {
                      transactionByUsername(username: $username) {
                        id
                        usernameOrigin
                        usernameDestiny
                        value
                        note
                        date
                      }
                    }
                `,
                variables() {
                    return {
                        username: this.username,
                    };
                }
            },

            accountByUsername: {
                query: gql`
                    query Query($username: String!) {
                      accountByUsername(username: $username) {
                        balance
                        lastChange
                      }
                    }
                `,
                variables() {
                    return {
                        username: this.username,
                    };
                }
            },

            userDetailById: {
                query: gql`
                    query UserDetailById($userId: Int!) {
                        userDetailById(userId: $userId) {
                            timeZone
                        }
                    }
                `,
                variables() {
                    return {
                        userId: this.userId,
                    };
                }
            },

            transactionUsersDestiny: {
                query: gql`
                    query UsersDestiny($username: String!) {
                      transactionUsersDestiny(username: $username)
                    }
                `,
                variables() {
                    return {
                        username: this.username,
                    };
                }
            }
        },

        created: function(){
            this.$apollo.queries.transactionByUsername.refetch();
            this.$apollo.queries.accountByUsername.refetch();
        }
    }
</script>


<style>
    #historial {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: column;
    }

    #historial .container-table{
        width:60%;
        max-height: 250px;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    #historial table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid rgba(0, 0, 0, 0.3);
    }

    #historial table td,
    #historial table th {
        border: 1px solid #ddd;
        padding: 8px;
    }

    #historial table tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    #historial table tr:hover {
        background-color: #ddd;
    }

    #historial table th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: crimson;
        color: white;
    }

    #historial > h2 {
        color: #283747;
        font-size: 25px;
    }

    #historial .container {
        padding: 30px;
        border: 3px solid rgba(0, 0, 0, 0.3);
        border-radius: 20px;
        margin: 5% 0 1% 0;
    }

    #historial .container h2 {
        font-size: 25px;
        color: #283747;
    }

    #historial .container span {
        color: crimson;
        font-weight: bold;
    }
</style>