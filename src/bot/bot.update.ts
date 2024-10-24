import { Ctx, Hears, InjectBot, Message, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly botService: BotService,
    // private readonly usersService: UsersService,
  ) {}

  @Hears(/^\/start[ =](.+)$/)
  async start(@Ctx() ctx: Context, @Message('text') message: string) {
    const referralCode = message.split(' ')[1];
    console.log(referralCode);
    // const user: CreateUserDto = {
    //   id: ctx.from.id,
    //   firstName: ctx.message.from.first_name,
    //   lastName: ctx.message.from.last_name,
    //   username: ctx.message.from.username,
    //   languageCode: ctx.from.language_code,
    //   createdDate: new Date(),
    //   refCode: referralCodes.generate({
    //     length: 8,
    //   })[0],
    //   fromRefCode: referralCode,
    // currentBalance: 0,
    // outputBalance: 0,
    // referredUsers: 0,
    // isAdmin: false,
    // }
    // };
    // const newUser: CreateUserDto = {
    //   firstName: ctx.from.first_name,
    //   lastName: ctx.from.last_name,
    //   username: ctx.from.username,
    //   languageCode: ctx.from.language_code,
    //   id: ctx.from.id,
    //   isBot: ctx.from.is_bot,

    //   settings: {
    //     sendNewClaimMessages: false,
    //   },
    // };

    // ctx.telegram.getChatMember();

    // console.log(newUser);

    // const user = await this.botService.addNewUser(newUser);

    // await ctx.reply('Главное меню', {
    //   reply_markup: servicesKeyboard(user),
    // });

    return;
  }
  // @Start()
  // async start(@Ctx() ctx: SceneContext) {
  //   const newUser: CreateUserDto = {
  //     firstName: ctx.from.first_name,
  //     lastName: ctx.from.last_name,
  //     username: ctx.from.username,
  //     languageCode: ctx.from.language_code,
  //     id: ctx.from.id,
  //     isBot: ctx.from.is_bot,

  //     settings: {
  //       sendNewClaimMessages: false,
  //     },
  //   };

  //   // ctx.telegram.getChatMember();

  //   console.log(newUser);

  //   const user = await this.botService.addNewUser(newUser);

  //   await ctx.reply('Главное меню', {
  //     reply_markup: servicesKeyboard(user),
  //   });

  //   return;
  // }

  // @Action(BotRoutes.user.site.choose.value)
  // async sites(@Ctx() ctx: SceneContext) {
  //   await ctx.scene.enter(BotNavigation.user.scenes.site.choose.enter, {
  //     firstMessage: 'edit',
  //   });
  //   return;
  // }

  // @Action(BotRoutes.user.settings.value)
  // async settings(@Ctx() ctx: SceneContext) {
  //   await ctx.scene.leave();
  //   await ctx.scene.enter(BotNavigation.user.scenes.settings.enter, {
  //     firstMessage: 'edit',
  //   });
  //   return;
  // }
}
