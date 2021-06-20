'use strict';

const Controller = require('egg').Controller;

class ApplyController extends Controller {
  // 申请添加好友
  async addFriend() {
    const {ctx,app} = this;

    //参数验证
    ctx.validate({
      friend_id: {
        type: 'number',
        required: true,
        desc: '好友id'
      },
      nickname: {
        type: 'string',
        required: false,
        desc: '昵称'
      },
      lookme: {
        type: 'int',
        required: true,
        range: {
          in: [0, 1]
        },
        desc: '看我' 
      },
      lookhim: {
        type: 'int',
        required: true,
        range: {
          in: [0, 1]
        },
        desc: '看他'
      }
    });
    
    // 不能添加自己
    let current_user_id = ctx.authUser.id;
    let {friend_id, nickname, lookhim, lookme} = ctx.request.body
    if(current_user_id == friend_id){
      ctx.throw(400, '不能添加自己')
    }
    // 对方是否存在
    let user = await app.model.User.findOne({
      where: {
        id: friend_id,
        status:1
      }
    });
    if(!user){
      ctx.throw(400, '该用户不存在或者被禁用')
    }
    if(await app.model.Apply.findOne({
      where: {
        user_id: current_user_id,
        friend_id,
        status: ['pending', 'agree']
      }
    })){
      ctx.throw(400, '你之前已经申请过了')
    }
    // 创建申请
    let apply = await app.model.Apply.create({
      user_id: current_user_id,
      friend_id,
      lookhim,
      lookme,
      nickname
    })
    if(!apply){
      ctx.throw(400, '申请失败')
    }
    ctx.apiSuccess(apply)
  };
  // 获取好友申请列表
  async list() {
    const {ctx, app} = this;
    let current_user_id = ctx.authUser.id;
    let page = ctx.params.page ? parseInt(ctx.params.page) : 1;
    let limit = ctx.query.limit ? parseInt(ctx.query.limit) :10;
    let offset = (page -1) * limit;

    let rows = await app.model.Apply.findAll({
      where: {
        friend_id: current_user_id,
      },
      include: [
        {
          model: app.model.User,
          attributes: ['id', 'username', 'nickname', 'avatar']
        }
      ],
      offset,
      limit
    });

    let count = await app.model.Apply.count({
      where: {
        friend_id: current_user_id,
        status: "pending"
      }
    });

    ctx.apiSuccess({
      rows,count
    })
  }
  // 处理好友申请
  async handle() {
      const {ctx, app} = this;
      let current_user_id = ctx.authUser.id;
      let id = parseInt(ctx.params.id);
      // 参数验证
      ctx.validate({
  
        nickname: {
          type: 'string',
          required: false,
          desc: '昵称'
        },
        lookme: {
          type: 'int',
          required: true,
          range: {
            in: [0, 1]
          },
          desc: '看我' 
        },
        lookhim: {
          type: 'int',
          required: true,
          range: {
            in: [0, 1]
          },
          desc: '看他'
        },
        status:{
          type: 'string',
          required: true,
          range: {
            in: ['refuse', 'agree', 'ignore']
          },
          desc: '处理结果'
        }
      });

      // 查询该申请是否存在
      let apply = await  app.model.Apply.findOne({
        where: {
          id,
          friend_id: current_user_id,
          status: 'pending'
        }
      });
      if(!apply){
        ctx.throw(400, '该记录不存在')
      }

      let {status, nickname, lookhim, lookme} = ctx.request.body;

      let transaction;
      try {
          // 开启事务
          transaction = await app.model.transaction();

          // 设置申请状态
          // apply.status = status;
          // apply.save();

          await apply.update({
            status
          }, {transaction});

         if(status == 'agree') {
           // 加入到对方好友列表
           if(!await app.model.Friend.findOne({
            friend_id: current_user_id,
            user_id: apply.user_id
          })) {
               app.model.Apply.create({
                friend_id: current_user_id,
                user_id: apply.user_id,
                nickname: apply.nickname,
                lookhim:apply.lookhim,
                lookme: apply.lookme
              })
          }

          // 将对方加入到我的列表
          if(!await app.model.Friend.findOne({
            friend_id: apply.user_id,
            user_id: current_user_id
          })) {
               app.model.Friend.create({
                friend_id:apply.user_id,
                user_id: current_user_id,
                nickname,
                lookhim,
                lookme
              })
          }
         }

          // let result = await data.update({
          //     status
          // }, { transaction });

          // 提交事务
          await transaction.commit();
          // 消息推送
          // return ctx.apiSuccess('操作成功');
      } catch (e) {
          // 事务回滚
          await transaction.rollback();
          return ctx.apiFail('操作失败');
      }

  }
}

module.exports = ApplyController;
 