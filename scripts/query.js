/**
 * Created by barrett on 8/28/14.
 */

var mysql = require('mysql');
var dbconfig = require('../config/database');
var bcrypt = require('bcrypt-nodejs');

var connection = mysql.createConnection(dbconfig.connection);
connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.user_role_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `user_id` VARCHAR(20) NOT NULL, \
    `roles` VARCHAR(255) NOT NULL, \
      PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
)');
var roles = {roles: `SUPER_ADMIN;ADMIN;USER`};
roles = JSON.stringify(roles);
 var userRoleDetails  = {id: 1, user_id: 1, roles: roles};
 connection.query('INSERT INTO `' + dbconfig.database + '`.`' + dbconfig.user_role_table + '`\
    SET ?', userRoleDetails, function(err, result) {
 });
connection.end();
