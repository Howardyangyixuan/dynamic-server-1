const $form = $("#signInForm");
console.log($form);
$form.on("submit", (e) => {
  e.preventDefault();
  const name = $form.find("input[name=name]").val();
  const password = $form.find("input[name=password]").val();
  //   console.log(name, password);
  $.ajax({
    method: "POST",
    url: "/signin",
    contentType: "text/json;charset=utf-8",
    data: JSON.stringify({ name, password }),
  }).then(
    () => {
      alert("登录成功");
      location.href = "./home.html";
    },
    () => {
      alert("登录失败");
    }
  );
});
