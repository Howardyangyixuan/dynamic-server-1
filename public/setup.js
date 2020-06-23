const $form = $("#registerForm");
$form.on("submit", (e) => {
  e.preventDefault();
  const password = $form.find("input[name=password]").val();
  const name = $form.find("input[name=name]").val();
  // console.log(name, password);
  $.ajax({
    //默认GET
    method: "POST",
    url: "/register",
    contentType: "text/json;charset=UTF-8",
    // data: JSON.stringify({ name: name, password: password }),
    data: JSON.stringify({ name, password }),
  }).then(
    () => {
      alert("注册成功");
      location.href = "./signin.html";
    },
    () => {
      alert("注册失败");
    }
  );
});
