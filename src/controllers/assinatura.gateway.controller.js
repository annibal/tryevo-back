const config = require("../config");
const mongoose = require("mongoose");
const sdk = require('api')('@devpagbank/v4.0#1fhxsj3ilqxywcdo');
const axios = require('axios');
const precopag = require("../helpers/precoformater");

const {getSingleUser} = require("./auth.controller");


const PlanAssSchema = require("../schemas/plano-assinatura.schema");
const UsuarioSchema = require("../schemas/usuario.schema");

const PlanAssModel = mongoose.model("PlanoAssinatura", PlanAssSchema);
const UsuarioModel = mongoose.model("Usuario", UsuarioSchema);


const pagBankheaders = {
    headers: {Authorization: `Bearer ${config.pagbanktoken}`}
}

const createPlanInGateway = async (plan_id) => {


};

const createCustomerInGateway = async (user_id) => {

};

const createSubscriptionInGateway = async (user_id, plan_id) => {

};

exports.syncPlansInGateway = async (req, res) => {

    // if(req.usuario.isMasterAdmin){
    const search = {gateway_id: null, active: true};

    for await (let plan of PlanAssModel.find(search)) {
        if (plan.preco > 1.0) {
            console.log("Synchonizing plan: " + plan)
            const body = {
                name: plan.nome,
                amount: {
                    value: precopag(plan.preco),
                    currency: 'BRL'
                },
                interval: {unit: 'MONTH', length: 1},
                trial: {enabled: false, hold_setup_fee: false},
                payment_method: ['CREDIT_CARD']
            }
            axios.post(`${config.pagbankurl}/plans`, body, pagBankheaders)
                .then(({data}) => plan.set('gateway_id', data.id))
                .catch(function (error) {
                    if (error.response) {
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        console.log(error.request);
                    } else {
                        console.log('Error', error.message);
                    }
                    console.log(error.config);
                })

            await PlanAssModel.findByIdAndUpdate(plan._id, plan, {
                new: true,
                runValidators: true,
            });
        }
    }
    /*} else {
      throw new Error("É necessário ser admin pra sincronizar planos com o gateway de pagamento.")
    }*/
}



