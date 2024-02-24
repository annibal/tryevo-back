const config = require("../config");
const mongoose = require("mongoose");
const axios = require("axios");
const _ = require("lodash");
const precopag = require("../helpers/precoformater");

const PlanAssSchema = require("../schemas/plano-assinatura.schema");
const PlanAssModel = mongoose.model("PlanoAssinatura", PlanAssSchema);

const makeAxiosRequest = async ({ method, url, data }) => {
  try {
    const response = await axios({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${config.pagbanktoken}`,
      },
    });
    return response.data;
  } catch (axiosErr) {
    // response: {
    //   status: 401,
    //   statusText: 'Unauthorized',
    //   headers: [Object [AxiosHeaders]],
    //   config: [Object],
    //   request: [ClientRequest],
    //   data: [Object]
    //   data: { error_messages: [Array] }
    //   {
    //     "error": "invalid_parameter",
    //     "parameter_name": "email",
    //     "description": "The customer cannot be created, as there is already a customer registered with the entered e-mail address. Check that the data is correct and try again."
    //   }
    // }

    console.log("axiosErr :>> ", axiosErr);

    if (!axiosErr) {
      throw new Error(
        "Erro PagSeguro desconhecido - 'ECOD001' - PagSeguro Endpoint"
      );
    }
    if (!axiosErr.response) {
      try {
        const err = JSON.stringify(axiosErr);
        throw new Error(err);
      } catch (jsonErr) {
        throw new Error(
          "Erro PagSeguro ilegível - 'ECOD002' - PagSeguro Endpoint"
        );
      }
    }
    if (!axiosErr.response?.data) {
      throw new Error(
        `Erro PagSeguro 'ECOD003' - ${axiosErr.response.status} ${axiosErr.response.statusText}`
      );
    }
    if (axiosErr.response?.data.error_message) {
      let strError = "";
      if (errMsg?.error) strError += errMsg?.error + ": ";
      if (errMsg?.parameter_name) strError += errMsg?.parameter_name + " - ";
      if (errMsg?.description) strError += errMsg?.description;
      if (typeof errMsg === "string") strError += errMsg;
      if (!strError) {
        throw new Error(`Erro PagSeguro 'ECOD004': Falha de Sistema`);
      } else {
        throw new Error(`Erro PagSeguro 'ECOD005': ${strError}`);
      }
    }
    if (axiosErr.response?.data.error_messages) {
      if (Array.isArray(axiosErr.response?.data.error_messages)) {
        const errMsgs = axiosErr.response?.data.error_messages.map(
          (errMsg, i) => {
            let strError = "";
            if (errMsg?.error) strError += errMsg?.error + ": ";
            if (errMsg?.parameter_name)
              strError += errMsg?.parameter_name + " - ";
            if (errMsg?.description) strError += errMsg?.description;
            if (typeof errMsg === "string") strError += errMsg;
            if (!strError) {
              return `Erro PagSeguro #${i + 1} 'ECOD006': Falha de Sistema`;
            } else {
              return `Erro PagSeguro #${i + 1} 'ECOD007': ${strError}`;
            }
          }
        );
        throw new Error(errMsgs.join("; "));
      } else {
        throw new Error(
          `Erro PagSeguro 'ECOD008': ${JSON.stringify(
            axiosErr.response?.data.error_messages,
            null,
            2
          )}`
        );
      }
    }

    try {
      const jsonErro = JSON.stringify(axiosErr.response.data, null, 2);
      throw new Error(
        `Erro PagSeguro 'ECOD009' - ${axiosErr.response.status} ${axiosErr.response.statusText} : ${jsonErro}`
      );
    } catch (e) {
      throw new Error(
        `Erro PagSeguro 'ECOD010' - ${axiosErr.response.status} ${axiosErr.response.statusText}`
      );
    }
  }
};

// endpoints

const createPlanInGateway = async ({
  id,
  nome,
  preco,
  month_amount,
  description,
}) => {
  if (preco > 1.0) {
    console.log("Creating plan in gateway: " + nome);
    const body = {
      reference_id: id,
      name: nome,
      description: description,
      amount: {
        value: precopag(preco),
        currency: "BRL",
      },
      interval: { unit: "MONTH", length: month_amount },
      trial: { enabled: false, hold_setup_fee: false },
      payment_method: ["CREDIT_CARD", "BOLETO"],
    };

    const axiosData = await makeAxiosRequest({
      method: "post",
      url: `${config.pagbankurl}/plans`,
      data: body,
    });
    console.log(
      "createPlanInGateway response data:",
      JSON.stringify(axiosData, null, 2)
    );
    return axiosData.id;
  } else {
    throw new Error("Preco do plano deve ser maior do que 1.00");
  }
};

const updatePlanInGateway = async (
  gateway_id,
  { id, nome, preco, month_amount, description }
) => {
  if (preco > 1.0) {
    console.log("Updating plan in gateway: " + nome);
    const body = {
      reference_id: id,
      name: nome,
      description: description,
      amount: {
        value: precopag(preco),
        currency: "BRL",
      },
      interval: { unit: "MONTH", length: month_amount },
      trial: { enabled: false, hold_setup_fee: false },
      payment_method: ["CREDIT_CARD", "BOLETO"],
    };

    const axiosData = await makeAxiosRequest({
      method: "put",
      url: `${config.pagbankurl}/plans/${gateway_id}`,
      data: body,
    });
    console.log(
      "updatePlanInGateway response data:",
      JSON.stringify(axiosData, null, 2)
    );
    return axiosData.id;
  } else {
    throw new Error("Preco do plano deve ser maior do que 1.00");
  }
};

const inactivatePlanInGateway = async (plan_id) => {
  console.log(`Inactivating plan in gateway: ${plan_id}`);
  const axiosData = await makeAxiosRequest({
    method: "put",
    url: `${config.pagbankurl}/plans/${plan_id}/inactivate`,
    data: null,
  });
  console.log(
    "inactivatePlanInGateway response data:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData;
};

const activatePlanInGateway = async (plan_id) => {
  console.log(`Activating plan in gateway: ${plan_id}`);
  const axiosData = await makeAxiosRequest({
    method: "put",
    url: `${config.pagbankurl}/plans/${plan_id}/activate`,
    data: null,
  });
  console.log(
    "activatePlanInGateway response data:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData;
};

const createCustomerInGateway = async (data) => {
  console.log("Creating customer in gateway: " + data.user_id);

  const body = {
    reference_id: data.user_id,
    email: data.email,
    name: data.nome,
    tax_id: data.cpf_cnpj,
    birth_date: data.data_nascimento,
    phones: [
      {
        area: data.area,
        country: "55",
        number: data.numero_telefone,
        id: 1,
      },
    ],
    address: {
      street: data.rua,
      number: data.numero_rua,
      complement: data.complemento,
      locality: data.bairro,
      city: data.cidade,
      region_code: data.sigla_estado,
      postal_code: data.cep,
      country: "BRA",
    },
  };

  if (data.card_encrypted) {
    body.billing_info = [
      {
        type: "CREDIT_CARD",
        card: {
          encrypted: data.card_encrypted,
          holder: {
            name: _.deburr(data.holder.nome).toUpperCase(),
            birth_date: data.holder.data_nascimento,
            tax_id: data.holder.cpf_cnpj,
            phone: {
              country: "55",
              area: data.holder.area,
              number: data.holder.numero_telefone,
            },
          },
        },
      },
    ];
  }

  console.log("createCustomerData.body:", JSON.stringify(body, null, 2));
  const axiosData = await makeAxiosRequest({
    method: "post",
    url: `${config.pagbankurl}/customers`,
    data: body,
  });
  console.log(
    "createCustomerData response data:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData.id;
};

const changeCustomerInGateway = async (data, gateway_customer_id) => {
  console.log("Changing customer in gateway: " + data.user_id);

  const body = {
    reference_id: data.user_id,
    email: data.email,
    name: data.nome,
    tax_id: data.cpf_cnpj,
    birth_date: data.data_nascimento,
    phones: [
      {
        area: data.area,
        country: "55",
        number: data.numero_telefone,
        id: 1,
      },
    ],
    address: {
      street: data.rua,
      number: data.numero_rua,
      complement: data.complemento,
      locality: data.bairro,
      city: data.cidade,
      region_code: data.sigla_estado,
      postal_code: data.cep,
      country: "BRA",
    },
  };

  console.log("changeCustomerInGateway.body:", JSON.stringify(body, null, 2));
  const axiosData = await makeAxiosRequest({
    method: "put",
    url: `${config.pagbankurl}/customers/${gateway_customer_id}`,
    data: body,
  });
  console.log(
    "changeCustomerInGateway response data:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData.id;
};

const changeCustomerBillingInGateway = async (data, gateway_customer_id) => {
  console.log("Changing customer billing info in gateway: " + data.user_id);

  const body = [
    {
      card: {
        encrypted: data.card_encrypted,
      },
      type: "CREDIT_CARD",
    },
  ];

  console.log(
    "changeCustomerBillingInGateway.body:",
    JSON.stringify(body, null, 2)
  );
  const axiosData = await makeAxiosRequest({
    method: "put",
    url: `${config.pagbankurl}/customers/${gateway_customer_id}/billing_info`,
    data: body,
  });
  console.log(
    "changeCustomerBillingInGateway response data:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData.id;
};

const getCustomerFromGateway = async (customer_id) => {
  console.log(`Retrieving customer info in gateway: ${customer_id}`);
  const axiosData = await makeAxiosRequest({
    method: "get",
    url: `${config.pagbankurl}/customers/${customer_id}`,
    data: null,
  });
  console.log(
    "getCustomerFromGateway response data:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData;
};

const createSubscriptionInGateway = async (user_id, plan_id, cvv) => {
  console.log(
    `Creating subscription in gateway for user: ${user_id} and plan: ${plan_id}`
  );
  const body = {
    // reference_id: reference_id,
    plan: {
      id: plan_id,
    },
    customer: {
      id: user_id,
    },
  };

  if (cvv) {
    body.payment_method = [
      {
        type: "CREDIT_CARD",
        card: {
          security_code: cvv,
        },
      },
    ];
  } else {
    body.payment_method = [
      {
        type: "BOLETO",
      },
    ];
  }

  console.log(
    "createSubscriptionInGateway.body:",
    JSON.stringify(body, null, 2)
  );
  const axiosData = await makeAxiosRequest({
    method: "post",
    url: `${config.pagbankurl}/subscriptions`,
    data: body,
  });
  console.log(
    "createSubscriptionInGateway response:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData.id;
};

const getSubscriptionInGateway = async (subscription_id) => {
  console.log("Retrieving subscription in gateway: " + subscription_id);
  const axiosData = await makeAxiosRequest({
    method: "get",
    url: `${config.pagbankurl}/subscriptions/${subscription_id}`,
    data: null,
  });
  console.log(
    "getSubscriptionInGateway response:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData;
};

const getSubscriptionInvoicesInGateway = async (subscription_id) => {
  console.log(
    "Retrieving subscription INVOICES in gateway: " + subscription_id
  );

  const axiosData = await makeAxiosRequest({
    method: "get",
    url: `${config.pagbankurl}/subscriptions/${subscription_id}/invoices`,
    data: null,
  });

  console.log(
    "getSubscriptionInvoicesInGateway response:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData.invoices;
};

const getSubscriptionPaymentInGateway = async (invoice_id) => {
  console.log(
    "Retrieving subscription PAYMENT in gateway from INVOICE: " + invoice_id
  );

  const axiosData = await makeAxiosRequest({
    method: "get",
    url: `${config.pagbankurl}/invoices/${invoice_id}/payments`,
    data: null,
  });

  console.log(
    "getSubscriptionPaymentInGateway response:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData.payments;
};

const cancelSubscriptionInGateway = async (subscription_id) => {
  console.log("Cancelling subscription in gateway: " + subscription_id);
  const axiosData = await makeAxiosRequest({
    method: "put",
    url: `${config.pagbankurl}/subscriptions/${subscription_id}/cancel`,
    data: null,
  });
  console.log(
    "cancelSubscriptionInGateway response:",
    JSON.stringify(axiosData, null, 2)
  );
  return axiosData;
};

const syncPlansInGateway = async (req, res) => {
  const search = { gateway_id: null, active: true };

  for await (let plan of PlanAssModel.find(search)) {
    if (plan.preco > 1.0) {
      console.log("Synchonizing plan: " + plan);
      const body = {
        name: plan.nome,
        amount: {
          value: precopag(plan.preco),
          currency: "BRL",
        },
        interval: { unit: "MONTH", length: 1 },
        trial: { enabled: false, hold_setup_fee: false },
        payment_method: ["CREDIT_CARD"],
      };
      await makeAxiosRequest({
        method: "post",
        url: `${config.pagbankurl}/plans`,
        data: body,
      })
        .then((axiosData) => plan.set("gateway_id", axiosData.id))
        .catch(function (error) {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log("Error", error.message);
          }
          console.log(error.config);
        });

      await PlanAssModel.findByIdAndUpdate(plan._id, plan, {
        new: true,
        runValidators: true,
      });
    }
  }
};

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
  getSubscriptionInGateway,
  getSubscriptionInvoicesInGateway,
  getSubscriptionPaymentInGateway,
};
