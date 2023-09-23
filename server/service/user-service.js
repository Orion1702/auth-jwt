const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})

        if (candidate) {
            throw ApiError.BadRequest(`User with email ${email} already created, pls try another one`);
        }

        const hashPassword = await bcrypt.hash(password, 3); // create hash password
        const activationLink = uuid.v4(); // create uniqum activation link

		const user = await UserModel.create({email, password: hashPassword, activationLink})
		await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`); // save user to the DB

        const userDto = new UserDto(user); // id, email, asActvated // send mail for user actavation
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken); // create refresh tokens

        return {...tokens, user: userDto} // return user and tokens infos
    }

    // async activation(activationLink) {
    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})

        if (!user) {
            throw ApiError.BadRequest('Wrong activation link!');
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest('There is no user with this email')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Wrong password');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken); // create refresh tokens
        return {...tokens, user: userDto}// return user and tokens infos
    }
}

module.exports = new UserService();
