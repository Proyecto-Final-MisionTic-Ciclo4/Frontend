<template>
<!--
#    src/components/SignUp.vue is part of "Demo MisionTIC-2021 C4 - 
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

    <div class="signUpUser">
        <div class="containerSignUpUser">
            <h2>Registrarse</h2>
            <form v-on:submit.prevent="processSignUp" >
                <input type="text" v-model="user.username" placeholder="Username">
                <br>
                <input type="password" v-model="user.password" placeholder="Password">
                <br>
                <input type="text" v-model="user.name" placeholder="Name">
                <br>
                <input type="email" v-model="user.email" placeholder="Email">
                <br>
                <input type="number" v-model="user.balance" placeholder="Initial Balance">
                <br>
                <button type="submit">Registrarse</button>
            </form>
        </div>
    </div>
</template>

<script>
    import gql from 'graphql-tag';
    export default {
        name: "SignUp",

        data: function(){
            return {
                user: {
                    username : "",
                    password : "",
                    name     : "",
                    email    : "",
                    balance  : 0
                }
            }
        },

        methods: {
            validateJustCharacters: function(stringToValidate){
                const regex = /^[a-zA-Z]+$/;
                return regex.test(stringToValidate);
            },

            processSignUp: async function(){
                await this.$apollo.mutate(
                    {
                        mutation: gql`
                            mutation SignUpUser($userInput: SignUpInput) {
                              signUpUser(userInput: $userInput) {
                                refresh
                                access
                              }
                            }
                        `,
                        variables:{
                            userInput: this.user,
                        }
                    }
                )
                .then((result) => {
                    let dataSignUp = {
                        username     : this.user.username,
                        tokenRefresh : result.data.signUpUser.refresh,
                        tokenAccess  : result.data.signUpUser.access
                    };
                    console.log(dataSignUp);
                    this.$emit("completedSignUp", dataSignUp);
                })
                .catch((error) => {
                    console.log(error);
                    alert("ERROR. Fallo en el registro. Intente de nuevo.")
                })
            }
        }
    }
</script>

<style>
    .signUpUser{
        margin: 0;
        padding: 0%;
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .containerSignUpUser {
        border: 3px solid #283747;
        border-radius: 10px;
        width: 25%;
        height: 60%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .signUpUser h2{
        color: #283747;
    }

    .signUpUser form{
        width: 70%;
    }

    .signUpUser input{
        height: 40px;
        width: 100%;
        box-sizing: border-box;
        padding: 10px 20px;
        margin: 5px 0;
        border: 1px solid #283747;
    }

    .signUpUser button{
        width: 100%;
        height: 40px;
        color: #E5E7E9;
        background: #283747;
        border: 1px solid #E5E7E9;
        border-radius: 5px;
        padding: 10px 25px;
        margin: 5px 0 25px 0;
    }

    .signUpUser button:hover{
        color: #E5E7E9;
        background: crimson;
        border: 1px solid #283747;
    }
</style>