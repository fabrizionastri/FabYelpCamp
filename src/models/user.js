const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email : {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  }
});

UserSchema.plugin(passportLocalMongoose) // usernameField is the field that passport will use to authenticate the user

const User = mongoose.model('User', UserSchema);

module.exports = { User };