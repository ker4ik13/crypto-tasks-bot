import { adminChannelKeyboard, adminMenuKeyboard } from '@/bot/keyboards/admin';
import { createChannelSkipKeyboard } from '@/bot/keyboards/admin/channel';
import { BotAdminMessages } from '@/bot/messages';
import { SponsorsService, UsersFindService } from '@/crud';
import { ENV_NAMES } from '@/lib/common';
import { getMessageFromCtx, getValueFromAction } from '@/lib/helpers';
import { emojis } from '@/lib/utils';
import { ConfigService } from '@nestjs/config';
import { SponsorChannelType } from '@prisma/client';
import { Action, Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { WizardContext } from 'telegraf/scenes';

@Wizard('create-channel')
export class CreateChannelScene {
  private channelName: string;
  private channelLink: string;
  private channelSlug: string;
  private isActive: boolean;
  private expirationDate: string;
  private sponsorName: string;
  private sponsorLink: string;
  private reward: number;
  private type: SponsorChannelType;

  constructor(
    private readonly sponsorsService: SponsorsService,
    private readonly usersFindService: UsersFindService,
    private readonly configService: ConfigService,
  ) {}

  @Action(/create-channel-step\|(\d+)/)
  async goToCreateAvailable(@Ctx() ctx: WizardContext & any): Promise<void> {
    const step = +getValueFromAction(ctx, 1);
    ctx.wizard.selectStep(step - 1);
    ctx.wizard.step(ctx);
    return;
  }

  @WizardStep(1)
  async enterName(@Ctx() ctx: WizardContext): Promise<void> {
    await ctx.reply(`${emojis.passport} <b>Введите название канала:</b>`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: createChannelSkipKeyboard(),
      },
    });
    ctx.wizard.next();
    return;
  }

  @WizardStep(2)
  async enterLink(@Ctx() ctx: WizardContext): Promise<void> {
    this.channelName = getMessageFromCtx(ctx);

    console.log(this.channelName);

    await ctx.reply(`${emojis.link} Введите ссылку на канал:`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: createChannelSkipKeyboard(),
      },
    });
    ctx.wizard.next();
    return;
  }

  @WizardStep(3)
  async enterSlug(@Ctx() ctx: WizardContext): Promise<void> {
    this.channelLink = getMessageFromCtx(ctx);

    console.log(this.channelLink);

    await ctx.reply(
      `${emojis.link} Введите username канала вида username (ник без @):\n\n${emojis.info} Если канал приватный, введите id канала. Его можно получить в web версии Telegram. Например: <b>-1002403715063</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: createChannelSkipKeyboard(),
        },
      },
    );
    ctx.wizard.next();
    return;
  }

  @WizardStep(4)
  async enterExpirationDate(@Ctx() ctx: WizardContext): Promise<void> {
    this.channelSlug = getMessageFromCtx(ctx);

    console.log(this.channelSlug);

    await ctx.reply(
      `${emojis.link} Введите дату истекания:\n\n${emojis.info} Формат: <b>2022-12-31</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: createChannelSkipKeyboard(),
        },
      },
    );
    ctx.wizard.next();
    return;
  }

  @WizardStep(5)
  async enterSponsorName(@Ctx() ctx: WizardContext): Promise<void> {
    this.expirationDate = getMessageFromCtx(ctx);

    console.log(this.expirationDate);

    await ctx.reply(`${emojis.link} Введите имя спонсора:`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: createChannelSkipKeyboard(6),
      },
    });
    ctx.wizard.next();
    return;
  }

  @WizardStep(6)
  async enterSponsorLink(@Ctx() ctx: WizardContext): Promise<void> {
    const sponsorName = getMessageFromCtx(ctx);

    if (sponsorName) {
      this.sponsorName = sponsorName;
    } else {
      this.sponsorName = ctx.from.first_name || ctx.from.username;
    }

    console.log(this.sponsorLink);

    await ctx.reply(`${emojis.link} Введите ссылку на спонсора:`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: createChannelSkipKeyboard(7),
      },
    });
    ctx.wizard.next();
    return;
  }

  @WizardStep(7)
  async enterReward(@Ctx() ctx: WizardContext): Promise<void> {
    const sponsorLink = getMessageFromCtx(ctx);

    if (sponsorLink) {
      this.sponsorLink = sponsorLink;
    } else {
      this.sponsorLink = `https://t.me/${ctx.from.username}`;
    }

    console.log(this.sponsorLink);

    await ctx.reply(
      `${emojis.link} Введите награду за подписку на канал:\n\n${emojis.info} Например: <b>0.01</b>\n\n${emojis.warning} За каналы, которые добавлены в Старт, награда не добавляется`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: createChannelSkipKeyboard(),
        },
      },
    );
    ctx.wizard.next();
    return;
  }

  @WizardStep(8)
  async enterType(@Ctx() ctx: WizardContext): Promise<void> {
    this.reward = +getMessageFromCtx(ctx);

    console.log(this.reward);

    await ctx.reply(
      `${emojis.link} Введите тип канала:\n\n${emojis.info} Типы канала: <b>start, task, all</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: createChannelSkipKeyboard(),
        },
      },
    );
    ctx.wizard.next();
    return;
  }

  @WizardStep(9)
  async final(@Ctx() ctx: WizardContext): Promise<void> {
    this.type = getMessageFromCtx(ctx) as SponsorChannelType;
    this.isActive = false;
    console.log(this.type);

    const newChannel = await this.sponsorsService.create({
      channelLink: this.channelLink,
      channelName: this.channelName,
      channelSlug: this.channelSlug,
      expirationDate: this.expirationDate,
      reward: this.reward,
      sponsorLink: this.sponsorLink,
      sponsorName: this.sponsorName,
      type: this.type,
      isActive: this.isActive,
    });

    console.log(newChannel);

    const currency = await this.configService.get(
      ENV_NAMES.TELEGRAM_BOT_CURRENCY,
    );

    await ctx.reply(BotAdminMessages.channel(newChannel, currency), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: adminChannelKeyboard(newChannel),
      },
    });
    return await ctx.scene.leave();
  }

  @Action('cancel')
  async exit(@Ctx() ctx: WizardContext) {
    await ctx
      .answerCbQuery()
      .catch(() =>
        ctx.reply(`${emojis.warning} Произошла ошибка, попробуйте раз`),
      );
    await ctx.reply(`${emojis.cross} Отменено`);
    const user = await this.usersFindService.findByTelegramId(
      ctx.from.id.toString(),
    );
    await ctx.reply(BotAdminMessages.menu(user), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: adminMenuKeyboard(),
      },
    });
    return await ctx.scene.leave();
  }
}
