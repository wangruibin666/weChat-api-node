'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
    //注册
  async reg() {
    let {ctx, app} = this;
    // 参数验证
    ctx.validate({
      username  : {type: 'string', required: true, desc: '用户名'},
      password   : {type: 'string', required: true, desc: '密码'},
      repassword: {type: 'string', required: true, desc: '确认密码'}
    },{
      equals: [
        ['password', 'repassword']
      ]
    });
    return ctx.body = '哈哈'
    let {username, password, repassword } = this.ctx.request.body;
    //验证用户是否已经存在
    if(await app.model.User.findOne({
      where: {
        username,
      }
    })){
      ctx.throw(400, '用户名已存在')
    }
    let user = await app.model.User.create({
      username,
      password
    });
    if(!user){
      ctx.throw(400, '新建用户失败')
    }
    ctx.apiSuccess(user);
    
  }
}

module.exports = UserController;
