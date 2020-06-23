var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];

if (!port) {
  console.log("错误:请指定端口!\nnode server.js 8888\n");
  process.exit(1);
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;

  /******** 从这里开始看，上面不要看 ************/
  const session = JSON.parse(fs.readFileSync("./session.json").toString());
  if (path === "/register" && method === "POST") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html;charset=UTF-8;");
    const userFile = fs.readFileSync("./db/users.json").toString();
    const userArray = JSON.parse(userFile);
    // console.log(userArray.length);
    const array = [];
    request.on("data", (chunk) => {
      array.push(chunk);
    });
    request.on("end", () => {
      // console.log(array);
      const string = Buffer.concat(array).toString();
      // console.log(string);
      const obj = JSON.parse(string);
      // console.log({ id: obj.name, password: obj.password });
      const newUser = {
        id: userArray.length,
        name: obj.name,
        password: obj.password,
      };
      userArray.push(newUser);
      fs.writeFileSync("./db/users.json", JSON.stringify(userArray));
      response.end();
      // console.log(obj.name);
    });
  } else if (path === "/signin" && method === "POST") {
    const userFile = fs.readFileSync("./db/users.json");
    const userArray = JSON.parse(userFile);
    console.log(userArray);
    const array = [];
    request.on("data", (chunk) => {
      array.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(array).toString();
      console.log(string);
      const obj = JSON.parse(string);
      console.log(obj.name, obj.password);
      // let user;
      // userArray.forEach((element) => {
      //   if (element.name === obj.name && element.password === obj.password)
      //     user = element;
      // });
      // const user = userArray.find((user) => {
      //   return user.name === obj.name && user.password === obj.password;
      // });
      const user = userArray.find(
        (user) => user.name === obj.name && user.password === obj.password
      );
      if (user === undefined) {
        response.statusCode = 400;
        // response.end("用户不存在或密码错误");
        response.setHeader("Content-Type", "text/json;charset=UTF-8;");
        response.end(`{"errorCode":4001}`);
      } else {
        // response.setHeader("Content-Type", "text/html;charset=UTF-8;");
        // response.setHeader("Set-Cookie", `user_id = ${user.id};HttpOnly`);
        response.statusCode = 200;
        const random = Math.random();
        session[random] = { user_id: user.id };
        fs.writeFileSync("./session.json", JSON.stringify(session));
        response.setHeader("Set-Cookie", `session_id = ${random};HttpOnly`);
        response.end();
      }
    });
  } else if (path === "/home.html") {
    const cookie = request.headers["cookie"];
    console.log(cookie);
    let sessionId;
    try {
      sessionId = cookie
        .split(";")
        .filter((s) => s.indexOf("session_id=") >= 0)[0]
        .split("=")[1];
    } catch (error) {}
    if (sessionId && session[sessionId]) {
      const userId = session[sessionId].user_id;
      const userFile = fs.readFileSync("./db/users.json");
      const userArray = JSON.parse(userFile);
      const user = userArray.find((user) => user.id === userId);
      let string;
      if (user) {
        const homeHTML = fs.readFileSync("./public/home.html").toString();
        string = homeHTML.replace("{{user.name}}", `${user.name}`);
        response.setHeader("Content-Type", "text/html;charset=utf-8;");
      } else {
        const homeHTML = fs.readFileSync("./public/home.html").toString();
        string = homeHTML.replace("{{user.name}}", "您尚未登录");
        response.setHeader("Content-Type", "text/html;charset=utf-8;");
      }
      // let userId;
      // try {
      //   userId = cookie
      //     .split(";")
      //     .filter((s) => s.indexOf("user_id=") >= 0)[0]
      //     .split("=")[1];
      // } catch (error) {}
      // if (userId) {
      // const userFile = fs.readFileSync("./db/users.json");
      // const userArray = JSON.parse(userFile);
      // const user = userArray.find((user) => user.id.toString() === userId);
      // let string;
      // if (user) {
      //   const homeHTML = fs.readFileSync("./public/home.html").toString();
      //   string = homeHTML.replace("{{user.name}}", `${user.name}`);
      //   response.setHeader("Content-Type", "text/html;charset=utf-8;");
      // } else {
      //   const homeHTML = fs.readFileSync("./public/home.html").toString();
      //   string = homeHTML.replace("{{user.name}}", "您尚未登录");
      //   response.setHeader("Content-Type", "text/html;charset=utf-8;");
      // }
      response.write(string);
      response.end();
    } else {
      const homeHTML = fs.readFileSync("./public/home.html").toString();
      const string = homeHTML.replace("{{user.name}}", "您尚未登录");
      response.setHeader("Content-Type", "text/html;charset=utf-8;");
      response.write(string);
      response.end();
    }
    // if (cookie === "login=1") {
    //   const homeHTML = fs.readFileSync("./public/home.html").toString();
    //   const string = homeHTML.replace("{{user.name}}", "您已经登录");
    //   response.setHeader("Content-Type", "text/html;charset=utf-8;");
    //   response.write(string);
    //   response.end();
    // } else {
    //   // response.statusCode = 201;
    //   // response.end(`cookie is: ${cookie}`);
    // const homeHTML = fs.readFileSync("./public/home.html").toString();
    // const string = homeHTML.replace("{{user.name}}", "您尚未登录");
    // response.setHeader("Content-Type", "text/html;charset=utf-8;");
    // response.write(string);
    // response.end();
    // }
  } else {
    console.log("收到请求！路径（带查询参数）为：" + pathWithQuery);
    response.statusCode = 200;
    let filePath = path === "/" ? "/index.html" : path;
    let index = filePath.indexOf(".");
    suffix = filePath.substring(index);
    const fileTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
    };
    // console.log(fileTypes[suffix]);
    let content;
    try {
      content = fs.readFileSync(`./public${filePath}`);
    } catch (error) {
      response.statusCode = 404;
      content = "没有这个文件";
    }
    response.setHeader(
      "Content-Type",
      `${fileTypes[suffix] || "text/html"};charset=utf-8`
    );
    response.write(content);
    response.end();
  }

  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log("监听 " + port + " 成功\n请用浏览器打开 http://localhost:" + port);
