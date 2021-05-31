module.exports = {
  //api 返回成功
  //扩展里面直接this => 外面的this.ctx
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
  }
}
