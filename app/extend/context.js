module.exports = {
  //api 返回成功
  //this 就是 ctx 对象，在其中可以调用 ctx 上的其他方法，或访问属性
  apiSuccess(data = '', msg = 'ok', code = 200){
    this.status = 200;
    this.body = {
      msg,
      data
    }
  },
  apiFail(data = '', msg = 'fail', code = 400){
    this.body = {msg, data};
    this.status = code
  },
  // 生成token
  getToken(value) {
    return this.app.jwt.sign(value, this.app.config.jwt.secret);
  },
  // 验证token
  checkToken(token){
    return this.app.jwt.verify(token, this.app.config.jwt.secret)
  }
}
