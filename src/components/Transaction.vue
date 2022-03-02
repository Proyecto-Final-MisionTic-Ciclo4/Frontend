<template>
<!--
#    src/components/Transaction.vue is part of "Demo MisionTIC-2021 C4 - 
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

    <div id="transaction" class="transaction">
        <div class="container_transaction">
            <h2>Realizar Transacción</h2>

            <form v-on:submit.prevent="processTransaction">
                <div class="autocomplete">
                    <input type="text" v-model="transaction.usernameDestiny" placeholder="Usuario Destino" 
                        @input="onChange" @keydown.down="onArrowDown" @keydown.up="onArrowUp"
                    />
                    <ul v-show="isOpen" class="autocomplete-results" id="autocomplete-results">
                        <li v-for="(result, i) in results" :key="i" @click="setResult(result)"  class="autocomplete-result" :class="{ 'is-active': i === arrowCounter }">
                            {{result.username}}
                        </li>
                    </ul>
                </div>
                <input type="number" v-model="transaction.value" placeholder="Valor" />
                <br />
                <input type="text" v-model="transaction.note" placeholder="Nota (Opcional)" />
                <br />
                <button type="submit">Enviar</button>
            </form>
        </div>
    </div>
</template>

<script>
    import gql        from 'graphql-tag';
    import jwt_decode from 'jwt-decode';

    export default {
        name: "Transaction",

        data: function() {
            return {
                userId: jwt_decode( localStorage.getItem("tokenRefresh") ).user_id,
                transaction: {
                    usernameOrigin  : localStorage.getItem("username"),
                    usernameDestiny : "",
                    value           : 0,
                    note            : ""
                },
                results: [],
                isOpen: false,
                userOtherAccounts: [],
                arrowCounter: -1
            };
        },

        mounted() {
            document.addEventListener('click', this.handleClickOutside);
        },

        unmounted() {
            document.removeEventListener('click', this.handleClickOutside);
        },

        methods: {
            processTransaction: async function() {
                if(this.transaction.value > 0) {
                    if(localStorage.getItem("tokenRefresh")===null || localStorage.getItem("tokenAccess")===null) {
                        this.$emit("logOut");
                        return;
                    }

                    localStorage.setItem("tokenAccess", "");
                    await this.$apollo.mutate(
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
                    .then((result) => {
                        localStorage.setItem("tokenAccess", result.data.refreshToken.access);
                    })
                    .catch((error) => {
                        console.log(error);
                        this.$emit("logOut");
                        return;
                    })

                    if(localStorage.getItem("tokenAccess")!="" && localStorage.getItem("tokenAccess")!=null) {
                        await this.$apollo.mutate(
                            {
                                mutation: gql`
                                    mutation Transaction($transaction: TransactionInput!) {
                                      createTransaction(transaction: $transaction) {
                                        id
                                        usernameOrigin
                                        usernameDestiny
                                        value
                                        note
                                        date
                                      }
                                    }
                                `,
                                variables: {
                                    transaction: this.transaction,
                                }
                            }
                        )
                        .then((result) => {
                            let message = `Transacción realizada correctamente.\n\nMonto: $${result.data.createTransaction.value} COP\nUsuario Destino: ${result.data.createTransaction.usernameDestiny}\nNúmero Referencia: ${result.data.createTransaction.id}`;
                            alert(message);
                            this.$emit("completedTransaction");
                        })
                        .catch((error) => {
                            if(error.message == "409: Conflict")
                                alert("Saldo insuficiente.");
                            else if(error.message == "404: Not Found")
                                alert("Destino incorrecto.");
                            else
                                alert("Problema inesperado en el sistema. Intente de nuevo.");
                        })
                    }
                    else
                        alert("Hubo un problema con sus credenciales de acceso. Ingrese al sistema de nuevo.")
                }
                else
                    alert("El valor de la transacción debe ser mayor a cero.")
            },

            filterResults: function() {
                this.results = this.userOtherAccounts.filter(item => item.username.toLowerCase().indexOf(this.transaction.usernameDestiny.toLowerCase()) > -1);
            },
            onChange() {
                this.filterResults();
                this.isOpen = true;
            },
            setResult(result) {
              this.transaction.usernameDestiny = result.username;
              this.isOpen = false;
            },

            handleClickOutside(event) {
              if (!this.$el.contains(event.target)) {
                this.isOpen = false;
              }
            },
            onArrowDown() {
              if (this.arrowCounter < this.results.length) {
                this.arrowCounter = this.arrowCounter + 1;
              }
            },
            onArrowUp() {
              if (this.arrowCounter > 0) {
                this.arrowCounter = this.arrowCounter - 1;
              }
            },
        },

        apollo: {
            userOtherAccounts: {
                query: gql`
                    query UserOtherAccounts($userId: Int!) {
                      userOtherAccounts(userId: $userId) {
                        username
                      }
                    }
                `,
                variables(){
                    return {
                        userId: this.userId,
                    };
                }
            }
        }
    }
</script>

<style >
    .transaction {
        margin: 0;
        padding: 0%;
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .container_transaction {
        border: 3px solid #283747;
        border-radius: 10px;
        width: 25%;
        height: 60%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .transaction h2 {
        color: #283747;
    }

    .transaction form {
            width: 50%;
    }

    .transaction input {
        height: 40px;
        width: 100%;
        box-sizing: border-box;
        padding: 10px 20px;
        margin: 5px 0;
        border: 1px solid #283747;
    }

    .transaction button {
        width: 100%;
        height: 40px;
        color: #e5e7e9;
        background: #283747;
        border: 1px solid #e5e7e9;
        border-radius: 5px;
        padding: 10px 25px;
        margin: 5px 0;
    }

    .transaction button:hover {
        color: #e5e7e9;
        background: crimson;
        border: 1px solid #283747;
    }

    .autocomplete {
        position: relative;
    }

    .autocomplete-results {
        padding: 0;
        margin: 0;
        overflow: auto;
    }

    .autocomplete-result {
        list-style: none;
        text-align: left;
        padding: 4px 2px;
        cursor: pointer;
    }

    .autocomplete-result.is-active,
    .autocomplete-result:hover {
        background-color: crimson;
        color: white;
    }
</style>