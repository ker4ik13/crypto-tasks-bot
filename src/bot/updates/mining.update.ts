import { CheckSubscription, CheckWarnings } from '@/auth/decorators';
import { SponsorsService, UsersService } from '@/crud';
import { MiningService } from '@/crud/mining';
import { UsersFindService } from '@/crud/users/users-find.service';
import { ENV_NAMES } from '@/lib/common';
import { ConfigService } from '@nestjs/config';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { SceneContext } from 'telegraf/scenes';
import { BotService } from '../bot.service';
import { miningKeyboard, miningStartKeyboard } from '../keyboards';
import { BotMiningMessages } from '../messages/bot-mining.messages';

@Update()
export class MiningUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly usersService: UsersService,
    private readonly usersFindService: UsersFindService,
    private readonly configService: ConfigService,
    private readonly sponsorsService: SponsorsService,
    private readonly miningService: MiningService,
  ) {}

  @Action('mining')
  @CheckSubscription()
  @CheckWarnings()
  async miningMenu(@Ctx() ctx: SceneContext) {
    const isUserExist = await this.usersService.isUserExist(ctx.from.id);

    if (!isUserExist) {
      await this.usersService.create({
        telegramId: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        languageCode: ctx.from.language_code,
      });

      this.botService.checkChannelsSubs(ctx, 'next');
      return;
    }
    await this.miningService.refreshMining(ctx.from.id.toString());
    const user = await this.usersFindService.findByTelegramId(
      ctx.from.id.toString(),
    );

    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);
    const miningSize = this.configService.get(ENV_NAMES.MINING_SIZE_PER_SECOND);

    if (user.mining) {
      await ctx.reply(
        BotMiningMessages.miningStats(user.mining, miningSize, currency),
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: miningKeyboard(currency),
          },
        },
      );
    } else {
      await ctx.reply(BotMiningMessages.miningNotStart(miningSize, currency), {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: miningStartKeyboard(),
        },
      });
    }

    return;
  }

  @Action('mining|start')
  @CheckWarnings()
  @CheckSubscription()
  async startMining(@Ctx() ctx: Context) {
    const userStartMining = await this.miningService.startMining(
      ctx.from.id.toString(),
    );

    const miningSize = this.configService.get(ENV_NAMES.MINING_SIZE_PER_SECOND);
    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);

    await ctx.reply(
      BotMiningMessages.miningStats(
        userStartMining.mining,
        miningSize,
        currency,
      ),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: miningKeyboard(currency),
        },
      },
    );

    return;
  }

  @Action('mining|refresh')
  @CheckWarnings()
  @CheckSubscription()
  async refreshMining(@Ctx() ctx: Context) {
    const updatedMiningUser = await this.miningService.refreshMining(
      ctx.from.id.toString(),
    );

    const miningSize = this.configService.get(ENV_NAMES.MINING_SIZE_PER_SECOND);
    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);

    await ctx.editMessageText(
      BotMiningMessages.miningStats(
        updatedMiningUser.mining,
        miningSize,
        currency,
      ),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: miningKeyboard(currency),
        },
      },
    );

    return;
  }

  @Action('mining|collect')
  @CheckWarnings()
  @CheckSubscription()
  async collectMining(@Ctx() ctx: Context) {
    const updatedMiningUser = await this.miningService.collectMining(
      ctx.from.id.toString(),
    );

    const miningSize = this.configService.get(ENV_NAMES.MINING_SIZE_PER_SECOND);
    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);

    await ctx.editMessageText(
      BotMiningMessages.miningStats(
        updatedMiningUser.mining,
        miningSize,
        currency,
      ),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: miningKeyboard(currency),
        },
      },
    );

    return;
  }
}
