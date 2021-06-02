'use strict';
const crypto = require('crypto');
const Controller = require('egg').Controller;

class UserController extends Controller {
    //注册
  async reg() {
    let {ctx, app} = this;
    // 参数验证
    ctx.validate({
      username: {
        type: 'string',
        required: true,
        desc: '用户名',
        range: {
          min: 6,
          max: 20
        }
      },
      password   : {type: 'string', required: true, desc: '密码'},
      repassword: {type: 'string', required: true, desc: '确认密码'}
    },{
      equals: [
        ['password', 'repassword']
      ]
    });
    let {username, password } = ctx.request.body;
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
    
  };
  //登录
  async login () {
    const {ctx, app} = this;
    // 参数验证
    ctx.validate({
      username: {
        type: 'string',
        required: true,
        desc: '用户名',
      },
      password   : {type: 'string', required: true, desc: '密码'}
    });
    let {username, password} = ctx.request.body;
    // 验证该用户是否存在
    let user = await app.model.User.findOne({
      where: {
        username,
        status: 1
      }
    })
    if(!user){
      ctx.throw(400, '用户不存在或已被禁用')
    }
    // 验证密码
    await this.checkPassword(password, user.password);

    // 验证该用户状态是否启用
    // 生成token
    user = JSON.parse(JSON.stringify(user))
    let token = ctx.getToken(user)
    user.token = token
    delete user.password
    console.log(user);
    // 加入缓存
    // 返回用户信息和token
    return ctx.apiSuccess(user)
  };

  // 验证密码
  async checkPassword(password, hash_password) {
    // 先对需要验证的密码进行加密
    const hmac = crypto.createHash("sha256", this.app.config.crypto.secret);
    hmac.update(password);
    password = hmac.digest("hex");
    let res = password === hash_password;
    !res && this.ctx.throw(400, '参数错误')
  }

}

module.exports = UserController;
