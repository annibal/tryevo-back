const config = require("../config");
const mongoose = require("mongoose");
const axios = require('axios');
const precopag = require("../helpers/precoformater");

const PlanAssSchema = require("../schemas/plano-assinatura.schema");
const PlanAssModel = mongoose.model("PlanoAssinatura", PlanAssSchema);


const pagBankheaders = {
    headers: {Authorization: `Bearer ${config.pagbanktoken}`}
}

const createPlanInGateway = async ({id, nome, preco, month_amount, description}) => {
    if (preco > 1.0) {
        console.log("Creating plan in gateway: " + nome)
        const body = {
            reference_id: id,
            name: nome,
            description: description,
            amount: {
                value: precopag(preco),
                currency: 'BRL'
            },
            interval: {unit: 'MONTH', length: month_amount},
            trial: {enabled: false, hold_setup_fee: false},
            payment_method: ['CREDIT_CARD', 'BOLETO']
        }

        const response = await axios.post(`${config.pagbankurl}/plans`, body, pagBankheaders)
        console.log("createPlanInGateway response data:", JSON.stringify(response.data, null, 2));
        return response.data.id
    } else {
        throw new Error("Preco do plano deve ser maior do que 1.00")
    }
};

const updatePlanInGateway = async (gateway_id, {id, nome, preco, month_amount, description}) => {
    if (preco > 1.0) {
        console.log("Updating plan in gateway: " + nome)
        const body = {
            reference_id: id,
            name: nome,
            description: description,
            amount: {
                value: precopag(preco),
                currency: 'BRL'
            },
            interval: {unit: 'MONTH', length: month_amount},
            trial: {enabled: false, hold_setup_fee: false},
            payment_method: ['CREDIT_CARD', 'BOLETO']
        }

        const response = await axios.put(`${config.pagbankurl}/plans/${gateway_id}`, body, pagBankheaders)
        console.log("updatePlanInGateway response data:", JSON.stringify(response.data, null, 2));
        return response.data.id
    } else {
        throw new Error("Preco do plano deve ser maior do que 1.00")
    }
};

const inactivatePlanInGateway = async (plan_id) => {
    console.log(`Inactivating plan in gateway: ${plan_id}`)
    const response = await axios.put(`${config.pagbankurl}/plans/${plan_id}/inactivate`, null, pagBankheaders);
    console.log("inactivatePlanInGateway response data:", JSON.stringify(response.data, null, 2));
    return response.data;
};

const activatePlanInGateway = async (plan_id) => {
    console.log(`Activating plan in gateway: ${plan_id}`)
    const response = await axios.put(`${config.pagbankurl}/plans/${plan_id}/activate`, null, pagBankheaders)
    console.log("activatePlanInGateway response data:", JSON.stringify(response.data, null, 2));
    return response.data;
};

const createCustomerInGateway = async (data) => {
    console.log("Creating customer in gateway: " + data.user_id)

    const body = {
        reference_id: data.user_id,
        email: data.email,
        name: data.nome,
        tax_id: data.cpf_cnpj,
        birth_date: data.data_nascimento,
        phones: [{
            area: data.area,
            country: "55",
            number: data.numero_telefone,
            id: 1
        }],
        address: {
            street: data.rua,
            number: data.numero_rua,
            complement: data.complemento,
            locality: data.bairro,
            city: data.cidade,
            region_code: data.sigla_estado,
            postal_code: data.cep,
            country: "BRA"
        }
    }

    if (data.card_encrypted) {
        body.billing_info = [{
            type: "CREDIT_CARD",
            card: {
                encrypted: data.card_encrypted,
                holder: {
                    name: data.holder.nome,
                    birth_date: data.holder.data_nascimento,
                    tax_id: data.holder.cpf_cnpj,
                    phone: {
                        country: "55",
                        area: data.holder.area,
                        number: data.holder.numero_telefone
                    }
                }
            }
        }]
    }

    console.log("createCustomerData.body:", JSON.stringify(body, null, 2))
    const response = await axios.post(`${config.pagbankurl}/customers`, body, pagBankheaders)
    console.log("createCustomerData response data:", JSON.stringify(response.data, null, 2))
    return response.data.id
};

const changeCustomerInGateway = async (data, gateway_customer_id) => {
    console.log("Changing customer in gateway: " + data.user_id)

    const body = {
        reference_id: data.user_id,
        email: data.email,
        name: data.nome,
        tax_id: data.cpf_cnpj,
        birth_date: data.data_nascimento,
        phones: [{
            area: data.area,
            country: "55",
            number: data.numero_telefone,
            id: 1
        }],
        address: {
            street: data.rua,
            number: data.numero_rua,
            complement: data.complemento,
            locality: data.bairro,
            city: data.cidade,
            region_code: data.sigla_estado,
            postal_code: data.cep,
            country: "BRA"
        }
    }

    console.log("changeCustomerInGateway.body:", JSON.stringify(body, null, 2))
    const response = await axios.put(`${config.pagbankurl}/customers/${gateway_customer_id}`, body, pagBankheaders)
    console.log("changeCustomerInGateway response data:", JSON.stringify(response.data, null, 2))
    return response.data.id
};

const changeCustomerBillingInGateway = async (data, gateway_customer_id) => {
    console.log("Changing customer billing info in gateway: " + data.user_id)

    const body = [
        {
            card: {
                encrypted: data.card_encrypted
            },
            type: "CREDIT_CARD"
        }
    ]

    console.log("changeCustomerBillingInGateway.body:", JSON.stringify(body, null, 2))
    const response = await axios.put(`${config.pagbankurl}/customers/${gateway_customer_id}/billing_info`, body, pagBankheaders)
    console.log("changeCustomerBillingInGateway response data:", JSON.stringify(response.data, null, 2))
    return response.data.id
};

const getCustomerFromGateway = async (customer_id) => {
    console.log(`Retrieving customer info in gateway: ${customer_id}`)

    const response = await axios.get(`${config.pagbankurl}/customers/${customer_id}`, body, pagBankheaders)
    console.log("getCustomerFromGateway response data:", JSON.stringify(response.data, null, 2))
    return response.data
}

const createSubscriptionInGateway = async (user_id, plan_id, cvv) => {
    console.log(`Creating subscription in gateway for user: ${user_id} and plan: ${plan_id}`)
    const body = {
        // reference_id: reference_id,
        plan: {
            id: plan_id
        },
        customer: {
            id: user_id
        }
    }

    if (cvv) {
        body.payment_method = [
            {
                type: "CREDIT_CARD",
                card: {
                    security_code: cvv
                }
            }
        ]
    } else {
        body.payment_method = [
            {
                type: "BOLETO"
            }
        ]
    }

    console.log("createSubscriptionInGateway.body:", JSON.stringify(body, null, 2))
    const response = await axios.post(`${config.pagbankurl}/subscriptions`, body, pagBankheaders)
    console.log("createSubscriptionInGateway response:", JSON.stringify(data, null, 2))
    return response.data.id
};

const getSubscriptionInGateway = async (subscription_id) => {
    console.log("Retrieving subscription in gateway: " + subscription_id)
    const response = await axios.get(`${config.pagbankurl}/subscriptions/${subscription_id}`, null, pagBankheaders)
    console.log("getSubscriptionInGateway response:", JSON.stringify(data, null, 2))
    return response.data
};

const cancelSubscriptionInGateway = async (subscription_id) => {
    console.log("Cancelling subscription in gateway: " + subscription_id)
    const response = await axios.put(`${config.pagbankurl}/subscriptions/${subscription_id}/cancel`, null, pagBankheaders)
    console.log("cancelSubscriptionInGateway response:", JSON.stringify(data, null, 2))
    return response.data
};

const syncPlansInGateway = async (req, res) => {
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
            await axios.post(`${config.pagbankurl}/plans`, body, pagBankheaders)
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
}

module.exports = {
    createPlanInGateway,
    updatePlanInGateway,
    inactivatePlanInGateway,
    activatePlanInGateway,
    createCustomerInGateway,
    changeCustomerInGateway,
    changeCustomerBillingInGateway,
    createSubscriptionInGateway,
    cancelSubscriptionInGateway,
    syncPlansInGateway,
    getCustomerFromGateway,
    getSubscriptionInGateway
}

