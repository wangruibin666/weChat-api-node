'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
    //注册
  async reg() {
    this.ctx.body = '注册'
  }
}

module.exports = UserController;
