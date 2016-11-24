var mysql = require('mysql');
var dbconfig = require('../config/database');
var bcrypt = require('bcrypt-nodejs');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
)');

console.log('Success: Database Created!');

// super admin entry
var username = 'root';
var password = bcrypt.hashSync('a', null, null);

var userDetails  = {id: 1, username: username, password: password};
connection.query('INSERT INTO `' + dbconfig.database + '`.`' + dbconfig.users_table + '`\
 SET ?', userDetails, function(err, result) {
 });


 connection.query('\
 CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.role_table + '` ( \
     `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
     `role` VARCHAR(20) NOT NULL, \
       PRIMARY KEY (`id`), \
     UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
     UNIQUE INDEX `role_UNIQUE` (`role` ASC) \
 )');

var roles = ['SUPER_ADMIN', 'ADMIN', 'USER'];
for (var i = 0 ; i < 3 ; i++) {
  var roleDetails  = {id: i+1, role: roles[i]};
  connection.query('INSERT INTO `' + dbconfig.database + '`.`' + dbconfig.role_table + '`\
  SET ?', roleDetails, function(err, result) {
  });
}

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
