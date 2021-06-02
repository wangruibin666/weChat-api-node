/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1622470602618_6497';

  // add your middleware config here
  config.middleware = ['errorHandle'];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  // 关闭csrf,开启跨域
  config.security = {
    // 关闭csrf
    csrf: {
      enable: false,
    },
    // 跨域白名单
    domainWhiteList: [],
  };
  //配置数据库
  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    username: 'root',
    password: '123456',
    port: 3306,
    database: 'egg-weChat',
    //中国时区
    timezone: '+08:00',
    define: {
      //取消数据表名重复
      freezeTableName: true,
      //自动写入时间戳
      timestamps: true,
      //字段生成软删除时间戳
      paranoid: null,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      //软删除
      // deletedAt: 'deleted_at',
      //所有驼峰命名化
      underscored: true
    }
  };
  config.valparams = {
    locale: 'zh-cn',
    throwError: true
  };

  return {
    ...config,
    ...userConfig,
  };
};
