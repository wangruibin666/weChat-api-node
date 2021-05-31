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
      const error = (status === 500 && app.config.env === 'prod') ? 'Internal Server Error' : err.message
      ctx.body = {
        msg: 'fail',
        data: error,
      };
    }
  };
};
