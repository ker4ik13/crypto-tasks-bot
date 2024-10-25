import { ReferralsService, SponsorsService, UsersService } from '@/crud';
import { ENV_NAMES } from '@/lib/common';
import { getValueFromAction } from '@/lib/helpers';
import { ConfigService } from '@nestjs/config';
import { Action, Ctx, Hears, Message, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { SceneContext } from 'telegraf/scenes';
import { BotService } from './bot.service';
import {
  cabinetKeyboard,
  IContact,
  informationKeyboard,
  newTaskKeyboard,
  nextTaskKeyboard,
  shareKeyboard,
  topRefsKeyboard,
  withdrawKeyboard,
} from './keyboards';
import { BotAlerts, BotMessages } from './messages';

@Update()
export class BotUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly referralService: ReferralsService,
    private readonly sponsorsService: SponsorsService,
  ) {}

  @Hears(/^\/start[ =](.+)$/)
  async startWithReferral(
    @Ctx() ctx: Context,
    @Message('text') message: string,
  ) {
    const referralCode = message.split(' ')[1];

    const isUserExist = await this.usersService.isUserExist(ctx.from.id);

    if (!isUserExist) {
      await this.usersService.create({
        telegramId: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      await this.referralService.addUserToReferral({
        code: referralCode,
        userId: ctx.from.id,
      });

      await this.botService.checkChannelsSubs(ctx, 'first');
      return;
    }

    this.referralService.addUserToReferral({
      code: referralCode,
      userId: ctx.from.id,
    });

    this.botService.checkChannelsSubs(ctx, 'first');
    return;
  }

  @Action('main-menu')
  @Start()
  async start(@Ctx() ctx: SceneContext) {
    const isUserExist = await this.usersService.isUserExist(ctx.from.id);

    if (!isUserExist) {
      await this.usersService.create({
        telegramId: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      this.botService.checkChannelsSubs(ctx, 'first');
      return;
    }

    this.botService.checkChannelsSubs(ctx, 'first');
    return;
  }

  @Action('check-channels-subs')
  async checkChannelsSubs(@Ctx() ctx: Context) {
    await this.botService.checkChannelsSubs(ctx, 'first');
    return;
  }

  @Action('cabinet')
  async cabinet(@Ctx() ctx: SceneContext) {
    const notSubsChannels = await this.botService.checkChannelsSubs(ctx);

    if (notSubsChannels.length > 0) {
      return;
    }

    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );

    if (!user) {
      await this.usersService.create({
        telegramId: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      await this.botService.checkChannelsSubs(ctx, 'first');
      return;
    }

    await ctx.reply(BotMessages.cabinet(user), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: cabinetKeyboard(),
      },
    });
    return;
  }

  @Action('withdraw')
  async withdraw(@Ctx() ctx: SceneContext) {
    const notSubsChannels = await this.botService.checkChannelsSubs(ctx);

    if (notSubsChannels.length > 0) {
      return;
    }

    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );

    if (!user) {
      await this.usersService.create({
        telegramId: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      await this.botService.checkChannelsSubs(ctx, 'first');
      return;
    }

    const botSettings = {
      currency: this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY),
      minWithdraw: +this.configService.get(ENV_NAMES.MIN_WITHDRAWAL_AMOUNT),
      adminUsername: this.configService.get(ENV_NAMES.ADMIN_USERNAME),
    };

    if (user.currentBalance < 2) {
      await ctx.answerCbQuery(
        BotAlerts.minWithdrawal(botSettings.minWithdraw, botSettings.currency),
        {
          show_alert: true,
        },
      );
      return;
    }

    await ctx.reply(
      BotMessages.withdraw(
        botSettings.minWithdraw,
        botSettings.currency,
        botSettings.adminUsername,
      ),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: withdrawKeyboard(),
        },
      },
    );

    return;
  }

  @Action('partners')
  async partners(@Ctx() ctx: SceneContext) {
    const notSubsChannels = await this.botService.checkChannelsSubs(ctx);

    if (notSubsChannels.length > 0) {
      return;
    }

    const user = await this.usersService.findByTelegramIdWithReferral(
      ctx.from.id.toString(),
    );

    if (!user) {
      await this.usersService.create({
        telegramId: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      await this.botService.checkChannelsSubs(ctx, 'first');
      return;
    }

    const botSettings = {
      currency: this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY),
      reward: this.configService.get(ENV_NAMES.REWARD_FOR_A_FRIEND),
      botUsername: this.configService.get(ENV_NAMES.TELEGRAM_BOT_USERNAME),
    };

    await ctx.reply(
      BotMessages.partners(
        user,
        user.referral.code,
        botSettings.currency,
        botSettings.reward,
        botSettings.botUsername,
      ),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: shareKeyboard(
            user.referral.code,
            botSettings.botUsername,
          ),
        },
      },
    );
    return;
  }

  @Action('tasks')
  async tasks(@Ctx() ctx: SceneContext) {
    const notSubsChannels = await this.botService.checkChannelsSubs(ctx);

    if (notSubsChannels.length > 0) {
      return;
    }

    const user = await this.usersService.findByTelegramIdWithReferral(
      ctx.from.id.toString(),
    );

    if (!user) {
      await this.usersService.create({
        telegramId: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      await this.botService.checkChannelsSubs(ctx, 'first');
      return;
    }

    const botSettings = {
      currency: this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY),
      botUsername: this.configService.get(ENV_NAMES.TELEGRAM_BOT_USERNAME),
    };

    const newTaskChannel = await this.sponsorsService.getTaskForUser(
      ctx.from.id.toString(),
    );

    if (!newTaskChannel) {
      await ctx.reply(BotMessages.noTasks, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: shareKeyboard(
            user.referral.code,
            botSettings.botUsername,
          ),
        },
      });
      return;
    }

    await ctx.reply(BotMessages.newTask(newTaskChannel, botSettings.currency), {
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
      reply_markup: {
        inline_keyboard: newTaskKeyboard(newTaskChannel),
      },
    });
    return;
  }

  @Action(/tasks-check\|([a-zA-Z0-9_-]+)/)
  async taskById(@Ctx() ctx: SceneContext) {
    const channelSlug = getValueFromAction(ctx);

    const isUserSubscribedOnChannel =
      await this.sponsorsService.checkUserSubscription(ctx, channelSlug);

    if (!isUserSubscribedOnChannel) {
      await ctx.answerCbQuery(BotAlerts.notSubscribed, {
        show_alert: true,
      });
      return;
    }

    const channel = await this.sponsorsService.findBySlug(channelSlug);

    if (!channel) {
      await ctx.answerCbQuery(BotAlerts.error, {
        show_alert: true,
      });
      return;
    }

    await this.sponsorsService.addRewardToUser({
      userId: ctx.from.id.toString(),
      channel,
    });

    await ctx.reply(BotMessages.taskReward(channel), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: nextTaskKeyboard(),
      },
    });

    return;
  }

  @Action('information')
  async information(@Ctx() ctx: SceneContext) {
    const notSubsChannels = await this.botService.checkChannelsSubs(ctx);

    if (notSubsChannels.length > 0) {
      return;
    }

    const user = await this.usersService.findByTelegramIdWithReferral(
      ctx.from.id.toString(),
    );

    if (!user) {
      await this.usersService.create({
        telegramId: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      await this.botService.checkChannelsSubs(ctx, 'first');
      return;
    }

    const botSettings = {
      currency: this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY),
      reward: this.configService.get(ENV_NAMES.REWARD_FOR_A_FRIEND),
      botUsername: this.configService.get(ENV_NAMES.TELEGRAM_BOT_USERNAME),
    };

    const numberOfUsers = await this.usersService.getTotalCountOfUsers();
    const totalWithdrawal = await this.usersService.getTotalWithdrawalAmount();

    const contacts: IContact[] = [];

    const adminUsername = this.configService.get(ENV_NAMES.ADMIN_USERNAME);
    const developerUsername = this.configService.get(
      ENV_NAMES.DEVELOPER_USERNAME,
    );

    if (adminUsername) {
      contacts.push({
        link: `https://t.me/${adminUsername}`,
        name: '🧑‍💻 Админ',
      });
    }
    if (developerUsername) {
      contacts.push({
        link: `https://t.me/${developerUsername}`,
        name: '👨🏻‍💻 Разработчик',
      });
    }

    await ctx.reply(
      BotMessages.information(
        numberOfUsers,
        totalWithdrawal,
        botSettings.currency,
      ),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: informationKeyboard(contacts),
        },
      },
    );
    return;
  }

  @Action('top-ref-users')
  async topRefUsers(@Ctx() ctx: SceneContext) {
    const notSubsChannels = await this.botService.checkChannelsSubs(ctx);

    if (notSubsChannels.length > 0) {
      return;
    }

    const user = await this.usersService.findByTelegramIdWithReferral(
      ctx.from.id.toString(),
    );

    if (!user) {
      await this.usersService.create({
        telegramId: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      await this.botService.checkChannelsSubs(ctx, 'first');
      return;
    }

    const botSettings = {
      currency: this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY),
      reward: this.configService.get(ENV_NAMES.REWARD_FOR_A_FRIEND),
      botUsername: this.configService.get(ENV_NAMES.TELEGRAM_BOT_USERNAME),
    };

    const topRefs = await this.usersService.getTopRefsUsers();

    await ctx.reply(BotMessages.topRefs(topRefs), {
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
      reply_markup: {
        inline_keyboard: topRefsKeyboard(
          user.referral.code,
          botSettings.botUsername,
        ),
      },
    });
    return;
  }
}
