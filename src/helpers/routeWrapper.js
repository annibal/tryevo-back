const routeWrapper = (controller) => async (req, res, next) => {
  try {
    const data = await controller(req, res, next);
    res.status(200).send({ success: true, data });
  } catch (err) {
    res.status(500).send({
      success: false,
      error: {
        ...err,
        message: err.message,
      },
    });
  }
};

module.exports = routeWrapper;
