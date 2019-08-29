'use strict';
module.exports = (sequelize, DataTypes) => {
  const book = sequelize.define('book', {
    author: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    preview_link: DataTypes.STRING,
    image_url: DataTypes.STRING,
    isbn: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});
  book.associate = function(models) {
    // associations can be defined here
  };
  return book;
};