const resDotSendInterceptor = (res, send) => (content) => {
  res.contentBody = content;
  res.send = send;
  res.send(content);
 };

function logger(req, res, next) {
  // incoming
  let str = `>: ${req.method} ${req.hostname}${req.url}`;
  
  try {
    str += ' body=' + JSON.stringify(req.body);
  } catch (e) {}

  try {
    str += ' params=' + JSON.stringify(req.params);
  } catch (e) {}

  try {
    str += ' query=' + JSON.stringify(req.query);
  } catch (e) {}

  console.log(str);

  // response
  res.send = resDotSendInterceptor(res, res.send);
  
  res.on("finish", () => {
    console.log(">: SEND", res.contentBody);
  });

  next();
}

module.exports = logger