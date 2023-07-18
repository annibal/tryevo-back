const resDotSendInterceptor = (res, send) => (content) => {
  res.contentBody = content;
  res.send = send;
  res.send(content);
 };

function logger(req, res, next) {
  // incoming
  let str = `RECV: ${req.method} ${req.url}`;
  
  try {
    str += '\n body=' + JSON.stringify(req.body);
  } catch (e) {}

  try {
    str += '\n params=' + JSON.stringify(req.params);
  } catch (e) {}

  try {
    str += '\n query=' + JSON.stringify(req.query);
  } catch (e) {}

  try {
    str += '\n headers=' + JSON.stringify(req.headers);
  } catch (e) {}

  console.log(str);

  // response
  res.send = resDotSendInterceptor(res, res.send);
  
  res.on("finish", () => {
    let x = res.contentBody;
    try {
      x = JSON.stringify(x);
    } catch (e) {}
    console.log(`SEND: ${res.statusCode}`, x, '\n');
  });

  next();
}

module.exports = logger