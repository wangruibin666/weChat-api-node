module.exports = (option, app) => {
  return async function errorHandle(ctx, next) {
    try {
      await next();
      if (ctx.status === 404 && !ctx.body) {
        ctx.body = {
          msg: 'fail',
          data: '404错误',
        };
      }
    } catch (err) {
      // 所有的异常在APP上出发一个error事件，框架会记录一条错误日志
      app.emit('error', err, ctx);
      const status = err.status || 500;
      let error = (status === 500 && app.config.env === 'prod') ? 'Internal Server Error' : err.message
      ctx.body = {
        msg: 'fail',
        data: error,
      };
      //参数验证异常
      if(status === 422 && err.message === 'Validation Failed'){
        if(err.errors && Array.isArray(err.errors)){
          error = err.errors[0].err[0]
        }
        ctx.body = {
          msg: 'fail',
          data: error,
        };
      }
      // 返回状态码
      ctx.status = status
    }
  };
};
