import type { SceneContext } from 'telegraf/scenes';

// 24.10.2024 / v 1.0.0
// Класс, который помогает проверить подписки на телеграм каналлы
export class ChannelSubHelper {
  static async checkSub(
    ctx: SceneContext,
    channels: string[],
  ): Promise<string[]> {
    const notSubChannels: string[] = [];

    channels.map(async (channel) => {
      const member = await ctx.telegram.getChatMember(channel, ctx.from.id);

      if (
        member.status != 'member' &&
        member.status != 'administrator' &&
        member.status != 'creator'
      ) {
        notSubChannels.push(channel);
        return false;
      } else {
        return true;
      }
    });

    return notSubChannels;
  }
}
